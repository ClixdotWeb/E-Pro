import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { paymentStatus } from "@/lib/payments";
import {
  FLAT_SHIPPING_PAISE,
  FREE_SHIPPING_THRESHOLD_PAISE,
  GST_RATE_BPS,
} from "@/lib/pricing";
import { formatPaise } from "@/lib/money";
import { getCatalogStats } from "@/lib/catalog";

export const metadata = { title: "Settings" };

/**
 * Settings.
 *
 * This screen is honest about which parts of the shop are actually
 * running. Each row says what it is, what it is set to, and whether it
 * works — because "is the payment gateway live?" is the question that
 * matters most and the hardest one to answer from a dashboard that
 * only shows green ticks.
 *
 * These values come from the environment and are read-only here. They
 * are changed where they live, not in a form that pretends to own
 * them.
 */
export default async function AdminSettingsPage() {
  const stats = await getCatalogStats();
  const payment = paymentStatus();
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  return (
    <>
      <PageHeader
        title="Settings"
        description="What the shop is running on right now."
      />

      <div className="space-y-5">
        <Card title="Is the shop working?">
          <ul className="divide-y divide-hairline">
            <Status
              label="Database"
              value={hasDatabase ? "Connected" : "Not connected"}
              ok={hasDatabase}
              note="Carts, orders and customers all need this. Nothing is saved without it."
            />
            <Status
              label="Payments"
              value={payment.displayName}
              ok={payment.live}
              note={
                payment.live
                  ? "Customers can pay."
                  : "A test gateway. No money moves. Choose a real one before taking orders."
              }
            />
            <Status
              label="Sign-in"
              value="Not switched on"
              ok={false}
              note="Nobody can make an account, and this dashboard has no password on it."
            />
          </ul>
        </Card>

        <Card
          title="Shipping and tax"
          hint="Set in code for now, in src/lib/pricing.ts."
        >
          <dl className="space-y-3 text-[14px]">
            <Row
              label="Shipping"
              value={formatPaise(FLAT_SHIPPING_PAISE)}
              note="Flat rate per order"
            />
            <Row
              label="Free over"
              value={formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)}
              note="Shipping drops to zero above this"
            />
            <Row
              label="GST"
              value={`${GST_RATE_BPS / 100}%`}
              note="Already inside the prices shown, worked back out for the invoice"
            />
          </dl>
        </Card>

        <Card
          title="Where the catalogue came from"
          hint="Imported from the Shopify storefront. Re-run the importer to refresh it."
        >
          <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
            <Row label="Products imported" value={String(stats.products)} />
            <Row label="Options" value={String(stats.totalVariants)} />
            <Row
              label="Skipped"
              value={String(stats.noCategory)}
              note="Placeholder titles like “werdx”"
            />
            <Row
              label="Missing photos"
              value={String(stats.missingImages)}
            />
          </dl>

          <p className="mt-5 rounded-[8px] bg-surface-2 px-4 py-3 font-mono text-[12px] text-text-mid">
            node scripts/import-shopify.mjs &lt;raw-dir&gt;
          </p>
        </Card>
      </div>
    </>
  );
}

function Status({
  label,
  value,
  ok,
  note,
}: {
  label: string;
  value: string;
  ok: boolean;
  note: string;
}) {
  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-text-hi">{label}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-text-mid">{note}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-text-mid">{value}</span>
        <Pill tone={ok ? "success" : "warning"}>
          {ok ? "Working" : "Not yet"}
        </Pill>
      </div>
    </li>
  );
}

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt>
        <span className="text-text-mid">{label}</span>
        {note && (
          <span className="mt-0.5 block text-[12px] text-text-low">{note}</span>
        )}
      </dt>
      <dd className="shrink-0 font-bold text-text-hi">{value}</dd>
    </div>
  );
}
