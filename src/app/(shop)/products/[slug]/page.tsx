import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogMedia } from "@/components/CatalogMedia";
import { ProductCard } from "@/components/ProductCard";
import { VariantPicker } from "@/components/VariantPicker";
import { formatPaise } from "@/lib/money";
import {
  ALL_PRODUCTS,
  CATEGORY_LABEL,
  FINISH_LABEL,
  getProductBySlug,
  optionLabelFor,
  relatedProducts,
} from "@/lib/realCatalog";

/**
 * Product page in the live theme's layout: media column on the left,
 * a sticky buy box on the right, then assurances, specs and a related
 * rail underneath.
 */

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const plain = product.description.replace(/\s+/g, " ").trim();

  return {
    title: product.title,
    description:
      plain.slice(0, 155) ||
      `${product.title} — precision-cut protective skin, from ${formatPaise(product.minPriceInPaise)}.`,
    openGraph: product.images[0]
      ? { images: [{ url: product.images[0] }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const optionLabel = optionLabelFor(product);
  const related = relatedProducts(product);
  const categoryLabel = product.category
    ? (CATEGORY_LABEL[product.category] ?? product.category)
    : null;

  return (
    <div className="page py-8 md:py-10">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-[12px] text-text-low">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-text-hi">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          {product.category && categoryLabel ? (
            <>
              <li>
                <Link
                  href={`/collections/${product.category}`}
                  className="hover:text-text-hi"
                >
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden>/</li>
            </>
          ) : null}
          <li className="truncate text-text-mid">{product.title}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12">
        {/* ---- media ---- */}
        <div>
          <CatalogMedia
            src={product.images[0] ?? null}
            seed={product.slug}
            alt={product.title}
            priority
            sizes="(min-width: 1024px) 840px, 100vw"
            className="aspect-square rounded-[var(--r-lg)] border border-hairline"
          />

          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(0, 8).map((src, i) => (
                <li key={src}>
                  <CatalogMedia
                    src={src}
                    seed={`${product.slug}-${i}`}
                    alt={`${product.title}, view ${i + 2}`}
                    sizes="200px"
                    className="aspect-square rounded-[var(--r-md)] border border-hairline"
                  />
                </li>
              ))}
            </ul>
          )}

          {product.description && (
            <div className="mt-8 border-t border-hairline pt-6">
              <h2 className="text-sm font-semibold text-text-hi">
                About this skin
              </h2>
              <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-text-mid">
                {product.description}
              </p>
            </div>
          )}

          <SpecTable optionLabel={optionLabel} optionCount={product.variants.length} />
        </div>

        {/* ---- buy box ---- */}
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <div className="card p-5">
            <p className="kicker">
              {product.finish
                ? (FINISH_LABEL[product.finish] ?? product.finish)
                : (categoryLabel ?? "Skin")}
            </p>

            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-text-hi">
              {product.title}
            </h1>

            <p className="mt-2 text-sm text-text-mid tabular-nums">
              {formatPaise(product.minPriceInPaise)}
              {product.maxPriceInPaise > product.minPriceInPaise && (
                <> – {formatPaise(product.maxPriceInPaise)}</>
              )}
            </p>

            <div className="mt-6 border-t border-hairline pt-5">
              <VariantPicker
                productSlug={product.slug}
                productTitle={product.title}
                variants={product.variants}
                optionLabel={optionLabel}
              />
            </div>
          </div>

          <ul className="mt-4 grid gap-2.5">
            {[
              ["Cut for one model", "No trimming, no measuring, no overhang."],
              ["Peels off clean", "Removable adhesive, zero residue."],
              ["Dispatched in 1–2 days", "Tracking by email and WhatsApp."],
            ].map(([title, body]) => (
              <li
                key={title}
                className="flex gap-3 rounded-[var(--r-md)] border border-hairline bg-surface-1 px-4 py-3"
              >
                <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-text-hi">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-text-low">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-center text-[12px] text-text-low">
            Not your {optionLabel.toLowerCase()}?{" "}
            <Link href="/request-model" className="text-accent hover:underline">
              Request a cut
            </Link>
          </p>
        </div>
      </div>

      {/* ---- related ---- */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-hairline pt-10">
          <h2 className="text-lg font-semibold tracking-tight text-text-hi">
            You might also like
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SpecTable({
  optionLabel,
  optionCount,
}: {
  optionLabel: string;
  optionCount: number;
}) {
  const rows: [string, string][] = [
    ["Material", "Cast vinyl film, 0.2 mm"],
    ["Adhesive", "Removable, automotive-grade"],
    ["Finish durability", "2–3 years of daily use"],
    [`${optionLabel}s available`, String(optionCount)],
    ["Coverage", "Back and side panels; cutouts for ports and lenses"],
    ["Application", "Dry, no fluid; a hairdryer on low helps on curves"],
  ];

  return (
    <div className="mt-8 border-t border-hairline pt-6">
      <h2 className="text-sm font-semibold text-text-hi">Specifications</h2>
      <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[minmax(0,160px)_1fr] gap-4 py-3">
            <dt className="text-[12px] text-text-low">{k}</dt>
            <dd className="text-[13px] text-text-mid">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
