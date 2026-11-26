import { redirect } from "next/navigation";
import { AccountNav } from "@/components/AccountNav";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

/**
 * Account area frame.
 *
 * The session check lives here rather than on each of the three
 * pages inside it - one place to be wrong instead of three, and a
 * page added later is protected by being added.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account");

  const name = session.user.name ?? session.user.email ?? "there";

  return (
    <div className="page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Signed in as {name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi">
            Your account
          </h1>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
