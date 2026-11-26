import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { cartToken } from "@/lib/cart";

/**
 * Sign-in.
 *
 * Email and password, kept in our own User table, because the shop
 * sells to people who will not have a Google account tied to the
 * phone number the courier calls. Google can be added later as
 * another provider without changing anything below it.
 *
 * The session is a JWT, not a database row. That is not a preference:
 * the Credentials provider cannot use the database strategy, because
 * Auth.js only creates a session row for providers it has verified
 * itself. The role rides on the token so that an admin check costs
 * nothing, and `trigger === "update"` re-reads it, so demoting
 * someone takes effect on their next request rather than whenever
 * their token happens to expire.
 *
 * A failed sign-in says one thing for a wrong address and a wrong
 * password alike. Telling them apart tells a stranger which of our
 * customers' email addresses are real.
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const email = String(raw?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(raw?.password ?? "");
        if (!email || !password) return null;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            passwordHash: true,
          },
        });

        // Users created by an OAuth provider have no password. Compare
        // against a dummy hash anyway so that "no such account" and
        // "wrong password" take the same time to answer.
        const hash =
          user?.passwordHash ??
          "$2a$10$ewpJ4FzqYQ0MhsVbRz3jLuBZ4kH3u8RPbd1A2cO9k6Zh0hGQ1Qm5W";

        const ok = await compare(password, hash);
        if (!user?.passwordHash || !ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    /**
     * Whoever signs in inherits the cart their browser was already
     * carrying. Someone who fills a cart and then makes an account
     * should not find it empty on the other side - the cookie
     * already points at the row, all that is missing is the userId.
     *
     * It runs here rather than in the sign-in action because this is
     * the one place that fires on every successful sign-in however
     * it was started, and because a failure to move a cart must
     * never fail the sign-in.
     */
    async signIn({ user }) {
      try {
        const token = await cartToken();
        if (!token || !user.id) return;
        await db.cart.updateMany({
          where: { token, userId: null },
          data: { userId: user.id },
        });
      } catch {
        // Not worth failing a sign-in over.
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
      } else if (trigger === "update" && token.id) {
        const fresh = await db.user.findUnique({
          where: { id: String(token.id) },
          select: { role: true, name: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.name = fresh.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "CUSTOMER");
      }
      return session;
    },
  },
});

/**
 * Who is signed in, with the role read from the database rather than
 * the token.
 *
 * The token carries a role too, and it is the right thing for
 * anything cosmetic - but it is a snapshot taken at sign-in and can
 * be thirty days stale. Taking someone's access away has to work
 * now, not whenever their token happens to expire, so every decision
 * that gates the dashboard asks the database. It is one lookup on a
 * primary key.
 */
export async function currentStaff(): Promise<{
  id: string;
  name: string | null;
  email: string;
  role: string;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
}

export function isStaffRole(role: string | undefined): boolean {
  return role === "ADMIN" || role === "STAFF";
}
