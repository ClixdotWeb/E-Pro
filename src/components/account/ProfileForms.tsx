"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword, updateProfile } from "@/app/auth-actions";

/**
 * The two forms on the profile page.
 *
 * They were one form with "Jayakrishnan R" typed into the defaults,
 * shown to every customer who signed in. Now they are filled from
 * the signed-in account and they save.
 *
 * Email is shown but not editable: it is the sign-in credential and
 * the address receipts have gone to, so changing it needs a
 * confirmation sent to the new address, which nothing sends yet. A
 * field that silently ignores what is typed into it is worse than a
 * field that says why it is locked.
 */

export function DetailsForm({
  firstName,
  lastName,
  email,
  phone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) {
  const [state, action] = useActionState(updateProfile, null);

  return (
    <form action={action} className="card mt-4 space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          defaultValue={firstName}
          autoComplete="given-name"
          required
        />
        <Field
          id="lastName"
          label="Last name"
          defaultValue={lastName}
          autoComplete="family-name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-[12px] text-text-low">
          Email
        </label>
        <input
          id="email"
          value={email}
          readOnly
          aria-describedby="email-hint"
          className="mt-1.5 w-full cursor-not-allowed rounded-[var(--r-md)] border border-hairline bg-surface-1 px-3.5 py-2.5 text-[13px] text-text-mid"
        />
        <p id="email-hint" className="mt-1 text-[11px] text-text-low">
          This is how you sign in. To change it, write to us.
        </p>
      </div>

      <Field
        id="phone"
        label="Phone"
        type="tel"
        defaultValue={phone}
        autoComplete="tel"
        inputMode="numeric"
        hint="10 digits. Used for delivery updates."
      />

      <Save label="Save changes" />
      <Result state={state} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, null);

  return (
    <form action={action} className="card mt-4 space-y-4 p-5">
      <Field
        id="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Field
        id="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />

      <Save label="Update password" subtle />
      <Result state={state} />
    </form>
  );
}

function Result({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;

  return (
    <p
      role="status"
      className={`text-[12px] font-semibold ${
        state.ok ? "text-success" : "text-danger"
      }`}
    >
      {state.message}
    </p>
  );
}

function Save({ label, subtle = false }: { label: string; subtle?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        subtle
          ? "rounded-[var(--r-md)] border border-hairline px-5 py-2.5 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong disabled:opacity-60"
          : "rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
      }
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function Field({
  id,
  label,
  hint,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] text-text-low">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1.5 w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[11px] text-text-low">
          {hint}
        </p>
      )}
    </div>
  );
}
