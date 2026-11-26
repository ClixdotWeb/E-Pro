import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/auth/fields";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create an Epro Gadgets account to track orders and reorder in one tap.",
  robots: { index: false, follow: false },
};

/**
 * Registration screen.
 *
 * Asks for the minimum that is actually needed: a name to put on the
 * parcel, an email for the receipt, a password. The phone number is
 * collected at checkout where it is genuinely required for delivery,
 * not here where it would just be friction.
 */
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <AuthShell
      kicker="Join us"
      title="Create your account"
      subtitle="Takes a minute. Everything you order after this is one tap to find again."
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
          .
        </>
      }
    >
      <RegisterForm />

      <div className="mt-6">
        <SocialAuthButtons verb="Sign up" />
      </div>
    </AuthShell>
  );
}
