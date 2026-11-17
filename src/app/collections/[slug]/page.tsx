import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  FINISH_LABEL,
  ALL_PRODUCTS,
  offersForCategory,
  type ImportedProduct,
} from "@/lib/realCatalog";

/**
 * Collection page, laid out like the live Shopify theme: breadcrumb,
 * title block, a count, a filter rail, then the grid.
 *
 * In Shopify a "collection" is both a device category (Phone, Lens) and
 * a finish (Texture, Embossed), so this one route resolves either. The
 * finish collections are the ones in poor shape - several hold the same
 * nine products - which is why the empty and thin states here are real
 * UI rather than an afterthought.
 */

/** Every device category the store sells, even the ones with no stock. */
const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_LABEL);
const ALL_FINISH_SLUGS = Object.keys(FINISH_LABEL);

type Resolved = {
  kind: "category" | "finish";
  slug: string;
  label: string;
  products: ImportedProduct[];
  optionCount: number;
};

function resolve(slug: string): Resolved | null {
  if (ALL_CATEGORY_SLUGS.includes(slug)) {
    return {
      kind: "category",
      slug,
      label: CATEGORY_LABEL[slug],
      products: ALL_PRODUCTS.filter((p) => p.category === slug),
      optionCount: offersForCategory(slug).length,
    };
  }

  if (ALL_FINISH_SLUGS.includes(slug)) {
    const products = ALL_PRODUCTS.filter((p) => p.finish === slug);
    return {
      kind: "finish",
      slug,
      label: FINISH_LABEL[slug],
      products,
      optionCount: products.reduce((n, p) => n + p.variants.length, 0),
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
  const found = resolve(slug);
  if (!found) return { title: "Collection not found" };

  return {
    title: `${found.label} skins`,
    description:
      found.kind === "category"
        ? `Precision-cut protective skins for ${found.label.toLowerCase()} models. Cut per model, no trimming.`
        : `${found.label} finish skins, cut for your exact device.`,
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const found = resolve(slug);
  if (!found) notFound();

  const { label, kind, products, optionCount } = found;

  return (
    <div className="page py-8 md:py-10">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-[12px] text-text-low">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-text-hi">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-text-mid">{label}</li>
        </ol>
      </nav>

      {/* title block */}
      <header className="mt-5 border-b border-hairline pb-6">
        <p className="kicker">
          {kind === "category" ? "Shop by device" : "Shop by finish"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">
          {label} skins
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-mid">
          Every skin is cut for one specific model — nothing to trim, nothing
          to measure. 0.2&nbsp;mm film, removable adhesive, no residue.
        </p>

        {products.length > 0 && (
          <p className="mt-4 text-[12px] text-text-low tabular-nums">
            {products.length} design{products.length === 1 ? "" : "s"}
            <span className="px-1.5">·</span>
            {optionCount} option{optionCount === 1 ? "" : "s"}
          </p>
        )}
      </header>

      {/* filter rail: the other collections, so a dead end is one tap out */}
      <div className="rail mt-6 flex gap-1.5 overflow-x-auto pb-1">
        <RailLink href="/find" label="Find my device" accent />
        {CATEGORIES.filter((c) => c.slug !== "uncategorised").map((c) => (
          <RailLink
            key={c.slug}
            href={`/collections/${c.slug}`}
            label={c.label}
            count={c.count}
            active={c.slug === slug}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyCollection label={label} />
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <li key={p.slug}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>

          {/* The finder is faster than this grid for anyone who knows
              their model, so it is offered rather than hidden. */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-5 py-4">
            <p className="text-[13px] text-text-mid">
              Know your model already? Skip the browsing.
            </p>
            <Link
              href={`/find${kind === "category" ? `?device=${slug}` : ""}`}
              className="rounded-[var(--r-md)] bg-accent px-4 py-2 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Search your device →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function RailLink({
  href,
  label,
  count,
  active = false,
  accent = false,
}: {
  href: string;
  label: string;
  count?: number;
  active?: boolean;
  accent?: boolean;
}) {
  const base =
    "shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition-colors";
  const tone = accent
    ? "border-accent text-accent hover:bg-accent-soft"
    : active
      ? "border-accent bg-accent text-accent-ink"
      : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi";

  return (
    <Link href={href} className={`${base} ${tone}`} aria-current={active ? "page" : undefined}>
      {label}
      {count !== undefined && (
        <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
      )}
    </Link>
  );
}

function EmptyCollection({ label }: { label: string }) {
  return (
    <div className="mt-8 rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-text-hi">
        No {label.toLowerCase()} skins cut yet
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-mid">
        We template new devices every week and there is no extra charge for a
        first cut. Tell us the exact model and we will get it on the plotter.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/request-model"
          className="rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Request this model
        </Link>
        <Link
          href="/find"
          className="rounded-[var(--r-md)] border border-hairline px-5 py-2.5 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
        >
          Browse what we have
        </Link>
      </div>
    </div>
  );
}
