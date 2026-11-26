import Link from "next/link";
import type { Metadata } from "next";
import { formatPaise } from "@/lib/money";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

/**
 * Order history, read from the database.
 *
 * It used to be three invented orders. A customer looking at someone
 * else's fiction is worse than a customer looking at an empty list,
 * and the empty state is what nearly everyone will see first, so it
 * is designed rather than left as a bare sentence.
 */

const STATUS_STYLE: Record<string, string> = {
  SHIPPED: "bg-accent-soft text-accent",
  DELIVERED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/15 text-danger",
  RETURNED: "bg-danger/15 text-danger",
};

function pretty(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = session?.user?.id
    ? await getOrdersForUser(session.user.id)
    : [];

  if (orders.length === 0) return <EmptyOrders />;

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-hi">Order history</h2>

      <ul className="mt-4 space-y-3">
        {orders.map((o) => (
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
                  Placed{" "}
                  {o.placedAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  STATUS_STYLE[o.status] ?? "bg-surface-3 text-text-mid"
                }`}
              >
                {pretty(o.status)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-4">
              <p className="text-sm font-semibold tabular-nums text-text-hi">
                {formatPaise(o.totalInPaise)}
              </p>

              {o.trackingNumber && (
                <Link
                  href={`/track?awb=${o.trackingNumber}`}
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                >
                  Track
                </Link>
              )}
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
