import { PageHeader } from "@/components/admin/ui";
import { StockTable } from "@/components/admin/StockTable";
import { getAllProducts } from "@/lib/catalog";

export const metadata = { title: "Stock" };

/**
 * Stock is counted one product at a time, and the URL says which.
 *
 * The catalogue holds thousands of options. Sending every one of them
 * to the browser so the page could filter them there produced a
 * four-megabyte response that locked the tab, and nothing was gained:
 * only one product's rows are ever on screen. So the chosen product is
 * a query parameter, the server loads that one, and switching products
 * is a navigation.
 *
 * Drafts are included deliberately - this is the dashboard, and an
 * unlisted product still sits in a box on a shelf.
 */
export default async function AdminStockPage({
  searchParams,
}: PageProps<"/admin/stock">) {
  const { product } = await searchParams;
  const products = await getAllProducts();

  const choices = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    count: p.variants.length,
  }));

  const wanted = typeof product === "string" ? product : undefined;
  const selected =
    products.find((p) => p.slug === wanted) ?? products[0] ?? null;

  const rows = (selected?.variants ?? []).map((v) => ({
    id: v.id,
    variantTitle: v.title,
    priceInPaise: v.priceInPaise,
    stock: v.stock,
  }));

  return (
    <>
      <PageHeader
        title="Stock"
        description="How many of each option you have. Type the numbers straight into the list and press Save."
      />

      <StockTable
        // Remount on a product change, so no half-typed count carries
        // across onto another product's rows.
        key={selected?.slug ?? "none"}
        choices={choices}
        selected={selected?.slug ?? ""}
        productTitle={selected?.title ?? ""}
        rows={rows}
      />
    </>
  );
}
