import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBrandsForCategory,
  getCategoryBySlug,
  getSkinsForCategory,
} from "@/lib/catalog";
import { formatPaise } from "@/lib/money";

/**
 * The device page: what we can skin this in, and for how much.
 *
 * This asked for a design collection first - Texture, Embossed - and
 * put the only priced choice at the very end, after a design, a
 * brand and a model. Four screens before a number. The shop owner
 * said it plainly: a customer picks a skin category, then the skins
 * in it, then the model.
 *
 * The skin category is what the price lists are built on. A sheet
 * per brand, a row per model, a column per thing you can buy:
 * Printed Skin, Variable Lamination, Korean Skin, Imported Skin for
 * a camera; Full Wrap, Back With Sides, Back Only for a phone. The
 * column is the product, because the column is what has a price.
 *
 *   Categories -> this -> brand and model -> cart
 *
 * The design collections have not gone anywhere - they are under
 * Designs in the header, where browsing artwork belongs. They are
 * not a step on the way to buying, because no design in the shop is
 * priced; the column is.
 *
 * Browsing by brand still exists under /skins/<category>/<brand>.
 * It is not linked from here: a second door under the first only
 * makes the page ask two questions at once.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/skins/[category]">): Promise<Metadata> {
  const { category } = await params;
  const row = await getCategoryBySlug(category);
  if (!row) return { title: "Not found" };

  return {
    title: `${row.name} Skins`,
    description:
      row.tagline ??
      `Precision-cut protective skins, made for your exact ${row.name.toLowerCase()}.`,
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/skins/[category]">) {
  const { category } = await params;

  const [row, skins, brands] = await Promise.all([
    getCategoryBySlug(category),
    getSkinsForCategory(category),
    getBrandsForCategory(category),
  ]);
  if (!row) notFound();

  // Both the heading and the sentence under it are the category's
  // own, editable in the dashboard. They used to be a map in code,
  // which meant a category added there had no words of its own.
  const label = row.name;
  const blurb =
    row.tagline ??
    `Precision-cut protective skins, made for your exact ${label.toLowerCase()}.`;

  return (
    <div className="page py-10 md:py-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-text-mid">{label}</span>
      </nav>

      <header className="mx-auto max-w-[720px] text-center">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          Choose your style
        </span>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-text-hi md:text-[44px]">
          {label} Skins
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-text-mid">
          {blurb}
        </p>
      </header>

      {skins.length === 0 ? (
        <div className="mx-auto mt-12 max-w-[520px] rounded-[var(--r-md)] border border-hairline bg-surface-1 p-8 text-center">
          <h2 className="text-[18px] font-bold text-text-hi">
            Not in the list yet
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
            We have not priced {label.toLowerCase()} skins on the site yet. Tell
            us what you have and we will cut it and quote it.
          </p>
          <Link
            href="/request-model"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-accent-ink"
          >
            Request your model
          </Link>
        </div>
      ) : (
        <section className="mt-12 md:mt-16">
          <h2 className="text-center text-[26px] font-bold tracking-tight text-text-hi md:text-[32px]">
            Choose your skin
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-center text-[14px] text-text-mid">
            {brands.length} brand{brands.length === 1 ? "" : "s"}, cut to the
            millimetre. Pick a skin, then tell us the model.
          </p>

          <ul className="mx-auto mt-8 grid max-w-[1000px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {skins.map((skin) => (
              <li key={skin.slug}>
                <Link
                  href={`/skins/${category}/${skin.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface-1 transition-colors hover:border-accent"
                >
                  {/* Nobody has photographed the films yet, and all
                      twelve finish products carry the same stock
                      picture of the device - so the tile is set in
                      type. A photograph takes its place the moment
                      one is uploaded. */}
                  {skin.imageUrl && (
                    <span className="relative block aspect-[4/3] bg-surface-2">
                      <Image
                        src={skin.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </span>
                  )}

                  <span className="flex flex-1 flex-col p-5">
                    <span className="text-[17px] font-bold leading-tight text-text-hi group-hover:text-accent">
                      {skin.name}
                    </span>

                    <span className="mt-3 block text-[22px] font-bold text-accent">
                      {skin.fromPaise === skin.toPaise
                        ? formatPaise(skin.fromPaise)
                        : `From ${formatPaise(skin.fromPaise)}`}
                    </span>
                    {skin.fromPaise !== skin.toPaise && (
                      <span className="mt-1 block text-[12px] text-text-low">
                        up to {formatPaise(skin.toPaise)}, by model
                      </span>
                    )}

                    <span className="mt-4 block text-[12px] text-text-mid">
                      {skin.models} model{skin.models === 1 ? "" : "s"}
                    </span>
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
