import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";
import { getOffers } from "@/lib/catalog";

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
 * Stub data until the database is connected.
 */
export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;

  const offers = await getOffers();
  const lines = offers.filter((o) => o.available).slice(0, 2);
  const total = lines.reduce((n, l) => n + l.priceInPaise, 0);

  return (
    <>
      <PageHeader
        title={`Order ${number}`}
        back={{ label: "Orders", href: "/admin/orders" }}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Pill tone="warning">Processing</Pill>
        <span className="text-[13px] text-text-mid">Placed 12 Nov 2026</span>

        <button
          type="button"
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover"
        >
          Mark as shipped
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* what to pack */}
        <div className="space-y-5">
          <Card title="What to cut and pack">
            <ul className="divide-y divide-hairline">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-text-hi">
                      {l.productTitle}
                    </p>
                    <p className="mt-0.5 text-[12px] text-text-low">
                      {l.variantTitle}
                    </p>
                  </div>
                  <span className="text-[13px] text-text-mid">× 1</span>
                  <span className="w-[120px] text-right text-[13px] text-text-hi">
                    {formatPaise(l.priceInPaise)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-[14px] font-bold text-text-hi">Paid</span>
              <span className="text-[16px] font-bold text-text-hi">
                {formatPaise(total)}
              </span>
            </div>
          </Card>

          <Card title="History">
            <ol className="space-y-4 border-l border-hairline pl-5">
              {[
                ["Order placed", "12 Nov, 9:14 AM"],
                ["Payment received", "12 Nov, 9:14 AM"],
                ["Cutting", "12 Nov, 2:40 PM"],
              ].map(([label, at]) => (
                <li key={label} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent"
                  />
                  <p className="text-[13px] font-bold text-text-hi">{label}</p>
                  <p className="mt-0.5 text-[12px] text-text-low">{at}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* who it goes to */}
        <div className="space-y-5">
          <Card title="Ship to">
            <address className="text-[13px] not-italic leading-relaxed text-text-mid">
              <span className="font-bold text-text-hi">Jayakrishnan R</span>
              <br />
              Thundathil House, Pallippuram
              <br />
              Cherthala, Kerala 688541
              <br />
              <span className="text-text-low">98470 00000</span>
            </address>
          </Card>

          <Card title="Payment">
            <dl className="space-y-2.5 text-[13px]">
              <Row label="Status" value="Paid" />
              <Row label="Method" value="Not recorded yet" />
              <Row label="Reference" value="—" />
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
