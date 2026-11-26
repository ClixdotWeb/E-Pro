import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell, SocialAuthButtons } from "@/components/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to see your orders, invoices and saved devices.",
  robots: { index: false, follow: false },
};

/**
 * Sign-in screen.
 *
 * Already signed in? There is nothing here for you, so go on to the
 * account - or to wherever you were headed when you were asked.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next } = await searchParams;
  const to = typeof next === "string" && next.startsWith("/") ? next : "/account";

  const session = await auth();
  if (session?.user) redirect(to);

  return (
    <AuthShell
      kicker="Welcome back"
      title="Sign in to your account"
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>{" "}
          — or{" "}
          <Link href="/find" className="text-accent hover:underline">
            just start shopping
          </Link>
          .
        </>
      }
    >
      <SignInForm next={to} />

      <div className="mt-6">
        <SocialAuthButtons verb="Sign in" />
      </div>
    </AuthShell>
  );
}
