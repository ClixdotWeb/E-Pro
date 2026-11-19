import { NotSavingYet, PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ALL_PRODUCTS, CATEGORY_LABEL } from "@/lib/realCatalog";

export const metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  const rows = Object.entries(CATEGORY_LABEL).map(([slug, name]) => ({
    slug,
    name,
    count: ALL_PRODUCTS.filter((p) => p.category === slug).length,
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
