import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { AuthField } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Tell us the email on your account and we will send a link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
          .
        </>
      }
    >
      <form className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />

        <button
          type="submit"
          className="w-full rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Send reset link
        </button>
      </form>

      {/* Saying "if an account exists" rather than confirming it does is
          deliberate: a reset form that distinguishes the two lets anyone
          test whether an email is registered here. */}
      <p className="mt-5 text-[11px] leading-relaxed text-text-low">
        If an account exists for that address, the link will arrive within a
        few minutes. Check spam before trying again.
      </p>

      <p className="mt-6 border-t border-hairline pt-5 text-[12px] text-text-low">
        Still stuck?{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Message us on WhatsApp
        </Link>{" "}
        and we will sort it out.
      </p>
    </AuthShell>
  );
}
