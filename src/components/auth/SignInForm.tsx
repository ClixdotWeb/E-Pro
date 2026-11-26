"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AuthField } from "@/components/AuthShell";
import { signInWithPassword } from "@/app/auth-actions";

/**
 * Sign-in form.
 *
 * The markup is the one the page already had; what is new is that it
 * posts. On success the action redirects, so there is no success
 * state to render here - only the one failure message, which is
 * deliberately the same whether the address is unknown or the
 * password is wrong.
 *
 * `next` carries where the customer was headed before they were
 * asked to sign in, so checking out does not dump them on the
 * account page with an empty cart page behind them.
 */
export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInWithPassword, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

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

      {state && (
        <p role="alert" className="text-[12px] font-bold text-danger">
          {state.message}
        </p>
      )}

      <Submit>Sign in</Submit>
    </form>
  );
}

export function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "One moment…" : children}
    </button>
  );
}
