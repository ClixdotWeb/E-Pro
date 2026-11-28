import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import {
  CATEGORY_LABEL,
  FINISH_LABEL,
  type CatalogProduct,
} from "@/lib/catalog-shared";
import { getProductsForCategory, getProductsForFinish } from "@/lib/catalog";
import { getCollection } from "@/lib/designs";
import { DesignGrid } from "@/components/designs/DesignGrid";

/**
 * Collection page, laid out like the live product grid.
 *
 * The live /collections/* pages could not be fetched - Shopify rate
 * limits that path for this client and returned "Too many requests" on
 * every attempt. The search results page uses the same template and
 * DID load, so the layout below is taken from there:
 *
 *   h1 (page title)
 *   .collection-products-header   Filter button | "N products" | Sort
 *   .collection-products.rw       --w-xs: 6, --w-md: 3.0
 *                                 i.e. 2 columns, 4 from md
 *
 * The filter rail and option counts I had invented are gone; the real
 * header is a Filter button, a count and a Sort select, in that order.
 *
 * Three things live under this one path, and which one a slug means
 * is decided by looking, not guessing: a design collection
 * ("embossed"), a device category ("camera"), or a finish
 * ("korean-skin"). Design collections win, because they are the ones
 * customers are sent to - Categories -> Our Collections -> here.
 *
 * Sort and Filter are inert on the product variants for now. The
 * design grid has real ones.
 */

const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_LABEL);
const ALL_FINISH_SLUGS = Object.keys(FINISH_LABEL);

type Resolved = {
  kind: "category" | "finish";
  slug: string;
  label: string;
  products: CatalogProduct[];
};

async function resolve(slug: string): Promise<Resolved | null> {
  if (ALL_CATEGORY_SLUGS.includes(slug)) {
    return {
      kind: "category",
      slug,
      label: CATEGORY_LABEL[slug],
      products: await getProductsForCategory(slug),
    };
  }

  if (ALL_FINISH_SLUGS.includes(slug)) {
    return {
      kind: "finish",
      slug,
      label: FINISH_LABEL[slug],
      products: await getProductsForFinish(slug),
    };
  }

  return null;
}

/**
 * Rendered per request, not prerendered at build.
 *
 * Two reasons. The build runs in Docker with no database reachable,
 * so prerendering could not read the catalogue anyway. And once the
 * dashboard can edit a product, a page baked at build time would keep
 * showing the old one until the next deploy - which defeats the point
 * of putting the catalogue in a database.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  const collection = await getCollection(slug);
  if (collection)
    return {
      title: collection.name,
      description: `${collection.name} skins, cut to the millimetre for your exact device.`,
    };

  const found = await resolve(slug);
  if (!found) return { title: "Collection not found" };
  return { title: found.label };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;

  // The device the customer came in through, when they came through
  // a category. It narrows the grid and travels on to the product so
  // the brand list opens on the right one.
  const device = typeof sp.device === "string" ? sp.device : undefined;

  const collection = await getCollection(slug, device);
  if (collection)
    return (
      <DesignGrid
        slug={collection.slug}
        name={collection.name}
        designs={collection.designs}
        device={device}
        tile={collection.tile}
      />
    );

  const found = await resolve(slug);
  if (!found) notFound();

  const { label, products } = found;
  const count = products.length;

  return (
    <div className="page py-10 md:py-16">
      <h1 className="text-center text-[28px] font-bold tracking-tight text-text-hi md:text-[36px]">
        {label}
      </h1>

      {count === 0 ? (
        <EmptyCollection label={label} />
      ) : (
        <>
          {/* Filter | count | Sort */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              disabled
              className="h-11 rounded-[6px] border border-hairline px-5 text-sm font-bold text-text-mid opacity-60"
              title="Filtering needs stock and option data we do not have yet"
            >
              Filter
            </button>

            <h2 className="flex-1 text-[15px] font-bold text-text-hi">
              {count} product{count === 1 ? "" : "s"}
            </h2>

            <label className="flex items-center gap-2">
              <span className="sr-only">Sort by</span>
              <select
                defaultValue="relevance"
                disabled
                className="h-11 rounded-[6px] border border-hairline bg-surface-0 px-3 text-sm font-bold text-text-mid opacity-60"
              >
                <option value="relevance">Relevance</option>
                <option value="price-ascending">Price, low to high</option>
                <option value="price-descending">Price, high to low</option>
              </select>
            </label>
          </div>

          {/* --w-xs: 6, --w-md: 3.0 -> 2 columns, 4 from md */}
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {products.map((p, i) => (
              <li key={p.slug}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  );
}

function EmptyCollection({ label }: { label: string }) {
  return (
    <div className="mt-10 text-center">
      <p className="mb-6 text-[15px] text-text-mid">
        No {label.toLowerCase()} skins have been cut yet.
      </p>
      <Link
        href="/request-model"
        className="inline-flex h-12 items-center rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
      >
        Request this model
      </Link>
    </div>
  );
}
