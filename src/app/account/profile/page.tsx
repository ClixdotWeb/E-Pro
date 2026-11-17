import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

/**
 * Profile and account settings.
 *
 * Includes the delete-account control. It is easy to leave that out and
 * it is the one thing a person is entitled to be able to do without
 * emailing support, so it ships with the page rather than later.
 */
export default function AccountProfilePage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-text-hi">Your details</h2>

        <form className="card mt-4 space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name" defaultValue="Jayakrishnan" autoComplete="given-name" />
            <Field id="lastName" label="Last name" defaultValue="R" autoComplete="family-name" />
          </div>

          <Field
            id="email"
            label="Email"
            type="email"
            defaultValue="you@example.com"
            autoComplete="email"
            hint="Receipts and tracking links go here."
          />

          <Field
            id="phone"
            label="Phone"
            type="tel"
            defaultValue="98470 00000"
            autoComplete="tel"
            inputMode="numeric"
            hint="Used for delivery updates on WhatsApp."
          />

          <button
            type="submit"
            className="rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Save changes
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-hi">Password</h2>

        <form className="card mt-4 space-y-4 p-5">
          <Field
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters."
          />

          <button
            type="submit"
            className="rounded-[var(--r-md)] border border-hairline px-5 py-2.5 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
          >
            Update password
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-hi">Notifications</h2>

        <div className="card mt-4 divide-y divide-hairline p-5">
          {[
            ["orderUpdates", "Order updates", "Dispatch and delivery messages. Cannot be turned off.", true, true],
            ["newCuts", "New models and designs", "A message when we cut something new. About once a month.", true, false],
            ["offers", "Offers", "Discount codes and sales.", false, false],
          ].map(([id, title, body, checked, locked]) => (
            <label
              key={String(id)}
              className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <span>
                <span className="block text-[13px] font-medium text-text-hi">
                  {title}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-text-low">
                  {body}
                </span>
              </span>
              <input
                type="checkbox"
                name={String(id)}
                defaultChecked={Boolean(checked)}
                disabled={Boolean(locked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)] disabled:opacity-45"
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-danger">Danger zone</h2>

        <div className="mt-4 rounded-[var(--r-lg)] border border-danger/30 bg-danger/5 p-5">
          <p className="text-[13px] font-medium text-text-hi">
            Delete your account
          </p>
          <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-text-mid">
            This removes your profile, saved addresses and sign-in. Past
            orders are kept, because GST records have to be retained by law —
            they are detached from your profile instead.
          </p>
          <button
            type="button"
            className="mt-4 rounded-[var(--r-md)] border border-danger/50 px-4 py-2 text-[12px] font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            Delete account
          </button>
        </div>
      </section>
    </div>
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
