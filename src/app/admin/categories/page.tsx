import { NotSavingYet, PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import { getAllProducts } from "@/lib/catalog";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const products = await getAllProducts();
  const rows = Object.entries(CATEGORY_LABEL).map(([slug, name]) => ({
    slug,
    name,
    count: products.filter((p) => p.category === slug).length,
  }));

  return (
    <>
      <PageHeader
        title="Categories"
        description="The devices you cut skins for. These are the pages customers browse and the items in the Skin menu."
      />

      <NotSavingYet what="Categories" />

      <CategoryManager initial={rows} />
    </>
  );
}
