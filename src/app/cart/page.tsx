import Link from "next/link";
import type { Metadata } from "next";
import { SkinVisual } from "@/components/SkinVisual";
import { getProduct, variantPriceInPaise } from "@/lib/catalog";
import { calculateTotals, FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/pricing";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Cart" };

/**
 * Design pass with a stubbed cart. On wiring, this becomes a server
 * component reading the cart by its cookie token, and totals come from
 * calculateTotals() over DB prices — which is already the case here.
 */
const STUB = [
  { productSlug: "carbon-fibre-black", categorySlug: "phone", device: "iPhone 17 Pro", quantity: 1 },
  { productSlug: "leather-grain-cognac", categorySlug: "laptop", device: 'MacBook Pro 14" M4', quantity: 1 },
  { productSlug: "matte-midnight", categorySlug: "wireless-earbuds", device: "AirPods Pro 3", quantity: 2 },
];

export default function CartPage() {
  const lines = STUB.map((l) => {
    const product = getProduct(l.productSlug)!;
    const unitInPaise = variantPriceInPaise(product, l.categorySlug);
    return { ...l, product, unitInPaise };
  });

  const totals = calculateTotals(
    lines.map((l) => ({
      variantId: `${l.productSlug}:${l.categorySlug}`,
      quantity: l.quantity,
      unitInPaise: l.unitInPaise,
    })),
  );

  const toFreeShipping =
    FREE_SHIPPING_THRESHOLD_PAISE -
    (totals.subtotalInPaise - totals.discountInPaise);

  if (lines.length === 0) return <EmptyCart />;

  return (
    <div className="page py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-hi">
        Your cart
      </h1>
      <p className="mt-1.5 text-[13px] text-text-mid tabular-nums">
        {lines.length} {lines.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* lines */}
        <ul className="divide-y divide-hairline border-y border-hairline">
          {lines.map((l) => (
            <li key={`${l.productSlug}-${l.categorySlug}`} className="flex gap-4 py-5">
              <Link
                href={`/products/${l.product.slug}?device=${l.categorySlug}`}
                className="w-20 shrink-0 sm:w-24"
              >
                <SkinVisual product={l.product} shape="square" />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${l.product.slug}?device=${l.categorySlug}`}
                  className="text-sm font-medium text-text-hi hover:text-accent"
                >
                  {l.product.title}
                </Link>
                <p className="mt-0.5 text-[12px] text-text-mid">
                  Cut for {l.device}
                </p>
                <p className="mt-0.5 text-[12px] text-text-low tabular-nums">
                  {formatPaise(l.unitInPaise)} each
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded-[var(--r-sm)] border border-hairline">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 text-[13px] text-text-mid"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-[13px] tabular-nums text-text-hi">
                      {l.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 text-[13px] text-text-mid"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="text-[12px] text-text-low transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-sm font-semibold tabular-nums text-text-hi">
                {formatPaise(l.unitInPaise * l.quantity)}
              </p>
            </li>
          ))}
        </ul>

        {/* summary */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text-hi">
              Order summary
            </h2>

            {toFreeShipping > 0 ? (
              <div className="mt-4 rounded-[var(--r-md)] bg-accent-soft p-3">
                <p className="text-[12px] text-accent">
                  Add {formatPaise(toFreeShipping)} more for free shipping
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.min(
                        100,
                        ((totals.subtotalInPaise - totals.discountInPaise) /
                          FREE_SHIPPING_THRESHOLD_PAISE) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-[var(--r-md)] bg-success/10 p-3 text-[12px] text-success">
                Free shipping unlocked ✓
              </p>
            )}

            {/* discount code */}
            <form className="mt-4 flex gap-2">
              <label htmlFor="discount" className="sr-only">
                Discount code
              </label>
              <input
                id="discount"
                placeholder="Discount code"
                className="min-w-0 flex-1 rounded-[var(--r-sm)] border border-hairline bg-surface-0 px-3 py-2 text-[13px] text-text-hi placeholder:text-text-low"
              />
              <button
                type="submit"
                className="shrink-0 rounded-[var(--r-sm)] border border-hairline-strong px-3 py-2 text-[13px] font-medium text-text-hi hover:bg-surface-2"
              >
                Apply
              </button>
            </form>

            <dl className="mt-5 space-y-2.5 border-t border-hairline pt-5 text-[13px]">
              <Row label="Subtotal" value={formatPaise(totals.subtotalInPaise)} />
              {totals.discountInPaise > 0 && (
                <Row
                  label="Discount"
                  value={`− ${formatPaise(totals.discountInPaise)}`}
                  accent="success"
                />
              )}
              <Row
                label="Shipping"
                value={
                  totals.shippingInPaise === 0
                    ? "Free"
                    : formatPaise(totals.shippingInPaise)
                }
              />
              <div className="flex justify-between border-t border-hairline pt-3">
                <dt className="text-sm font-semibold text-text-hi">Total</dt>
                <dd className="text-sm font-semibold tabular-nums text-text-hi">
                  {formatPaise(totals.totalInPaise)}
                </dd>
              </div>
              <p className="text-[11px] text-text-low">
                Includes {formatPaise(totals.taxInPaise)} GST
              </p>
            </dl>

            <Link
              href="/checkout"
              className="mt-5 block rounded-[var(--r-md)] bg-accent py-3 text-center text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Checkout
            </Link>

            <p className="mt-3 text-center text-[11px] text-text-low">
              Secure payment via Razorpay · UPI, cards, netbanking
            </p>
          </div>

          <Link
            href="/collections/phone"
            className="mt-4 block text-center text-[13px] text-accent hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success";
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-mid">{label}</dt>
      <dd
        className={`tabular-nums ${
          accent === "success" ? "text-success" : "text-text-hi"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="page grid place-items-center py-28 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-text-low">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 7h12l1.2 13H4.8L6 7zM9 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      </div>
      <h1 className="mt-5 text-xl font-semibold text-text-hi">
        Your cart is empty
      </h1>
      <p className="mt-2 max-w-xs text-[13px] text-text-mid">
        Pick a design, choose your device model, and we&apos;ll cut it to fit.
      </p>
      <Link
        href="/collections/phone"
        className="mt-6 rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
      >
        Browse skins
      </Link>
    </div>
  );
}
