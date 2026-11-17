import Link from "next/link";
import type { Metadata } from "next";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

/**
 * Order history. Stub data until orders exist in the database; the
 * empty state below is what a new customer will actually see first, so
 * it is designed rather than left as a bare sentence.
 */
const ORDERS = [
  {
    orderNumber: "EPRO-1042",
    placedAt: "12 Nov 2026",
    status: "Shipped",
    totalInPaise: 231800,
    itemCount: 3,
    tracking: "DL1289347712",
  },
  {
    orderNumber: "EPRO-1017",
    placedAt: "28 Oct 2026",
    status: "Delivered",
    totalInPaise: 79900,
    itemCount: 1,
    tracking: "DL1288110043",
  },
  {
    orderNumber: "EPRO-0998",
    placedAt: "09 Oct 2026",
    status: "Delivered",
    totalInPaise: 148900,
    itemCount: 2,
    tracking: "DL1287554921",
  },
];

const STATUS_STYLE: Record<string, string> = {
  Shipped: "bg-accent-soft text-accent",
  Delivered: "bg-success/15 text-success",
  Processing: "bg-surface-3 text-text-mid",
  Cancelled: "bg-danger/15 text-danger",
};

export default function AccountOrdersPage() {
  if (ORDERS.length === 0) return <EmptyOrders />;

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-hi">Order history</h2>

      <ul className="mt-4 space-y-3">
        {ORDERS.map((o) => (
          <li key={o.orderNumber} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link
                  href={`/order/${o.orderNumber}`}
                  className="font-mono text-sm font-semibold text-text-hi hover:text-accent"
                >
                  {o.orderNumber}
                </Link>
                <p className="mt-1 text-[12px] text-text-low">
                  Placed {o.placedAt} · {o.itemCount}{" "}
                  {o.itemCount === 1 ? "item" : "items"}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  STATUS_STYLE[o.status] ?? STATUS_STYLE.Processing
                }`}
              >
                {o.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-4">
              <p className="text-sm font-semibold tabular-nums text-text-hi">
                {formatPaise(o.totalInPaise)}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/track?awb=${o.tracking}`}
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                >
                  Track
                </Link>
                <button
                  type="button"
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                >
                  Invoice
                </button>
                <button
                  type="button"
                  className="rounded-[var(--r-sm)] bg-accent px-3 py-1.5 text-[12px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
                >
                  Reorder
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-text-hi">No orders yet</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-mid">
        When you order a skin it will show up here with its tracking link and
        GST invoice.
      </p>
      <Link
        href="/find"
        className="mt-6 inline-block rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        Find my device
      </Link>
    </div>
  );
}
