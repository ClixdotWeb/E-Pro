import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandsForCategory, getCategoryBySlug } from "@/lib/catalog";
import { getCollectionsForDevice } from "@/lib/designs";

/**
 * The device page: Our Collections.
 *
 * This was a brand grid, which asked the wrong question second. By
 * the time someone has clicked Phone they have said what they own;
 * what they want next is to look at artwork, and the exact model is
 * a detail the product page settles. That is the order the live
 * store arrived at and it is the order here:
 *
 *   Categories -> Our Collections -> the grid -> the product
 *
 * A collection with nothing cut for this device is left out. A kind
 * with no phone designs in it is not a collection, it is a dead end -
 * which is what every one of those tiles was on the live store.
 *
 * Browsing by brand still exists under /skins/<category>/<brand>,
 * but it is not linked from here. The live store sends everybody
 * through the collections, and a second door under the first one
 * only makes the page ask two questions at once.
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

  const [row, collections, brands] = await Promise.all([
    getCategoryBySlug(category),
    getCollectionsForDevice(category),
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

      {brands.length === 0 ? (
        <div className="mx-auto mt-12 max-w-[520px] rounded-[var(--r-md)] border border-hairline bg-surface-1 p-8 text-center">
          <h2 className="text-[18px] font-bold text-text-hi">
            Not in the list yet
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
            We have not added {label?.toLowerCase()} models to the site yet.
            Tell us what you have and we will cut it.
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
            Our Collections
          </h2>

          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}?device=${category}`}
                  className="group block overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface-1 transition-colors hover:border-hairline-strong"
                >
                  <span className="relative block aspect-square bg-surface-2">
                    {c.coverUrl && (
                      <Image
                        src={c.coverUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 18vw, 45vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
                    />
                    <span className="absolute bottom-3 left-3 right-3">
                      <span className="block text-[14px] font-bold leading-tight text-white">
                        {c.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-white/60">
                        {c.count === 0
                          ? "Coming soon"
                          : `${c.count} ${c.count === 1 ? "design" : "designs"}`}
                      </span>
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
