import { PageHeader } from "@/components/admin/ui";
import { DesignManager } from "@/components/admin/DesignManager";
import { getAllDesigns, getDesignCategories } from "@/lib/designs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Designs" };

/**
 * Designs.
 *
 * The artwork a customer picks in step one of the model page. Until
 * something is here that step is greyed out and an order says which
 * coverage was bought but not which picture to print.
 */
export default async function DesignsPage() {
  const [categories, designs] = await Promise.all([
    getDesignCategories(),
    getAllDesigns(),
  ]);

  return (
    <>
      <PageHeader
        title="Designs"
        description="The artwork customers choose from. Every design here shows on the devices you pick for it."
      />
      <DesignManager categories={categories} designs={designs} />
    </>
  );
}
