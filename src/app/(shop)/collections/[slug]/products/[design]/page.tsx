import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignConfigurator } from "@/components/designs/DesignConfigurator";
import { getDesignPage } from "@/lib/designs";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

/**
 * The product page, at the end of the walk the live store settled on:
 *
 *   Categories -> Our Collections -> the grid -> here
 *
 * The collection slug in the URL is where the customer came from, not
 * what the design is - a design belongs to exactly one kind, and the
 * page checks they agree so that a hand-typed URL cannot put Neon
 * Dragon under Texture.
 *
 * `device` rides along from the category tile so the brand chips open
 * on the right device rather than making someone who clicked Camera
 * scroll past twelve phone brands.
 */

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]/products/[design]">): Promise<Metadata> {
  const { design } = await params;
  const page = await getDesignPage(design);
  if (!page) return { title: "Not found" };

  return {
    title: page.name,
    description:
      page.priceInPaise > 0
        ? `${page.name} skin, cut to the millimetre for your device. From ${formatPaise(page.priceInPaise)}.`
        : `${page.name} skin, cut to the millimetre for your device.`,
  };
}

export default async function CollectionProductPage({
  params,
  searchParams,
}: PageProps<"/collections/[slug]/products/[design]">) {
  const { slug, design } = await params;
  const sp = await searchParams;
  const device = typeof sp.device === "string" ? sp.device : undefined;

  const page = await getDesignPage(design);
  if (!page || page.categorySlug !== slug) notFound();

  const query = device ? `?device=${device}` : "";

  return (
    <div className="page py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">›</span>
        {device ? (
          <Link href={`/skins/${device}`} className="hover:text-accent">
            {CATEGORY_LABEL[device] ?? device}
          </Link>
        ) : (
          <Link href="/designs" className="hover:text-accent">
            Collections
          </Link>
        )}
        <span className="px-2">›</span>
        <Link href={`/collections/${slug}${query}`} className="hover:text-accent">
          {page.categoryName}
        </Link>
        <span className="px-2">›</span>
        <span className="text-text-mid">{page.name}</span>
      </nav>

      <DesignConfigurator design={page} device={device} />
    </div>
  );
}
