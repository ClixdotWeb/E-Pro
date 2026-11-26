"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthField } from "@/components/auth/fields";
import { Submit } from "./SignInForm";
import { registerAccount } from "@/app/auth-actions";

/**
 * Create an account.
 *
 * Two name fields because that is what the page asked for and it is
 * what a courier label wants; they are joined before the action sees
 * them, because the database stores one name and splitting it back
 * apart later is a worse problem than joining it now.
 *
 * Registering signs you in, so there is no success state here
 * either - the action redirects to the account page.
 */
export function RegisterForm() {
  const [state, action] = useActionState(registerAccount, null);

  return (
    <form
      action={(form) => {
        const first = String(form.get("firstName") ?? "").trim();
        const last = String(form.get("lastName") ?? "").trim();
        form.set("name", [first, last].filter(Boolean).join(" "));
        return action(form);
      }}
      className="space-y-5"
    >
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
          <Link href="/policies/privacy" className="text-accent hover:underline">
            privacy policy
          </Link>
          .
        </span>
      </label>

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

      <Submit>Create account</Submit>
    </form>
  );
}
