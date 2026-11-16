import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import {
  DEVICE_CATEGORIES,
  FINISH_LABEL,
  getCategory,
  modelsForCategory,
  brandsForCategory,
  productsForCategory,
  type Finish,
} from "@/lib/catalog";

export function generateStaticParams() {
  return DEVICE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return {
    title: `${cat.name} skins`,
    description: `Precision-cut protective skins for ${cat.name.toLowerCase()} models. ${cat.finishes.length} finishes, residue-free adhesive, shipped across India.`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;

  const cat = getCategory(slug);
  if (!cat) notFound();

  const raw = typeof sp.finish === "string" ? sp.finish : undefined;
  const activeFinish =
    raw && cat.finishes.includes(raw as Finish) ? (raw as Finish) : undefined;

  const products = productsForCategory(cat.slug, activeFinish);
  const models = modelsForCategory(cat.slug);
  const brands = brandsForCategory(cat.slug);

  const shape =
    cat.slug === "phone" ? "phone" : cat.slug === "laptop" ? "laptop" : "square";

  return (
    <>
      {/* breadcrumb + header */}
      <section className="border-b border-hairline bg-surface-1">
        <div className="page py-10">
          <nav aria-label="Breadcrumb" className="text-[12px] text-text-low">
            <Link href="/" className="hover:text-text-mid">
              Home
            </Link>
            <span className="px-1.5">/</span>
            <span className="text-text-mid">{cat.name}</span>
            {activeFinish && (
              <>
                <span className="px-1.5">/</span>
                <span className="text-text-mid">
                  {FINISH_LABEL[activeFinish]}
                </span>
              </>
            )}
          </nav>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-hi">
            {activeFinish ? `${FINISH_LABEL[activeFinish]} · ` : ""}
            {cat.name} skins
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-mid">
            {models.length} models cut and templated across{" "}
            {brands.length} brands. Pick a design, then choose your exact model
            on the next screen.
          </p>
        </div>
      </section>

      <div className="page grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
        {/* filters */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <p className="kicker">Finish</p>
          <ul className="mt-3 space-y-1">
            <li>
              <FilterPill
                href={`/collections/${cat.slug}`}
                active={!activeFinish}
                label="All finishes"
                count={productsForCategory(cat.slug).length}
              />
            </li>
            {cat.finishes.map((f) => (
              <li key={f}>
                <FilterPill
                  href={`/collections/${cat.slug}?finish=${f}`}
                  active={activeFinish === f}
                  label={FINISH_LABEL[f]}
                  count={productsForCategory(cat.slug, f).length}
                />
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <p className="kicker">Models we cut</p>
            <ul className="mt-3 space-y-3">
              {brands.map((brand) => (
                <li key={brand}>
                  <p className="text-[12px] font-semibold text-text-hi">
                    {brand}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-low">
                    {models
                      .filter((m) => m.brand === brand)
                      .map((m) => m.name)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              href="/request-model"
              className="mt-4 inline-block text-[12px] font-medium text-accent hover:underline"
            >
              Model not here? Request it →
            </Link>
          </div>

          {/* other categories */}
          <div className="mt-8 border-t border-hairline pt-6">
            <p className="kicker">Other devices</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {DEVICE_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/collections/${c.slug}`}
                    className="inline-block rounded-full border border-hairline px-2.5 py-1 text-[11px] text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* grid */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-[13px] text-text-mid tabular-nums">
              {products.length} {products.length === 1 ? "design" : "designs"}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="card grid place-items-center px-6 py-20 text-center">
              <p className="text-sm text-text-hi">
                No designs in this finish yet.
              </p>
              <p className="mt-1 max-w-xs text-[13px] text-text-mid">
                We rotate stock often — try another finish, or tell us what you
                are after.
              </p>
              <Link
                href={`/collections/${cat.slug}`}
                className="mt-5 rounded-[var(--r-md)] border border-hairline-strong px-4 py-2 text-[13px] font-medium text-text-hi hover:bg-surface-2"
              >
                Show all finishes
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <ProductCard
                    product={p}
                    categorySlug={cat.slug}
                    shape={shape}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function FilterPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`flex items-center justify-between rounded-[var(--r-sm)] px-2.5 py-2 text-[13px] transition-colors ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-text-mid hover:bg-surface-2 hover:text-text-hi"
      }`}
    >
      {label}
      <span className="text-[11px] tabular-nums opacity-60">{count}</span>
    </Link>
  );
}
