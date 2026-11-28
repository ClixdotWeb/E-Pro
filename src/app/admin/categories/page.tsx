import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { db } from "@/lib/db";
import { UNCATEGORISED } from "@/lib/catalog-shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

/**
 * Categories.
 *
 * Everything the homepage grid and the device pages show about a
 * category lives here now: its name, its tile, the sentence under
 * its heading, its place in the grid, and whether it appears at all.
 * All of that used to be a list in code, so a category added here
 * never reached the homepage.
 *
 * The count is device models, not products. A product is a material
 * or a coverage and exists once for the whole catalogue; what
 * belongs to a category is the models under it, and that is the
 * number that says whether deleting one is safe.
 */
export default async function AdminCategoriesPage() {
  const categories = await db.deviceCategory.findMany({
    where: { slug: { not: UNCATEGORISED } },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      imageUrl: true,
      tagline: true,
      active: true,
      _count: { select: { models: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Categories"
        description="The devices you cut skins for. These are the tiles on the homepage and the pages customers browse."
      />

      <CategoryManager
        initial={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          imageUrl: c.imageUrl,
          tagline: c.tagline,
          active: c.active,
          count: c._count.models,
        }))}
      />
    </>
  );
}
