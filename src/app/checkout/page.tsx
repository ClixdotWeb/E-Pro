import Link from "next/link";
import type { Metadata } from "next";
import { SkinVisual } from "@/components/SkinVisual";
import { getProduct, variantPriceInPaise } from "@/lib/catalog";
import { calculateTotals } from "@/lib/pricing";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Checkout" };

const STUB = [
  { productSlug: "carbon-fibre-black", categorySlug: "phone", device: "iPhone 17 Pro", quantity: 1 },
  { productSlug: "leather-grain-cognac", categorySlug: "laptop", device: 'MacBook Pro 14" M4', quantity: 1 },
  { productSlug: "matte-midnight", categorySlug: "wireless-earbuds", device: "AirPods Pro 3", quantity: 2 },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

export default function CheckoutPage() {
  const lines = STUB.map((l) => {
    const product = getProduct(l.productSlug)!;
    return { ...l, product, unitInPaise: variantPriceInPaise(product, l.categorySlug) };
  });

  const totals = calculateTotals(
    lines.map((l) => ({
      variantId: `${l.productSlug}:${l.categorySlug}`,
      quantity: l.quantity,
      unitInPaise: l.unitInPaise,
    })),
  );

  return (
    <div className="page py-10">
      <nav aria-label="Breadcrumb" className="text-[12px] text-text-low">
        <Link href="/cart" className="hover:text-text-mid">
          Cart
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-text-mid">Checkout</span>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-hi">
        Checkout
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* form */}
        <form className="space-y-10">
          <Section step="1" title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" autoComplete="email" required full />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" required hint="For delivery updates on WhatsApp" />
            </div>
          </Section>

          <Section step="2" title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="fullName" autoComplete="name" required full />
              <Field label="Address line 1" name="line1" autoComplete="address-line1" required full />
              <Field label="Address line 2" name="line2" autoComplete="address-line2" full hint="Optional" />
              <Field label="City" name="city" autoComplete="address-level2" required />
              <Field label="PIN code" name="pincode" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{6}" />

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
                  State <span className="text-danger">*</span>
                </span>
                <select
                  name="state"
                  required
                  defaultValue="Kerala"
                  className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 flex items-start gap-2.5">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="text-[13px] text-text-mid">
                Billing address is the same as shipping
              </span>
            </label>
          </Section>

          <Section step="3" title="Payment">
            <div className="rounded-[var(--r-lg)] border border-accent bg-accent-soft p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--r-md)] bg-accent text-accent-ink">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-hi">
                    Razorpay Secure
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-mid">
                    UPI, credit &amp; debit cards, netbanking, wallets and EMI.
                    Card details are entered on Razorpay&apos;s PCI-DSS
                    environment — they never touch our servers.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["UPI", "Visa", "Mastercard", "RuPay", "Netbanking", "EMI"].map((m) => (
                      <span
                        key={m}
                        className="rounded border border-hairline bg-surface-0 px-2 py-0.5 text-[10px] font-medium text-text-mid"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-[var(--r-md)] bg-accent px-5 py-3.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Pay {formatPaise(totals.totalInPaise)}
            </button>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-text-low">
              By paying you agree to our{" "}
              <Link href="/policies/terms" className="text-accent hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/policies/returns" className="text-accent hover:underline">
                Return policy
              </Link>
              .
            </p>
          </Section>
        </form>

        {/* summary */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text-hi">
              {lines.length} items
            </h2>

            <ul className="mt-4 space-y-3.5">
              {lines.map((l) => (
                <li key={`${l.productSlug}-${l.categorySlug}`} className="flex gap-3">
                  <div className="relative w-14 shrink-0">
                    <SkinVisual product={l.product} shape="square" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-surface-3 px-1 text-[10px] font-semibold tabular-nums text-text-hi">
                      {l.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-text-hi">
                      {l.product.title}
                    </p>
                    <p className="truncate text-[11px] text-text-low">
                      {l.device}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] tabular-nums text-text-hi">
                    {formatPaise(l.unitInPaise * l.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-hairline pt-5 text-[13px]">
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
              <div className="flex justify-between border-t border-hairline pt-3">
                <dt className="text-sm font-semibold text-text-hi">Total</dt>
                <dd className="text-sm font-semibold tabular-nums text-text-hi">
                  {formatPaise(totals.totalInPaise)}
                </dd>
              </div>
              <p className="text-[11px] text-text-low">
                Includes {formatPaise(totals.taxInPaise)} GST · INR
              </p>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-text-hi">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline-strong font-mono text-[11px] text-text-mid">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  full,
  hint,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  full?: boolean;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi placeholder:text-text-low"
        {...rest}
      />
      {hint && (
        <span className="mt-1 block text-[11px] text-text-low">{hint}</span>
      )}
    </label>
  );
}
