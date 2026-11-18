import Link from "next/link";
import type { Metadata } from "next";
import { CatalogMedia } from "@/components/CatalogMedia";
import { formatPaise } from "@/lib/money";
import {
  CATEGORY_LABEL,
  FINISH_LABEL,
  NAV_CATEGORIES,
  getProductBySlug,
  optionLabelFor,
  searchOffers,
} from "@/lib/realCatalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every skin we cut, by device, brand or model.",
};

/**
 * Search results, shown as individual buyable options rather than
 * designs.
 *
 * Someone typing "24-70" wants the lens skin for that lens, not the
 * product family it happens to sit in, so a row here is one variant and
 * links to the product with that option in view. The finder at /find is
 * the faster path and is offered at the top.
 */
export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const results = q ? searchOffers(q, { limit: 60 }) : [];

  return (
    <div className="page py-8 md:py-10">
      <header className="border-b border-hairline pb-6">
        <p className="kicker">Catalog search</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">
          Search
        </h1>
      </header>

      <form action="/search" className="mt-6 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">
          Search skins
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="24-70, Sony, hp, iPhone…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-[var(--r-md)] border border-hairline bg-surface-0 px-4 py-3 text-sm text-text-hi placeholder:text-text-low focus:border-accent"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      <p className="mt-3 text-[12px] text-text-low">
        Want to add straight to the cart without leaving the page?{" "}
        <Link href="/find" className="text-accent hover:underline">
          Use the finder
        </Link>
        .
      </p>

      {q === "" ? (
        <div className="mt-12">
          <p className="kicker">Browse by device instead</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {NAV_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="inline-block rounded-full border border-hairline px-3.5 py-2 text-[13px] text-text-mid transition-colors hover:border-accent hover:text-accent"
                >
                  {c.name}
                  <span className="ml-1.5 tabular-nums opacity-55">
                    {c.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className="card mt-10 grid place-items-center px-6 py-20 text-center">
          <p className="text-sm text-text-hi">Nothing matched “{q}”.</p>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-text-mid">
            Try a brand (&ldquo;Sony&rdquo;), a focal length
            (&ldquo;24-70&rdquo;) or a model number — or ask us to cut it.
          </p>
          <Link
            href="/request-model"
            className="mt-5 rounded-[var(--r-md)] bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-ink"
          >
            Request this model
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-[13px] text-text-mid tabular-nums">
            {results.length}
            {results.length === 60 ? "+" : ""} option
            {results.length === 1 ? "" : "s"} for “{q}”
          </p>

          <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
            {results.map((offer) => {
              const product = getProductBySlug(offer.productSlug);
              const optionLabel = product ? optionLabelFor(product) : "Option";

              return (
                <li key={offer.id}>
                  <Link
                    href={`/products/${offer.productSlug}`}
                    className="flex items-center gap-3.5 py-3 transition-colors hover:bg-surface-1"
                  >
                    <CatalogMedia
                      src={offer.imageUrl}
                      seed={offer.productSlug}
                      alt={offer.productTitle}
                      sizes="56px"
                      className="h-14 w-14 shrink-0 rounded-[var(--r-sm)] border border-hairline"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-text-hi">
                        {offer.variantTitle}
                      </p>
                      <p className="truncate text-[11px] text-text-low">
                        {offer.productTitle}
                        <span className="px-1.5">·</span>
                        {offer.category
                          ? (CATEGORY_LABEL[offer.category] ?? offer.category)
                          : optionLabel}
                        {offer.finish && (
                          <>
                            <span className="px-1.5">·</span>
                            {FINISH_LABEL[offer.finish] ?? offer.finish}
                          </>
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-[13px] font-semibold tabular-nums text-text-hi">
                      {offer.available ? formatPaise(offer.priceInPaise) : "Sold out"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
