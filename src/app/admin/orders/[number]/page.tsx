import { notFound } from "next/navigation";
import { Card, PageHeader, Pill, type Tone } from "@/components/admin/ui";
import { OrderStatusButton } from "@/components/admin/OrderStatusButton";
import { formatPaise } from "@/lib/money";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;
  return { title: `Order ${number}` };
}

/**
 * One order.
 *
 * The left column is what to do and what to pack. The right is who it
 * goes to. The one action that matters - moving it to the next stage -
 * is a single button at the top, labelled with the actual next step
 * rather than a dropdown of every possible status.
 *
 * The pack list names the device and the design, because those are
 * the two things someone at the cutting machine has to read off it.
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

function pretty(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

type Address = {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
};

function asAddress(value: unknown): Address {
  return value && typeof value === "object" ? (value as Address) : {};
}

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;
  const order = await getOrder(number);
  if (!order) notFound();

  const ship = asAddress(order.shippingAddress);

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        back={{ label: "Orders", href: "/admin/orders" }}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Pill tone={TONE[order.status] ?? "neutral"}>
          {pretty(order.status)}
        </Pill>
        <span className="text-[13px] text-text-mid">
          Placed{" "}
          {order.placedAt.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>

        <OrderStatusButton
          orderNumber={order.orderNumber}
          status={order.status}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* what to pack */}
        <div className="space-y-5">
          <Card title="What to cut and pack">
            <ul className="divide-y divide-hairline">
              {order.lines.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-text-hi">
                      {l.deviceName}
                    </p>
                    <p className="mt-0.5 text-[12px] text-text-low">
                      {l.productTitle}
                      {l.design ? ` · ${l.design}` : ""}
                    </p>
                  </div>
                  <span className="text-[13px] text-text-mid">
                    × {l.quantity}
                  </span>
                  <span className="w-[120px] text-right text-[13px] text-text-hi">
                    {formatPaise(l.totalInPaise)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-[13px]">
              <Row label="Subtotal" value={formatPaise(order.subtotalInPaise)} />
              {order.discountInPaise > 0 && (
                <Row
                  label="Discount"
                  value={`− ${formatPaise(order.discountInPaise)}`}
                />
              )}
              <Row
                label="Shipping"
                value={
                  order.shippingInPaise === 0
                    ? "Free"
                    : formatPaise(order.shippingInPaise)
                }
              />
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-[14px] font-bold text-text-hi">
                {order.paymentStatus === "PAID" ? "Paid" : "Total"}
              </span>
              <span className="text-[16px] font-bold text-text-hi">
                {formatPaise(order.totalInPaise)}
              </span>
            </div>
          </Card>

          <Card title="History">
            {order.events.length === 0 ? (
              <p className="text-[13px] text-text-low">
                Nothing has happened to this order yet.
              </p>
            ) : (
              <ol className="space-y-4 border-l border-hairline pl-5">
                {order.events.map((e, i) => (
                  <li key={`${e.type}-${i}`} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent"
                    />
                    <p className="text-[13px] font-bold text-text-hi">
                      {e.message}
                    </p>
                    <p className="mt-0.5 text-[12px] text-text-low">
                      {e.createdAt.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* who it goes to */}
        <div className="space-y-5">
          <Card title="Ship to">
            <address className="text-[13px] not-italic leading-relaxed text-text-mid">
              <span className="font-bold text-text-hi">
                {ship.fullName ?? order.email}
              </span>
              {ship.line1 && (
                <>
                  <br />
                  {ship.line1}
                </>
              )}
              {ship.line2 && (
                <>
                  <br />
                  {ship.line2}
                </>
              )}
              {(ship.city || ship.state || ship.pincode) && (
                <>
                  <br />
                  {[ship.city, ship.state, ship.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </>
              )}
              <br />
              <span className="text-text-low">
                {ship.phone ?? order.phone ?? order.email}
              </span>
            </address>
          </Card>

          <Card title="Payment">
            <dl className="space-y-2.5 text-[13px]">
              <Row label="Status" value={pretty(order.paymentStatus)} />
              <Row
                label="Courier"
                value={order.courier ?? "Not dispatched"}
              />
              <Row label="Tracking" value={order.trackingNumber ?? "—"} />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-mid">{label}</dt>
      <dd className="text-right text-text-hi">{value}</dd>
    </div>
  );
}
