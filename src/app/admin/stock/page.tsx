import { NotSavingYet, PageHeader } from "@/components/admin/ui";
import { StockTable } from "@/components/admin/StockTable";
import { getAllProducts } from "@/lib/catalog";

export const metadata = { title: "Stock" };

export default async function AdminStockPage() {
  const products = await getAllProducts();

  return (
    <>
      <PageHeader
        title="Stock"
        description="How many of each option you have. Type the numbers straight into the list."
      />

      <NotSavingYet what="Stock" />

      <StockTable products={products} />
    </>
  );
}
