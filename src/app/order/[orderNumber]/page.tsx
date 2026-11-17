import Link from "next/link";
import type { Metadata } from "next";
import { CatalogMedia } from "@/components/CatalogMedia";
import { formatPaise } from "@/lib/money";
import { calculateTotals } from "@/lib/pricing";
import {
  BUYABLE_OFFERS,
  getProductBySlug,
  optionLabelFor,
} from "@/lib/realCatalog";

/**
 * Order confirmation — where checkout lands after a successful payment.
 *
 * This was the one gap in the purchase flow: checkout had nowhere to
 * send anyone. It is also the page a customer screenshots and comes
 * back to, so it carries the order number, what happens next, and the
 * delivery estimate rather than just "thank you".
 *
 * Rendered from stub data until orders exist in the database. When they
 * do, this becomes a server component that looks the order up by number
 * and 404s on anything else.
 */

export async function generateMetadata({
  params,
}: PageProps<"/order/[orderNumber]">): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber}`,
    robots: { index: false, follow: false },
  };
}

function stubLines() {
  return BUYABLE_OFFERS.filter((o) => o.available && o.imageUrl)
    .slice(0, 2)
    .map((o, i) => {
      const product = getProductBySlug(o.productSlug);
      return {
        id: o.id,
        productSlug: o.productSlug,
        productTitle: o.productTitle,
        variantTitle: o.variantTitle,
        optionLabel: product ? optionLabelFor(product) : "Option",
        unitInPaise: o.priceInPaise,
        imageUrl: o.imageUrl,
        quantity: i === 0 ? 1 : 2,
      };
    });
}

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const lines = stubLines();

  const totals = calculateTotals(
    lines.map((l) => ({
      variantId: l.id,
      quantity: l.quantity,
      unitInPaise: l.unitInPaise,
    })),
  );

  return (
    <div className="page max-w-3xl py-12 md:py-16">
      {/* confirmation */}
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text-hi">
          Order confirmed
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-mid">
          Thanks — we have your order and the receipt is on its way to your
          email.
        </p>

        <p className="mt-5 inline-block rounded-[var(--r-md)] border border-hairline bg-surface-1 px-4 py-2.5 font-mono text-sm font-semibold text-text-hi">
          {orderNumber}
        </p>
      </div>

      {/* what happens next */}
      <section className="mt-12">
        <h2 className="text-sm font-semibold text-text-hi">
          What happens next
        </h2>

        <ol className="mt-5 space-y-5 border-l border-hairline pl-6">
          {[
            {
              title: "We cut your skin",
              body: "Each one is plotted to order, so nothing sits on a shelf. Usually same or next working day.",
            },
            {
              title: "Dispatch in 1–2 business days",
              body: "You get a tracking link by email and WhatsApp the moment it leaves us.",
            },
            {
              title: "Delivery",
              body: "2–4 days to metros after dispatch, 4–7 for the rest of India.",
            },
          ].map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[31px] grid h-[22px] w-[22px] place-items-center rounded-full border border-hairline bg-surface-0 font-mono text-[10px] text-accent">
                {i + 1}
              </span>
              <p className="text-sm font-semibold text-text-hi">{s.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-mid">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* summary */}
      <section className="card mt-10 p-5">
        <h2 className="text-sm font-semibold text-text-hi">Order summary</h2>

        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-3.5 py-3.5">
              <CatalogMedia
                src={l.imageUrl}
                seed={l.productSlug}
                alt={l.productTitle}
                sizes="64px"
                className="h-16 w-16 shrink-0 rounded-[var(--r-sm)] border border-hairline"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${l.productSlug}`}
                  className="truncate text-[13px] font-medium text-text-hi hover:text-accent"
                >
                  {l.productTitle}
                </Link>
                <p className="mt-0.5 text-[11px] text-text-low">
                  {l.optionLabel}: {l.variantTitle} · ×{l.quantity}
                </p>
              </div>
              <p className="shrink-0 text-[13px] tabular-nums text-text-hi">
                {formatPaise(l.unitInPaise * l.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2.5 text-[13px]">
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
          <span className="text-sm font-semibold text-text-hi">Paid</span>
          <span className="text-lg font-semibold tabular-nums text-text-hi">
            {formatPaise(totals.totalInPaise)}
          </span>
        </div>
      </section>

      {/* actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/track?order=${orderNumber}`}
          className="rounded-[var(--r-md)] bg-accent px-5 py-3 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Track this order
        </Link>
        <Link
          href="/account"
          className="rounded-[var(--r-md)] border border-hairline px-5 py-3 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
        >
          View all orders
        </Link>
        <Link
          href="/find"
          className="rounded-[var(--r-md)] border border-hairline px-5 py-3 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
        >
          Keep shopping
        </Link>
      </div>

      <p className="mt-8 text-center text-[12px] leading-relaxed text-text-low">
        Something wrong with the order?{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Tell us within 24 hours
        </Link>{" "}
        and we can still change it before it is cut.
      </p>
    </div>
  );
}
