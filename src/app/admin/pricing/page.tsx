import { PageHeader } from "@/components/admin/ui";
import { FlatPricing } from "@/components/admin/FlatPricing";
import { getPricingGroups } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pricing" };

/**
 * Pricing.
 *
 * Separate from the product editor on purpose. The editor is for one
 * product's details; this is for the money, across the whole
 * catalogue, in one screen - which is the only way the phone list
 * (2400 options, three coverages) can be priced at all.
 */
export default async function PricingPage() {
  const groups = await getPricingGroups();

  return (
    <>
      <PageHeader
        title="Pricing"
        description="One price per product, applied to every device model under it. Typing a price also puts the product on sale."
      />
      <FlatPricing groups={groups} />
    </>
  );
}
