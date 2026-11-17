import Link from "next/link";
import type { Metadata } from "next";
import {
  AuthField,
  AuthShell,
  SocialAuthButtons,
} from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to see your orders, invoices and saved devices.",
  robots: { index: false, follow: false },
};

/**
 * Sign-in screen.
 *
 * The form posts nowhere yet — Auth.js is installed but not wired, and
 * wiring it needs a database. The markup is final so that connecting it
 * is a matter of adding a Server Action to `action`, not a redesign.
 */
export default function LoginPage() {
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
      <form className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="block text-[12px] text-text-low">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-text-low hover:text-accent"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5 w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi focus:border-accent"
          />
        </div>

        <label className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-3.5 w-3.5 accent-[var(--accent)]"
          />
          <span className="text-[12px] text-text-mid">Keep me signed in</span>
        </label>

        <button
          type="submit"
          className="w-full rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Sign in
        </button>
      </form>

      <div className="mt-6">
        <SocialAuthButtons verb="Sign in" />
      </div>
    </AuthShell>
  );
}
