import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { paymentStatus } from "@/lib/payments";
import { getCatalogStats } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

/**
 * Settings.
 *
 * Two halves, and the line between them is who owns the value.
 *
 * The form is the shop's own rules - shipping, GST, the number
 * enquiries go to, which brands get asked about their logo. Those
 * were constants in half a dozen files, so changing one was a code
 * change and a deploy. They are rows now.
 *
 * Under it, what the shop is running on: the database, the payment
 * gateway, where the catalogue came from. Those belong to the
 * deployment, not to the shop owner, and a form that pretended
 * otherwise would be lying. This screen says what they are and
 * where they are set.
 */
export default async function AdminSettingsPage() {
  const [stats, settings] = await Promise.all([
    getCatalogStats(),
    getSettings(),
  ]);
  const payment = paymentStatus();
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  return (
    <>
      <PageHeader
        title="Settings"
        description="The shop's own rules, and what it is running on."
      />

      <SettingsForm settings={settings} />

      <div className="mt-10 space-y-5">
        <Card
          title="Is the shop working?"
          hint="Set where the site is deployed, not here."
        >
          <ul className="divide-y divide-hairline">
            <Row
              label="Database"
              value={hasDatabase ? "Connected" : "Not configured"}
              tone={hasDatabase ? "success" : "danger"}
              note={
                hasDatabase
                  ? "DATABASE_URL is set."
                  : "Nothing can be read or saved without DATABASE_URL."
              }
            />
            <Row
              label="Payments"
              value={payment.live ? payment.displayName : "Not taking money"}
              tone={payment.live ? "success" : "warning"}
              note={
                payment.live
                  ? "Orders are charged at checkout."
                  : payment.usable
                    ? `Running on the ${payment.displayName}. Orders are placed and held unpaid.`
                    : "Set PAYMENT_PROVIDER and its keys to take money online."
              }
            />
            <Row
              label="Catalogue"
              value={`${stats.products} products · ${stats.totalVariants.toLocaleString("en-IN")} options`}
              tone="accent"
              note={
                stats.draftVariants > 0
                  ? `${stats.draftVariants.toLocaleString("en-IN")} options are waiting on a price.`
                  : "Everything is priced."
              }
            />
          </ul>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone: "success" | "warning" | "danger" | "accent";
}) {
  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 py-4 first:pt-0 last:pb-0">
      <span className="w-[120px] shrink-0 text-[13px] font-bold text-text-hi">
        {label}
      </span>
      <span className="min-w-0 flex-1">
        <Pill tone={tone}>{value}</Pill>
        {note && (
          <span className="mt-1.5 block text-[12.5px] leading-relaxed text-text-mid">
            {note}
          </span>
        )}
      </span>
    </li>
  );
}
