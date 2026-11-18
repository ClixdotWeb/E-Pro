import { PageHeader } from "@/components/admin/ui";
import { ProductTable } from "@/components/admin/ProductTable";
import { ALL_PRODUCTS } from "@/lib/realCatalog";

export const metadata = { title: "Products" };

type Filter = "all" | "no-photo" | "odd-price" | "no-category";

const VALID: Filter[] = ["all", "no-photo", "odd-price", "no-category"];

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const raw = typeof sp.filter === "string" ? sp.filter : "all";
  const filter = (VALID as string[]).includes(raw) ? (raw as Filter) : "all";

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything in the shop. Click a row to edit it."
        action={{ label: "Add product", href: "/admin/products/new" }}
      />

      <ProductTable products={ALL_PRODUCTS} initialFilter={filter} />
    </>
  );
}
