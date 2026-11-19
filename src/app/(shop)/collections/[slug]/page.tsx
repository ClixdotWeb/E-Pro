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
 * Sort and Filter are inert for now - sorting needs a query parameter
 * and the catalogue has no stock or option data to filter on yet.
 * They are rendered because they are part of the layout, and wiring
 * them is a later change that does not move anything.
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

export function generateStaticParams() {
  return [...ALL_CATEGORY_SLUGS, ...ALL_FINISH_SLUGS].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await resolve(slug);
  if (!found) return { title: "Collection not found" };
  return { title: found.label };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
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
