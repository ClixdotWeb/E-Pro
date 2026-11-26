import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track order",
  description: "Enter your order number or AWB to see where your parcel is.",
};

/**
 * Track an order.
 *
 * It used to draw the same six-step timeline for anything typed into
 * the box, including a number that was never ours. A customer whose
 * parcel is lost does not need a confident fiction.
 *
 * Now it looks the number up - the order number from the receipt or
 * the courier's AWB - and shows the stages the order has actually
 * reached. No personal details are shown beyond the stages: the
 * order number is the only credential, and it travels by email.
 */

const STAGES = [
  { status: "PENDING", label: "Order placed" },
  { status: "CONFIRMED", label: "Order confirmed" },
  { status: "PROCESSING", label: "Cut and packed" },
  { status: "SHIPPED", label: "Handed to courier" },
  { status: "DELIVERED", label: "Delivered" },
];

const ORDER_OF = Object.fromEntries(
  STAGES.map((s, i) => [s.status, i]),
) as Record<string, number>;

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const sp = await searchParams;
  const typed = (
    typeof sp.awb === "string"
      ? sp.awb
      : typeof sp.order === "string"
        ? sp.order
        : ""
  ).trim();

  const order = typed
    ? await db.order.findFirst({
        where: {
          OR: [
            { orderNumber: { equals: typed, mode: "insensitive" } },
            { trackingNumber: { equals: typed, mode: "insensitive" } },
          ],
        },
        select: {
          orderNumber: true,
          status: true,
          courier: true,
          trackingNumber: true,
          placedAt: true,
          _count: { select: { items: true } },
          events: {
            orderBy: { createdAt: "asc" },
            select: { type: true, createdAt: true },
          },
        },
      })
    : null;

  const reached = order ? (ORDER_OF[order.status] ?? 0) : -1;
  const cancelled =
    order?.status === "CANCELLED" || order?.status === "RETURNED";

  const whenReached = (status: string): Date | null => {
    if (!order) return null;
    if (status === "PENDING") return order.placedAt;
    const hit = order.events.find((e) => e.type === status.toLowerCase());
    return hit?.createdAt ?? null;
  };

  return (
    <div className="page max-w-2xl py-12">
      <p className="kicker">Where is my order?</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-hi">
        Track your order
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
        Use the order number from your confirmation email (EPRO-0000) or the AWB
        number from the dispatch message.
      </p>

      <form action="/track" className="mt-7 flex gap-2">
        <label htmlFor="awb" className="sr-only">
          Order or AWB number
        </label>
        <input
          id="awb"
          name="awb"
          defaultValue={typed}
          placeholder="EPRO-1042 or the courier's AWB"
          className="min-w-0 flex-1 rounded-[var(--r-md)] border border-hairline bg-surface-0 px-4 py-3 text-sm text-text-hi placeholder:text-text-low"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Track
        </button>
      </form>

      {typed && !order && (
        <div className="card mt-8 p-6">
          <p className="text-sm font-medium text-text-hi">
            Nothing found for {typed}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-text-mid">
            Check the number against your confirmation email. A courier AWB can
            take a few hours to start working after dispatch — if it still does
            not,{" "}
            <Link href="/contact" className="text-accent hover:underline">
              tell us
            </Link>{" "}
            and we will look it up.
          </p>
        </div>
      )}

      {order && (
        <div className="card mt-8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-text-hi">
                {order.orderNumber}
              </p>
              <p className="mt-1 text-[12px] text-text-low">
                {order.courier ?? "Not dispatched yet"} · {order._count.items}{" "}
                item{order._count.items === 1 ? "" : "s"}
                {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                cancelled
                  ? "bg-danger/15 text-danger"
                  : order.status === "DELIVERED"
                    ? "bg-success/15 text-success"
                    : "bg-accent-soft text-accent"
              }`}
            >
              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
            </span>
          </div>

          {cancelled ? (
            <p className="mt-6 text-[13px] leading-relaxed text-text-mid">
              This order was {order.status.toLowerCase()}. If that is a
              surprise,{" "}
              <Link href="/contact" className="text-accent hover:underline">
                get in touch
              </Link>
              .
            </p>
          ) : (
            <ol className="mt-7 space-y-5 border-l border-hairline pl-6">
              {STAGES.map((stage, i) => {
                const done = i <= reached;
                const current = i === reached;
                const at = done ? whenReached(stage.status) : null;

                return (
                  <li key={stage.status} className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 grid h-[22px] w-[22px] place-items-center rounded-full border bg-surface-0 ${
                        current
                          ? "border-accent text-accent"
                          : done
                            ? "border-success text-success"
                            : "border-hairline text-text-low"
                      }`}
                    >
                      {done ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <p
                      className={`text-sm ${
                        done ? "font-medium text-text-hi" : "text-text-low"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {at && (
                      <p className="mt-0.5 text-[12px] text-text-low">
                        {at.toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
