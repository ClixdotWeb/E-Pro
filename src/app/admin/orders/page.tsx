import Link from "next/link";
import { PageHeader, Pill, type Tone } from "@/components/admin/ui";
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

      <ul className="overflow-hidden rounded-[12px] border border-hairline">
        {ORDERS.map((o) => (
          <li key={o.number} className="border-b border-hairline last:border-0">
            <Link
              href={`/admin/orders/${o.number}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-surface-1 p-4 transition-colors hover:bg-surface-2"
            >
              <span className="font-mono text-[13px] font-bold text-text-hi">
                {o.number}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] text-text-hi">
                  {o.customer}
                </span>
                <span className="mt-0.5 block text-[12px] text-text-low">
                  {o.at} · {o.items} item{o.items === 1 ? "" : "s"}
                </span>
              </span>

              <Pill tone={TONE[o.status]}>{o.status}</Pill>

              <span className="w-[120px] text-right text-[13px] font-bold text-text-hi">
                {formatPaise(o.totalInPaise)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
