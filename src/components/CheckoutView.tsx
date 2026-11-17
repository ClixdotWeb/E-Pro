"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogMedia } from "./CatalogMedia";
import { formatPaise } from "@/lib/money";
import { calculateTotals } from "@/lib/pricing";
import type { CartLine } from "./CartView";

/**
 * Checkout in the live theme's layout: a single column of steps with a
 * sticky order summary alongside.
 *
 * The payment step is deliberately gateway-neutral. Which gateway this
 * store will use has not been decided, so this component is told only a
 * display name and whether payments are live; it never imports a
 * gateway SDK. When the decision is made, the only change here is the
 * SDK handoff inside `pay()`.
 *
 * Nothing is charged. There is no order row to charge against yet.
 */

export type PaymentInfo = {
  displayName: string;
  live: boolean;
};

const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export function CheckoutView({
  lines,
  payment,
}: {
  lines: CartLine[];
  payment: PaymentInfo;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      calculateTotals(
        lines.map((l) => ({
          variantId: l.id,
          quantity: l.quantity,
          unitInPaise: l.unitInPaise,
        })),
      ),
    [lines],
  );

  function pay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(
      "No order was placed. Checkout needs a database connection and a payment gateway before it can take money.",
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-text-hi">
          Nothing to check out
        </h2>
        <Link
          href="/find"
          className="mt-6 inline-block rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink"
        >
          Find my device
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={pay}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-12"
    >
      <div className="space-y-8">
        {/* ---- 1. contact ---- */}
        <Step n={1} title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              hint="Order confirmation and tracking go here."
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              required
              inputMode="numeric"
              pattern="[0-9]{10}"
              hint="10 digits. Used for delivery updates."
            />
          </div>
        </Step>

        {/* ---- 2. shipping ---- */}
        <Step n={2} title="Shipping address">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name" autoComplete="given-name" required />
            <Field id="lastName" label="Last name" autoComplete="family-name" required />
          </div>

          <div className="mt-4 grid gap-4">
            <Field
              id="line1"
              label="Address"
              autoComplete="address-line1"
              required
            />
            <Field
              id="line2"
              label="Apartment, landmark (optional)"
              autoComplete="address-line2"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field id="city" label="City" autoComplete="address-level2" required />

            <div>
              <label htmlFor="state" className="block text-[12px] text-text-low">
                State
              </label>
              <select
                id="state"
                name="state"
                defaultValue="Kerala"
                autoComplete="address-level1"
                required
                className="mt-1.5 w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi focus:border-accent"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Field
              id="pincode"
              label="PIN code"
              autoComplete="postal-code"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
            />
          </div>
        </Step>

        {/* ---- 3. payment ---- */}
        <Step n={3} title="Payment">
          {payment.live ? (
            <>
              <div className="flex items-start gap-3 rounded-[var(--r-md)] border border-hairline bg-surface-1 px-4 py-3.5">
                <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-medium text-text-hi">
                    Secure payment via {payment.displayName}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-low">
                    UPI, cards, net banking and wallets. Card details are
                    entered on the gateway&apos;s own page — they never reach
                    this site.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-text-low">
                The amount charged is recalculated on our server from the
                catalog price of each item. Nothing your browser sends can
                change it.
              </p>
            </>
          ) : (
            <div className="rounded-[var(--r-md)] border border-warning/35 bg-warning/10 px-4 py-3.5">
              <p className="text-[13px] font-medium text-text-hi">
                No payment gateway configured yet
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-text-mid">
                The gateway has not been chosen. The store runs on a local
                test gateway, so this button will not take money. Set
                PAYMENT_PROVIDER and its credentials to go live — the rest of
                checkout does not change.
              </p>
            </div>
          )}
        </Step>

        {notice && (
          <p
            role="status"
            className="rounded-[var(--r-md)] border border-hairline bg-surface-1 px-4 py-3 text-[12px] leading-relaxed text-text-mid"
          >
            {notice}
          </p>
        )}
      </div>

      {/* ---- summary ---- */}
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-text-hi">
            {lines.length} item{lines.length === 1 ? "" : "s"}
          </h2>

          <ul className="mt-4 space-y-3.5">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-3">
                <CatalogMedia
                  src={l.imageUrl}
                  seed={l.productSlug}
                  alt={l.productTitle}
                  sizes="56px"
                  className="h-14 w-14 shrink-0 rounded-[var(--r-sm)] border border-hairline"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-text-hi">
                    {l.productTitle}
                  </p>
                  <p className="truncate text-[11px] text-text-low">
                    {l.variantTitle} · ×{l.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] tabular-nums text-text-hi">
                  {formatPaise(l.unitInPaise * l.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-hairline pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-mid">Subtotal</dt>
              <dd className="tabular-nums text-text-hi">
                {formatPaise(totals.subtotalInPaise)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-mid">Shipping</dt>
              <dd className="tabular-nums text-text-hi">
                {totals.shippingInPaise === 0
                  ? "Free"
                  : formatPaise(totals.shippingInPaise)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-low">GST (18%, included)</dt>
              <dd className="tabular-nums text-text-low">
                {formatPaise(totals.taxInPaise)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="text-sm font-semibold text-text-hi">Total</span>
            <span className="text-lg font-semibold tabular-nums text-text-hi">
              {formatPaise(totals.totalInPaise)}
            </span>
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-[var(--r-md)] bg-accent px-5 py-3.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            {payment.live
              ? `Pay ${formatPaise(totals.totalInPaise)}`
              : "Place order (disabled)"}
          </button>

          <Link
            href="/cart"
            className="mt-2.5 block text-center text-[12px] text-text-low hover:text-text-hi"
          >
            ← Back to cart
          </Link>
        </div>
      </aside>
    </form>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2.5 text-sm font-semibold text-text-hi">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] tabular-nums text-text-mid">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
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
