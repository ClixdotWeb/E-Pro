import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/auth/fields";
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
      title="Sign in to your account"
      subtitle="Your orders, your saved devices and your invoices, all in one place."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>
          .
        </>
      }
    >
      <SignInForm next={to} />
      <SocialAuthButtons verb="Sign in" />
    </AuthShell>
  );
}
