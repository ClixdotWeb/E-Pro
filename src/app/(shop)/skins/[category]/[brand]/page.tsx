import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import { getModelsForBrand } from "@/lib/catalog";
import { ModelPicker } from "@/components/skins/ModelPicker";

/**
 * Every model this brand makes that we cut a skin for.
 *
 * The list itself is a client component so it can filter as the
 * customer types; the page just fetches the brand and hands it over.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/skins/[category]/[brand]">): Promise<Metadata> {
  const { category, brand } = await params;
  const found = await getModelsForBrand(category, brand);
  if (!found) return { title: "Not found" };

  return {
    title: `${found.brand} ${CATEGORY_LABEL[category] ?? category} Skins`,
    description: `Skins cut for ${found.models.length} ${found.brand} models.`,
  };
}

export default async function BrandPage({
  params,
}: PageProps<"/skins/[category]/[brand]">) {
  const { category, brand } = await params;
  if (!CATEGORY_LABEL[category]) notFound();

  const found = await getModelsForBrand(category, brand);
  if (!found) notFound();

  return (
    <div className="page py-10 md:py-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link href={`/skins/${category}`} className="hover:text-accent">
          {CATEGORY_LABEL[category]}
        </Link>
        <span className="px-2">/</span>
        <span className="text-text-mid">{found.brand}</span>
      </nav>

      <header className="mx-auto max-w-[720px] text-center">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          Find your model
        </span>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-text-hi md:text-[40px]">
          {found.brand} {CATEGORY_LABEL[category]} Skins
        </h1>
      </header>

      <ModelPicker
        category={category}
        brandSlug={brand}
        brand={found.brand}
        models={found.models}
      />
    </div>
  );
}
