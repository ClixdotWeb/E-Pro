"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogMedia } from "@/components/CatalogMedia";
import { Empty, Pill } from "./ui";
import { formatPaise } from "@/lib/money";
import { CATEGORY_LABEL, type ImportedProduct } from "@/lib/realCatalog";

/**
 * Product list.
 *
 * One search box and one row of filters, nothing else above the table.
 * The filters are the three real problems in this catalogue rather
 * than a generic status dropdown, so a click goes straight from
 * "13 products have no photo" on the Overview to exactly those rows.
 *
 * Each row shows the things you need to decide whether to open it:
 * photo, name, category, how many options, price, and a flag when
 * something is wrong. Clicking anywhere on the row opens it - there is
 * no separate "edit" button to hunt for.
 */

type Filter = "all" | "no-photo" | "odd-price" | "no-category";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "no-photo", label: "No photo" },
  { id: "odd-price", label: "Odd price" },
  { id: "no-category", label: "No category" },
];

export function ProductTable({
  products,
  initialFilter = "all",
}: {
  products: ImportedProduct[];
  initialFilter?: Filter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const counts = useMemo(
    () => ({
      all: products.length,
      "no-photo": products.filter((p) => p.missingImages).length,
      "odd-price": products.filter((p) => p.suspiciousPrices.length > 0).length,
      "no-category": products.filter((p) => !p.category).length,
    }),
    [products],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      if (filter === "no-photo" && !p.missingImages) return false;
      if (filter === "odd-price" && p.suspiciousPrices.length === 0) return false;
      if (filter === "no-category" && p.category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.variants.some((v) => v.title.toLowerCase().includes(q))
      );
    });
  }, [products, query, filter]);

  return (
    <>
      {/* search */}
      <div className="relative">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-low">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" />
          </svg>
        </span>
        <input
          id="product-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or option"
          autoComplete="off"
          className="h-12 w-full rounded-[8px] border border-hairline bg-surface-1 pl-11 pr-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        />
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = counts[f.id];
          const active = filter === f.id;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              disabled={n === 0 && f.id !== "all"}
              className={`rounded-full border px-4 py-2 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? "border-accent bg-accent text-black font-bold"
                  : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
              }`}
            >
              {f.label}
              <span className="ml-2 opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-[13px] text-text-mid" aria-live="polite">
        Showing {rows.length} of {products.length}
      </p>

      {/* rows */}
      {rows.length === 0 ? (
        <div className="mt-4">
          <Empty
            title="Nothing matches"
            body={
              query
                ? `No product matches “${query}”. Try part of the name, or clear the filter.`
                : "No product is in this state right now."
            }
          />
        </div>
      ) : (
        <ul className="mt-4 overflow-hidden rounded-[12px] border border-hairline">
          {rows.map((p) => (
            <li key={p.slug} className="border-b border-hairline last:border-0">
              <Link
                href={`/admin/products/${p.slug}`}
                className="flex items-center gap-4 bg-surface-1 p-4 transition-colors hover:bg-surface-2"
              >
                <CatalogMedia
                  src={p.images[0] ?? null}
                  seed={p.slug}
                  alt=""
                  sizes="56px"
                  className="h-14 w-14 shrink-0 rounded-[8px]"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-text-hi">
                    {p.title}
                  </p>
                  <p className="mt-1 truncate text-[12px] text-text-low">
                    {p.category
                      ? (CATEGORY_LABEL[p.category] ?? p.category)
                      : "No category"}
                    <span className="px-1.5">·</span>
                    {p.variants.length} option
                    {p.variants.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="hidden shrink-0 gap-2 sm:flex">
                  {p.missingImages && <Pill tone="warning">No photo</Pill>}
                  {p.suspiciousPrices.length > 0 && (
                    <Pill tone="danger">Odd price</Pill>
                  )}
                </div>

                <p className="shrink-0 text-right text-[13px] text-text-hi">
                  {formatPaise(p.minPriceInPaise)}
                </p>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-text-low">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
