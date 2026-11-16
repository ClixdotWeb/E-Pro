import Link from "next/link";
import type { Metadata } from "next";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Your account" };

/**
 * Signed-in shell, designed against stub data. Once Auth.js is wired,
 * this becomes a server component that redirects to /login when there
 * is no session and reads real orders for the session user.
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

export default function AccountPage() {
  return (
    <div className="page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Signed in</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi">
            Your account
          </h1>
        </div>
        <button
          type="button"
          className="rounded-[var(--r-md)] border border-hairline px-4 py-2 text-[13px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* nav */}
        <nav className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {[
              ["Orders", true],
              ["Addresses", false],
              ["Profile", false],
              ["Saved designs", false],
            ].map(([label, active]) => (
              <li key={String(label)}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  className={`w-full whitespace-nowrap rounded-[var(--r-sm)] px-3 py-2 text-left text-[13px] transition-colors ${
                    active
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-text-mid hover:bg-surface-2 hover:text-text-hi"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* orders */}
        <section>
          <h2 className="text-sm font-semibold text-text-hi">Order history</h2>

          <ul className="mt-4 space-y-3">
            {ORDERS.map((o) => (
              <li key={o.orderNumber} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-text-hi">
                      {o.orderNumber}
                    </p>
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

                  <div className="flex gap-2">
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
      </div>
    </div>
  );
}
