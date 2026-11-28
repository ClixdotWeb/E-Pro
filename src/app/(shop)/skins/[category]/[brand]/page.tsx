import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import {
  getBrandModelTree,
  getModelsForBrand,
  getSkinForCategory,
} from "@/lib/catalog";
import { ModelPicker } from "@/components/skins/ModelPicker";
import { SkinBuyBox } from "@/components/skins/SkinBuyBox";
import { getSettings } from "@/lib/settings";

/**
 * Two pages behind one segment, told apart by looking.
 *
 * /skins/camera/korean-skin is a skin - the thing with a price, the
 * second click of the walk the shop actually sells on. It asks for
 * the model and takes the money.
 *
 * /skins/camera/canon is a brand - the older door, still open for
 * anyone who arrives knowing their camera but not what they want it
 * cut from.
 *
 * A finish slug and a brand slug cannot collide: the finishes are a
 * fixed list of eight written in catalog-shared, and no brand we
 * carry is called Printed Skin. Checking the finish first keeps the
 * URL short, which matters more here than a tidier route tree -
 * /skins/camera/f/korean-skin reads like a mistake.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/skins/[category]/[brand]">): Promise<Metadata> {
  const { category, brand } = await params;

  const skin = await getSkinForCategory(category, brand);
  if (skin)
    return {
      title: `${skin.name} — ${CATEGORY_LABEL[category] ?? category} Skins`,
      description: `${skin.name} cut for ${skin.models} models.`,
    };

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

  // A skin, not a brand?
  const skin = await getSkinForCategory(category, brand);
  if (skin) {
    const [brands, settings] = await Promise.all([
      getBrandModelTree(category),
      getSettings(),
    ]);

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
          <span className="text-text-mid">{skin.name}</span>
        </nav>

        <header className="mx-auto max-w-[720px] text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            {CATEGORY_LABEL[category]} skins
          </span>
          <h1 className="mt-3 text-[32px] font-bold leading-tight text-text-hi md:text-[40px]">
            {skin.name}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-text-mid">
            Cut for {skin.models} {CATEGORY_LABEL[category].toLowerCase()} model
            {skin.models === 1 ? "" : "s"}. Tell us which one you have and the
            price is exact.
          </p>
        </header>

        <SkinBuyBox
          category={category}
          finish={skin.slug}
          finishName={skin.name}
          brands={brands}
          whatsapp={settings["contact.whatsapp"]}
        />
      </div>
    );
  }

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
