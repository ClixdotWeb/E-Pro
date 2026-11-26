import Link from "next/link";
import Image from "next/image";
import { getDesignCollections } from "@/lib/designs";

/**
 * "Our Collections" - the design-first way in.
 *
 * The live store put this under the category tiles, and it is the
 * half of the shop the categories do not cover: the categories ask
 * "what do you own", this asks "what do you want it to look like".
 * Both end at the same cart.
 *
 * One design per kind, the first one, so the row is five pictures
 * rather than fifty. The kind's name is the label and the whole tile
 * goes to its section on /designs.
 *
 * Renders nothing when there are no designs - a heading over an
 * empty row reads as a page that failed to load.
 */
export async function CollectionStrip() {
  const collections = await getDesignCollections();
  if (collections.length === 0) return null;

  return (
    <section className="page py-10 md:py-16">
      <h2 className="text-center text-[26px] font-bold tracking-tight text-text-hi md:text-[34px]">
        Our Collections
      </h2>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {collections.map((c) => {
          const cover = c.designs[0];
          return (
            <li key={c.slug}>
              <Link
                href={`/designs#${c.slug}`}
                className="group block overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface-1 transition-colors hover:border-hairline-strong"
              >
                <span className="relative block aspect-square bg-surface-2">
                  {cover.imageUrl && (
                    <Image
                      src={cover.imageUrl}
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
                      {c.designs.length} {c.designs.length === 1 ? "design" : "designs"}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
