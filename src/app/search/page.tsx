import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { DEVICE_CATEGORIES, searchProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const results = searchProducts(q);

  return (
    <div className="page py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text-hi">
        Search
      </h1>

      <form action="/search" className="mt-6 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">
          Search skins
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Carbon fibre, matte, leather, texture…"
          className="min-w-0 flex-1 rounded-[var(--r-md)] border border-hairline bg-surface-0 px-4 py-3 text-sm text-text-hi placeholder:text-text-low"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      {q === "" ? (
        <div className="mt-12">
          <p className="kicker">Browse by device instead</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {DEVICE_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="inline-block rounded-full border border-hairline px-3.5 py-2 text-[13px] text-text-mid transition-colors hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className="card mt-10 grid place-items-center px-6 py-20 text-center">
          <p className="text-sm text-text-hi">
            Nothing matched “{q}”.
          </p>
          <p className="mt-1 max-w-sm text-[13px] text-text-mid">
            Try a finish name like “texture” or “embossed”, a colour, or browse
            a device category.
          </p>
          <Link
            href="/request-model"
            className="mt-5 rounded-[var(--r-md)] border border-hairline-strong px-4 py-2 text-[13px] font-medium text-text-hi hover:bg-surface-2"
          >
            Request a design
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-[13px] text-text-mid tabular-nums">
            {results.length} {results.length === 1 ? "design" : "designs"} for
            “{q}”
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
