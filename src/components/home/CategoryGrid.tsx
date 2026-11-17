import Link from "next/link";
import Image from "next/image";
import { NAV_CATEGORIES } from "@/lib/realCatalog";

/**
 * Categories — rebuilt from the live site's own custom-liquid section
 * and its CSS, after an earlier version used line-art SVG icons that
 * looked nothing like the real thing.
 *
 * The real section, verbatim from the theme's stylesheet:
 *
 *   .epro-category-grid  { grid-template-columns: repeat(5, 1fr);
 *                          column-gap: 20px; row-gap: 20px;
 *                          max-width: 1580px }
 *   .epro-category-card  { aspect-ratio: 1/1; border-radius: 12px }
 *   .epro-category-image { object-fit: cover;
 *                          transition: transform .45s ease }
 *   .epro-category-overlay { linear-gradient(to top,
 *                          rgba(0,0,0,.78) 0%, rgba(0,0,0,.42) 24%,
 *                          rgba(0,0,0,.12) 50%, rgba(0,0,0,0) 70%) }
 *   .epro-category-title { left: 23px; bottom: 22px; font-size: 17px;
 *                          font-weight: 700; letter-spacing: -.2px }
 *   hover: .epro-category-image { transform: scale(1.06) }
 *   breakpoints: 5 -> 4 -> 3 -> 2 columns
 *
 * The card order is the store's own, documented in a comment in their
 * Liquid: Phone, Camera, Lens, Laptop, Gimbal, Tablet, Gaming Console,
 * Drone, Charger, Wireless Earbuds.
 *
 * One deliberate difference: the live tiles link to /pages/<name>,
 * which on the real store are mostly empty stub pages. These link to
 * the category collection where we have stock, and to /request-model
 * where we do not, so no tile is a dead end.
 */

const TILES = [
  { slug: "phone", label: "Phone" },
  { slug: "camera", label: "Camera" },
  { slug: "lens", label: "Lens" },
  { slug: "laptop", label: "Laptop" },
  { slug: "gimbal", label: "Gimbal" },
  { slug: "tablet", label: "Tablet" },
  { slug: "gaming-consoles", label: "Gaming Console" },
  { slug: "drone", label: "Drone" },
  { slug: "charger", label: "Charger" },
  { slug: "wireless-earbuds", label: "Wireless Earbuds" },
];

export function CategoryGrid() {
  const counts = new Map(NAV_CATEGORIES.map((c) => [c.slug, c.count]));

  return (
    <section className="bg-surface-0 px-5 pb-6 pt-3 md:px-8">
      <h2 className="mb-5 text-center text-2xl font-bold tracking-tight text-text-hi md:text-[28px]">
        Categories
      </h2>

      <ul className="mx-auto grid max-w-[1580px] grid-cols-2 gap-x-[11px] gap-y-[14px] sm:grid-cols-3 sm:gap-x-[13px] sm:gap-y-[18px] lg:grid-cols-4 lg:gap-x-4 lg:gap-y-5 xl:grid-cols-5 xl:gap-5">
        {TILES.map(({ slug, label }) => {
          const count = counts.get(slug) ?? 0;

          return (
            <li key={slug}>
              <Link
                href={count > 0 ? `/collections/${slug}` : "/request-model"}
                aria-label={label}
                className="group relative isolate block aspect-square w-full overflow-hidden rounded-[9px] bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white md:rounded-xl"
              >
                <Image
                  src={`/brand/categories/${slug}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
                  className="object-cover transition-transform duration-[450ms] ease-out group-hover:scale-[1.06]"
                />

                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[1]"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 24%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0) 70%)",
                  }}
                />

                <span
                  className="absolute bottom-[13px] left-[13px] z-[2] text-sm font-bold leading-[1.2] tracking-[-0.2px] text-white md:bottom-[22px] md:left-[23px] md:text-[17px]"
                  style={{
                    textShadow:
                      "0 1px 3px rgba(0,0,0,0.8), 0 2px 5px rgba(0,0,0,0.45)",
                  }}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
