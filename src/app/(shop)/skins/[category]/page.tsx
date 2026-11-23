import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_INTRO, CATEGORY_LABEL } from "@/lib/catalog-shared";
import { getBrandsForCategory } from "@/lib/catalog";

/**
 * The device page: pick your brand.
 *
 * This is the live store's /pages/camera rebuilt around the thing a
 * customer actually has to answer first. Its version opened with the
 * design families ("Choose Your Style"), which is the wrong question -
 * a Texture skin is no use if it is not cut for your camera.
 *
 * Those design tiles are not here. They were, briefly, linking to
 * /collections/<style> - and every one of them was a 404, because no
 * product carries a style yet. They are empty on the live store too.
 * A tile that leads nowhere is worse than no tile, so they stay out
 * until there are designs behind them; STYLE_TILES still holds the
 * names and the images, and the model page shows them greyed as the
 * design step, so bringing them back is one block of markup.
 */

export const dynamic = "force-dynamic";

function introFor(category: string) {
  return (
    CATEGORY_INTRO[category] ?? {
      eyebrow: "Choose your device",
      heading: `${CATEGORY_LABEL[category] ?? category} Skins`,
      blurb: "Precision-cut protective skins, made for your exact model.",
    }
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/skins/[category]">): Promise<Metadata> {
  const { category } = await params;
  if (!CATEGORY_LABEL[category]) return { title: "Not found" };

  const intro = introFor(category);
  return { title: intro.heading, description: intro.blurb };
}

export default async function CategoryPage({
  params,
}: PageProps<"/skins/[category]">) {
  const { category } = await params;
  if (!CATEGORY_LABEL[category]) notFound();

  const intro = introFor(category);
  const brands = await getBrandsForCategory(category);

  return (
    <div className="page py-10 md:py-20">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-text-mid">{CATEGORY_LABEL[category]}</span>
      </nav>

      <header className="mx-auto max-w-[720px] text-center">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          {intro.eyebrow}
        </span>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-text-hi md:text-[44px]">
          {intro.heading}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-text-mid">
          {intro.blurb}
        </p>
      </header>

      {brands.length === 0 ? (
        <div className="mx-auto mt-12 max-w-[520px] rounded-[var(--r-md)] border border-hairline bg-surface-1 p-8 text-center">
          <h2 className="text-[18px] font-bold text-text-hi">
            Not in the list yet
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
            We have not added {CATEGORY_LABEL[category]?.toLowerCase()} models
            to the site yet. Tell us what you have and we will cut it.
          </p>
          <Link
            href="/request-model"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-accent-ink"
          >
            Request your model
          </Link>
        </div>
      ) : (
        <section className="mt-10 md:mt-14">
          <h2 className="sr-only">Brands</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {brands.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/skins/${category}/${b.slug}`}
                  className="group flex h-full flex-col justify-between rounded-[var(--r-md)] border border-hairline bg-surface-1 p-5 transition-colors hover:border-accent"
                >
                  <span className="text-[17px] font-bold text-text-hi transition-colors group-hover:text-accent">
                    {b.name}
                  </span>
                  <span className="mt-6 text-[12px] text-text-low">
                    {b.models} model{b.models === 1 ? "" : "s"}
                    {!b.onSale && (
                      <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-text-mid">
                        pricing soon
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
