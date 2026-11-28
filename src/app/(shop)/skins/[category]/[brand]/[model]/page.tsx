import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import { formatPaise } from "@/lib/money";
import { getModelPage } from "@/lib/catalog";
import { getDesignsFor } from "@/lib/designs";
import { getSettings } from "@/lib/settings";
import { SkinConfigurator } from "@/components/skins/SkinConfigurator";

/**
 * One model, configured and bought. The end of the road that starts
 * at the category tile on the homepage.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/skins/[category]/[brand]/[model]">): Promise<Metadata> {
  const { category, brand, model } = await params;
  const page = await getModelPage(category, brand, model);
  if (!page) return { title: "Not found" };

  const cheapest = page.options.find((o) => !o.pending);

  return {
    title: `${page.name} Skin`,
    description: cheapest
      ? `Precision-cut skin for the ${page.name}, from ${formatPaise(cheapest.priceInPaise)}.`
      : `Precision-cut protective skin for the ${page.name}.`,
  };
}

export default async function ModelSkinPage({
  params,
}: PageProps<"/skins/[category]/[brand]/[model]">) {
  const { category, brand, model } = await params;
  if (!CATEGORY_LABEL[category]) notFound();

  const page = await getModelPage(category, brand, model);
  if (!page) notFound();

  const [designs, settings] = await Promise.all([
    getDesignsFor(category),
    getSettings(),
  ]);

  return (
    <div className="page py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link href={`/skins/${category}`} className="hover:text-accent">
          {page.categoryLabel}
        </Link>
        <span className="px-2">/</span>
        <Link
          href={`/skins/${category}/${page.brandSlug}`}
          className="hover:text-accent"
        >
          {page.brand}
        </Link>
        <span className="px-2">/</span>
        <span className="text-text-mid">{page.name}</span>
      </nav>

      <h1 className="text-[28px] font-bold leading-tight text-text-hi md:text-[38px]">
        {page.name} Skin
      </h1>
      <p className="mt-2 text-[15px] text-text-mid">
        Three answers and it is on its way.
      </p>

      <div className="mt-10">
        <SkinConfigurator
          model={page}
          designs={designs}
          whatsapp={settings["contact.whatsapp"]}
        />
      </div>
    </div>
  );
}
