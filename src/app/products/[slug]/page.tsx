import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { DevicePicker } from "@/components/DevicePicker";
import { ProductCard } from "@/components/ProductCard";
import { SkinVisual } from "@/components/SkinVisual";
import { Stars } from "@/components/Stars";
import {
  FINISH_LABEL,
  PRODUCTS,
  getCategory,
  getProduct,
} from "@/lib/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;

  const product = getProduct(slug);
  if (!product) notFound();

  const device = typeof sp.device === "string" ? sp.device : undefined;
  const category = device ? getCategory(device) : undefined;

  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.finish === product.finish,
  ).slice(0, 4);

  return (
    <>
      <div className="page grid gap-10 py-10 lg:grid-cols-2 lg:gap-16">
        {/* gallery */}
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-text-low">
            <Link href="/" className="hover:text-text-mid">
              Home
            </Link>
            <span className="px-1.5">/</span>
            {category ? (
              <>
                <Link
                  href={`/collections/${category.slug}`}
                  className="hover:text-text-mid"
                >
                  {category.name}
                </Link>
                <span className="px-1.5">/</span>
              </>
            ) : null}
            <span className="text-text-mid">{product.title}</span>
          </nav>

          <SkinVisual
            product={product}
            shape="square"
            className="shadow-pop"
          />

          {/* thumbnails — same design, different crops on launch */}
          <ul className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={`block w-full overflow-hidden rounded-[var(--r-md)] border transition-colors ${
                    i === 0
                      ? "border-accent"
                      : "border-hairline hover:border-hairline-strong"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <SkinVisual product={product} shape="square" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* buy box */}
        <div>
          <p className="kicker">{FINISH_LABEL[product.finish]}</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi">
            {product.title}
          </h1>

          <div className="mt-3">
            <Stars
              rating={product.rating}
              count={product.reviewCount}
              size="md"
            />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-text-mid">
            {product.description}
          </p>

          <div className="mt-7 h-px bg-hairline" />

          <div className="mt-7">
            <DevicePicker product={product} initialCategory={device} />
          </div>

          {/* assurances */}
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-hairline pt-6">
            {[
              "Dispatched in 1–2 business days",
              "Residue-free removal",
              "Precision-cut, no trimming",
              "30-day replacement on lifting",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-2 text-[12px] leading-snug text-text-mid"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-accent"
                  aria-hidden
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          {/* spec table */}
          <dl className="mt-8 divide-y divide-hairline border-y border-hairline text-[13px]">
            {[
              ["Finish", FINISH_LABEL[product.finish]],
              ["Thickness", "0.2 mm"],
              ["Material", "Automotive-grade vinyl, removable adhesive"],
              ["Cut for", `${product.categories.length} device types`],
              ["Includes", "Alcohol prep pad, squeegee card"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 py-3">
                <dt className="w-28 shrink-0 text-text-low">{k}</dt>
                <dd className="text-text-mid">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="page py-14">
          <header className="mb-6">
            <p className="kicker">Same finish</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi">
              You might also like
            </h2>
          </header>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} categorySlug={device} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
