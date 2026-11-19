import Link from "next/link";
import { Avatar, PageHeader, Pill, type Tone } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";

export const metadata = { title: "Orders" };

/**
 * Orders list.
 *
 * Status first, because that is the only thing you scan for: what
 * still needs doing. "Processing" rows are the work; everything else
 * is history.
 *
 * Stub rows until the database is connected.
 */

const ORDERS = [
  { number: "EPRO-1042", customer: "Jayakrishnan R", at: "12 Nov 2026", status: "Shipped", items: 3, totalInPaise: 231800 },
  { number: "EPRO-1041", customer: "Arun Kumar", at: "12 Nov 2026", status: "Processing", items: 1, totalInPaise: 94900 },
  { number: "EPRO-1040", customer: "Meera S", at: "11 Nov 2026", status: "Delivered", items: 2, totalInPaise: 169800 },
  { number: "EPRO-1039", customer: "Rahul P", at: "10 Nov 2026", status: "Delivered", items: 1, totalInPaise: 84900 },
  { number: "EPRO-1038", customer: "Nithya V", at: "09 Nov 2026", status: "Cancelled", items: 2, totalInPaise: 139800 },
];

const TONE: Record<string, Tone> = {
  Processing: "warning",
  Shipped: "accent",
  Delivered: "success",
  Cancelled: "danger",
};

export default function AdminOrdersPage() {
  const needsWork = ORDERS.filter((o) => o.status === "Processing").length;

  return (
    <>
      <PageHeader
        title="Orders"
        description={
          needsWork > 0
            ? `${needsWork} order${needsWork === 1 ? "" : "s"} still to cut and dispatch.`
            : "Nothing waiting to be dispatched."
        }
      />

      <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
        <div className="hidden items-center gap-4 border-b border-hairline px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low md:flex">
          <span className="w-[108px]">Order</span>
          <span className="flex-1">Customer</span>
          <span className="w-[110px]">Status</span>
          <span className="w-[130px] text-right">Total</span>
        </div>

        <ul>
          {ORDERS.map((o) => (
            <li key={o.number} className="border-b border-hairline last:border-0">
              <Link
                href={`/admin/orders/${o.number}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-surface-2"
              >
                <span className="w-[108px] font-mono text-[13px] font-bold text-text-hi">
                  {o.number}
                </span>

                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={o.customer} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] text-text-hi">
                      {o.customer}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-text-low">
                      {o.at} · {o.items} item{o.items === 1 ? "" : "s"}
                    </span>
                  </span>
                </span>

                <span className="w-[110px]">
                  <Pill tone={TONE[o.status]}>{o.status}</Pill>
                </span>

                <span className="w-[130px] text-right text-[13px] font-bold tabular-nums text-text-hi">
                  {formatPaise(o.totalInPaise)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
