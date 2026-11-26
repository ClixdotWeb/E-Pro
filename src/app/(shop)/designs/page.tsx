import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Empty } from "@/components/admin/ui";
import { getDesignCollections } from "@/lib/designs";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Designs",
  description:
    "Every skin we print, by kind. Pick the artwork, then tell us what you own.",
};

/**
 * Every design, grouped by kind.
 *
 * The entry point for the design-first route. Kinds with nothing in
 * them are left out rather than shown empty - a heading over no
 * pictures reads as a page that failed to load.
 */
export default async function DesignsPage() {
  const collections = await getDesignCollections();

  return (
    <div className="page py-10 md:py-14">
      <h1 className="text-[30px] font-bold tracking-tight text-text-hi md:text-[38px]">
        Our Collections
      </h1>
      <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-text-mid">
        Pick the artwork first, then tell us what you own. Every design is
        cut to the millimetre for your exact device.
      </p>

      {collections.length === 0 ? (
        <div className="mt-10">
          <Empty
            title="No designs yet"
            body="They appear here as soon as the first one is added."
          />
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {collections.map((c) => (
            <section key={c.slug} id={c.slug}>
              <h2 className="mb-5 text-[19px] font-bold tracking-tight text-text-hi">
                {c.name}
              </h2>

              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {c.designs.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/designs/${d.slug}`}
                      className="group block overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface-1 transition-colors hover:border-hairline-strong"
                    >
                      <span className="relative block aspect-square bg-surface-2">
                        {d.imageUrl && (
                          <Image
                            src={d.imageUrl}
                            alt={d.name}
                            fill
                            sizes="(min-width: 1024px) 18vw, 45vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        )}
                      </span>
                      <span className="block px-4 py-3.5">
                        <span className="block text-[14px] font-bold text-text-hi">
                          {d.name}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-text-low">
                          {d.priceInPaise > 0
                            ? `From ${formatPaise(d.priceInPaise)}`
                            : "Price by device"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
