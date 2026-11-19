import { NotSavingYet, PageHeader } from "@/components/admin/ui";
import { StockTable } from "@/components/admin/StockTable";
import { ALL_PRODUCTS } from "@/lib/realCatalog";

export const metadata = { title: "Stock" };

export default function AdminStockPage() {
  return (
    <>
      <PageHeader
        title="Stock"
        description="How many of each option you have. Type the numbers straight into the list."
      />

      <NotSavingYet what="Stock" />

      <StockTable products={ALL_PRODUCTS} />
    </>
  );
}
