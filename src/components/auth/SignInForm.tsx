"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AuthField } from "@/components/auth/fields";
import { signInWithPassword } from "@/app/auth-actions";

/**
 * Sign-in form.
 *
 * On success the action redirects, so there is no success state to
 * render here - only the one failure message, which is deliberately
 * the same whether the address is unknown or the password is wrong.
 *
 * `next` carries where the customer was headed before they were
 * asked to sign in, so checking out does not dump them on the
 * account page with an empty cart page behind them.
 */
export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInWithPassword, null);

  return (
    <form action={action} className="space-y-5">
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
          <label
            htmlFor="password"
            className="block text-[12.5px] font-medium text-text-mid"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[12px] text-text-low transition-colors hover:text-accent"
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
          className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi transition-colors placeholder:text-text-low focus:border-accent focus:bg-surface-0 focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </div>

      {state && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-3 text-[12.5px] font-medium leading-relaxed text-danger"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden
            className="mt-0.5 shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5h.01" />
          </svg>
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
      className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-[14.5px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "One moment…" : children}
    </button>
  );
}
