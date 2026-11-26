import { redirect } from "next/navigation";
import { getDesignPage } from "@/lib/designs";

export const dynamic = "force-dynamic";

/**
 * /designs/<name> is a convenience, not a page.
 *
 * The product lives under its collection, the way the live store has
 * it - /collections/embossed/products/neon-dragon - and two URLs
 * rendering the same thing is two of everything: two pages to keep in
 * step, and a search engine choosing between them. This sends people
 * to the real one.
 */
export default async function DesignRedirect({
  params,
}: PageProps<"/designs/[design]">) {
  const { design } = await params;
  const page = await getDesignPage(design);
  redirect(page ? `/collections/${page.categorySlug}/products/${page.slug}` : "/designs");
}
