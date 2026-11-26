import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

/**
 * Categories.
 *
 * Read from DeviceCategory, not from the hard-coded label map it used
 * to list: adding a category that then did not appear made the
 * screen look broken, and the map cannot grow at runtime.
 *
 * The count is device models, not products. A product here is a
 * material or a coverage and exists once for the whole catalogue;
 * what actually belongs to a category is the models under it, and
 * that is the number that says whether deleting one is safe.
 */
export default async function AdminCategoriesPage() {
  const categories = await db.deviceCategory.findMany({
    orderBy: { position: "asc" },
    select: {
      slug: true,
      name: true,
      _count: { select: { models: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Categories"
        description="The devices you cut skins for. These are the pages customers browse and the items in the Skin menu."
      />

      <CategoryManager
        initial={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          count: c._count.models,
        }))}
      />
    </>
  );
}
