"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { formatPaise } from "@/lib/money";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import type { DesignRow } from "@/lib/designs";

/**
 * One collection's grid, laid out like the live store's:
 *
 *   breadcrumb        Home > Collections > Embossed
 *   Availability | Price                      N products
 *   the grid          2 columns, 4 from md
 *
 * The two filters are real. They were inert rectangles on the old
 * product grid because there was no stock or option data behind
 * them; here there is, and a control that does nothing is worse than
 * no control.
 *
 * Price sorts rather than filters, because a collection of five
 * designs does not need a range slider - "cheapest first" is the
 * whole of what anyone wants from it.
 */

type Sort = "featured" | "low" | "high";
type Availability = "all" | "available";

export function DesignGrid({
  slug,
  name,
  designs,
  device,
  tile,
}: {
  slug: string;
  name: string;
  designs: DesignRow[];
  device?: string;
  /** the films on the counter, when no device has been shot wearing one */
  tile?: string | null;
}) {
  const [availability, setAvailability] = useState<Availability>("all");
  const [sort, setSort] = useState<Sort>("featured");

  const shown = useMemo(() => {
    // "Available" means we can quote it without asking: a design with
    // no device list is cut for everything, which counts.
    const list =
      availability === "available"
        ? designs.filter((d) => d.deviceSlugs.length === 0 || d.active)
        : designs;

    if (sort === "featured") return list;

    const sorted = [...list].sort((a, b) => a.priceInPaise - b.priceInPaise);
    return sort === "low" ? sorted : sorted.reverse();
  }, [designs, availability, sort]);

  const query = device ? `?device=${device}` : "";

  return (
    <div className="page py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-7 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">›</span>
        {device ? (
          <Link href={`/skins/${device}`} className="hover:text-accent">
            {CATEGORY_LABEL[device] ?? device}
          </Link>
        ) : (
          <Link href="/designs" className="hover:text-accent">
            Collections
          </Link>
        )}
        <span className="px-2">›</span>
        <span className="text-text-mid">{name}</span>
      </nav>

      <h1 className="text-[28px] font-bold tracking-tight text-text-hi md:text-[36px]">
        {name}
        {device && (
          <span className="ml-3 align-middle text-[15px] font-medium text-text-low">
            for {CATEGORY_LABEL[device] ?? device}
          </span>
        )}
      </h1>

      {/* Availability | Price                            N products
          Hidden when the page is a shelf of films rather than a grid:
          there is nothing to sort, and "0 products" over a photograph
          of the stock reads as a contradiction. */}
      {!(shown.length === 0 && tile) && (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-hairline pb-5">
          <label className="sr-only" htmlFor="availability">
            Availability
          </label>
          <select
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
            className="h-11 rounded-[6px] border border-hairline bg-surface-1 px-4 text-[13.5px] font-bold text-text-hi focus:border-accent focus:outline-none"
          >
            <option value="all">Availability</option>
            <option value="available">In stock</option>
          </select>

          <label className="sr-only" htmlFor="price-sort">
            Price
          </label>
          <select
            id="price-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-11 rounded-[6px] border border-hairline bg-surface-1 px-4 text-[13.5px] font-bold text-text-hi focus:border-accent focus:outline-none"
          >
            <option value="featured">Price</option>
            <option value="low">Low to high</option>
            <option value="high">High to low</option>
          </select>

          <p className="ml-auto text-[14px] font-bold text-text-hi">
            {shown.length} {shown.length === 1 ? "product" : "products"}
          </p>
        </div>
      )}

      {shown.length === 0 ? (
        /* Nothing photographed on a device, but the films are here -
           so show the films. A shelf of rolls is a real thing to
           choose from, and it is what the shop would hold up in
           person. Without even that, there is only the ask. */
        <div className="mx-auto mt-10 max-w-[720px]">
          {tile && (
            <span className="relative block aspect-[4/3] overflow-hidden rounded-[var(--r-md)] border border-hairline">
              <Image
                src={tile}
                alt={`${name} films we stock`}
                fill
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover"
              />
            </span>
          )}
          <div className="mt-6 rounded-[var(--r-md)] border border-hairline bg-surface-1 p-7 text-center">
            <h2 className="text-[17px] font-bold text-text-hi">
              {tile
                ? `${name} — in stock, not yet photographed`
                : "Nothing in here yet"}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
              {tile
                ? "These are the rolls on our counter. Nobody has been photographed wearing one yet, so tell us the roll and your model and we will cut it and quote it."
                : "Ask us what we have — we cut more than is photographed."}
            </p>
            <Link
              href="/request-model"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-[14px] font-bold text-accent-ink"
            >
              {tile ? "Ask for one of these" : "Ask for a design"}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {shown.map((d) => (
            <li key={d.id}>
              <Link
                href={`/collections/${slug}/products/${d.slug}${query}`}
                className="group block"
              >
                <span className="relative block aspect-square overflow-hidden rounded-[var(--r-md)] border border-hairline bg-white">
                  {d.imageUrl && (
                    <Image
                      src={d.imageUrl}
                      alt={d.name}
                      fill
                      sizes="(min-width: 768px) 22vw, 45vw"
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  )}
                </span>
                <span className="mt-3 block text-[14px] font-bold text-text-hi group-hover:text-accent">
                  {d.name}
                </span>
                <span className="mt-0.5 block text-[13px] text-text-mid">
                  {d.fromPaise
                    ? `From ${formatPaise(d.fromPaise)}`
                    : d.priceInPaise > 0
                      ? formatPaise(d.priceInPaise)
                      : "Price by device"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
