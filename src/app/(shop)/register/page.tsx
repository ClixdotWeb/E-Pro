import Link from "next/link";
import type { Metadata } from "next";
import {
  AuthField,
  AuthShell,
  SocialAuthButtons,
} from "@/components/AuthShell";

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
export default function RegisterPage() {
  return (
    <AuthShell
      kicker="Join us"
      title="Create your account"
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
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            id="firstName"
            label="First name"
            autoComplete="given-name"
            required
          />
          <AuthField
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            required
          />
        </div>

        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          hint="Receipts and tracking links go here."
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
        />

        <label className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
          />
          <span className="text-[12px] leading-relaxed text-text-mid">
            I agree to the{" "}
            <Link href="/policies/terms" className="text-accent hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link
              href="/policies/privacy"
              className="text-accent hover:underline"
            >
              privacy policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Create account
        </button>
      </form>

      <div className="mt-6">
        <SocialAuthButtons verb="Sign up" />
      </div>
    </AuthShell>
  );
}
