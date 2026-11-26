import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_INTRO, CATEGORY_LABEL } from "@/lib/catalog-shared";
import { getBrandsForCategory } from "@/lib/catalog";
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
 * Browsing by brand still exists under this URL and is linked at the
 * bottom, because someone who arrives knowing only "I have a Canon
 * R3" should not have to look through pictures to find out whether
 * we cut for it.
 */

export const dynamic = "force-dynamic";

function introFor(category: string) {
  return (
    CATEGORY_INTRO[category] ?? {
      eyebrow: "Choose your style",
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
  const [collections, brands] = await Promise.all([
    getCollectionsForDevice(category),
    getBrandsForCategory(category),
  ]);

  const label = CATEGORY_LABEL[category];

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
      ) : collections.length === 0 ? (
        <div className="mx-auto mt-12 max-w-[560px] rounded-[var(--r-md)] border border-hairline bg-surface-1 p-8 text-center">
          <h2 className="text-[18px] font-bold text-text-hi">
            Designs are on the way
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
            We cut for {brands.length} {label?.toLowerCase()} brand
            {brands.length === 1 ? "" : "s"}, but no artwork has been
            photographed for them yet. Browse by device, or ask us what we
            have.
          </p>
          <Link
            href={`/skins/${category}/${brands[0].slug}`}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-accent-ink"
          >
            Browse by device
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
                        {c.count} {c.count === 1 ? "design" : "designs"}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* The other way in, for someone who knows the device and
              not the look. */}
          <p className="mt-10 text-center text-[13px] text-text-low">
            Know your model already?{" "}
            <Link
              href={`/skins/${category}/${brands[0].slug}`}
              className="text-accent hover:underline"
            >
              Browse {label?.toLowerCase()} by brand
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
