import Link from "next/link";
import { Avatar, Empty, PageHeader, Pill, type Tone } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";
import { getOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

/**
 * Orders list.
 *
 * Status first, because that is the only thing you scan for: what
 * still needs doing. The five invented rows that used to sit here
 * were worse than nothing - they linked to detail pages for orders
 * that did not exist, so the first thing the shop owner did on this
 * screen was hit a dead end.
 */

const TONE: Record<string, Tone> = {
  PENDING: "warning",
  CONFIRMED: "warning",
  PROCESSING: "warning",
  SHIPPED: "accent",
  DELIVERED: "success",
  CANCELLED: "danger",
  RETURNED: "danger",
};

function pretty(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const needsWork = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status),
  ).length;

  return (
    <>
      <PageHeader
        title="Orders"
        description={
          orders.length === 0
            ? "No orders yet."
            : needsWork > 0
              ? `${needsWork} order${needsWork === 1 ? "" : "s"} still to cut and dispatch.`
              : "Nothing waiting to be dispatched."
        }
      />

      {orders.length === 0 ? (
        <Empty
          title="No orders yet"
          body="The first order placed on the shop appears here, with what to cut and where to send it."
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
          <div className="hidden items-center gap-4 border-b border-hairline px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low md:flex">
            <span className="w-[108px]">Order</span>
            <span className="flex-1">Customer</span>
            <span className="w-[110px]">Status</span>
            <span className="w-[130px] text-right">Total</span>
          </div>

          <ul>
            {orders.map((o) => (
              <li
                key={o.orderNumber}
                className="border-b border-hairline last:border-0"
              >
                <Link
                  href={`/admin/orders/${o.orderNumber}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-surface-2"
                >
                  <span className="w-[108px] font-mono text-[13px] font-bold text-text-hi">
                    {o.orderNumber}
                  </span>

                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={o.customerName} />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-text-hi">
                        {o.customerName}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-text-low">
                        {o.placedAt.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                      </span>
                    </span>
                  </span>

                  <span className="w-[110px]">
                    <Pill tone={TONE[o.status] ?? "neutral"}>
                      {pretty(o.status)}
                    </Pill>
                  </span>

                  <span className="w-[130px] text-right text-[13px] font-bold tabular-nums text-text-hi">
                    {formatPaise(o.totalInPaise)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
