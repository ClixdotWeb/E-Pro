import { Empty, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Discounts" };

/**
 * Discounts.
 *
 * The data model for these already exists (Discount in the schema -
 * percent off, a fixed amount off, or free shipping, each with a
 * minimum order), so this screen is a form away once the database is
 * connected. Until then it says so rather than showing a dead table.
 */
export default function AdminDiscountsPage() {
  return (
    <>
      <PageHeader
        title="Discounts"
        description="Codes customers can type at checkout."
      />

      <Empty
        title="No discount codes yet"
        body="You will be able to make three kinds: a percentage off, a fixed amount off, or free shipping — each with a minimum order if you want one."
      />
    </>
  );
}
