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
 * Each row carries Edit and Delete on the right. The row itself is
 * still clickable - a stretched link behind the content - so there are
 * two ways to open a product and neither is hidden in a menu. The
 * buttons sit above that link so they do not trigger it.
 *
 * Delete asks first, naming the product, and says what else goes with
 * it. It is the one irreversible thing on this screen.
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
  /** slugs removed in this session; real deletion needs the database */
  const [removed, setRemoved] = useState<string[]>([]);

  const live = useMemo(
    () => products.filter((p) => !removed.includes(p.slug)),
    [products, removed],
  );

  const counts = useMemo(
    () => ({
      all: live.length,
      "no-photo": live.filter((p) => p.missingImages).length,
      "odd-price": live.filter((p) => p.suspiciousPrices.length > 0).length,
      "no-category": live.filter((p) => !p.category).length,
    }),
    [live],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return live.filter((p) => {
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
  }, [live, query, filter]);

  function remove(p: ImportedProduct) {
    const ok = confirm(
      `Delete “${p.title}”?\n\n` +
        `Its ${p.variants.length} option${p.variants.length === 1 ? "" : "s"} go with it, and the product page stops working for anyone who has the link.\n\n` +
        `This cannot be undone.`,
    );
    if (!ok) return;
    setRemoved((r) => [...r, p.slug]);
  }

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
                  ? "border-accent bg-accent font-bold text-black"
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
        Showing {rows.length} of {live.length}
        {removed.length > 0 && (
          <span className="ml-2 text-text-low">
            · {removed.length} deleted this session
          </span>
        )}
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
        <div className="mt-4 overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
          <div className="hidden items-center gap-4 border-b border-hairline px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low sm:flex">
            <span className="w-14" />
            <span className="flex-1">Product</span>
            <span className="w-[180px]">Flags</span>
            <span className="w-[130px] text-right">From</span>
            <span className="w-[92px] text-right">Actions</span>
          </div>

          <ul>
            {rows.map((p) => (
              <li
                key={p.slug}
                className="relative flex items-center gap-4 border-b border-hairline p-4 transition-colors last:border-0 hover:bg-surface-2"
              >
                {/* stretched link - the whole row opens the product */}
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="absolute inset-0 z-0"
                  aria-label={`Edit ${p.title}`}
                />

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

                <div className="hidden w-[180px] shrink-0 flex-wrap gap-2 sm:flex">
                  {p.missingImages && <Pill tone="warning">No photo</Pill>}
                  {p.suspiciousPrices.length > 0 && (
                    <Pill tone="danger">Odd price</Pill>
                  )}
                </div>

                <p className="w-[130px] shrink-0 text-right text-[13px] font-bold tabular-nums text-text-hi">
                  {formatPaise(p.minPriceInPaise)}
                </p>

                {/* actions sit above the stretched link */}
                <div className="relative z-10 flex w-[92px] shrink-0 justify-end gap-1">
                  <Link
                    href={`/admin/products/${p.slug}`}
                    aria-label={`Edit ${p.title}`}
                    title="Edit"
                    className="grid h-9 w-9 place-items-center rounded-[8px] text-text-mid transition-colors hover:bg-surface-3 hover:text-text-hi"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
                    </svg>
                  </Link>

                  <button
                    type="button"
                    onClick={() => remove(p)}
                    aria-label={`Delete ${p.title}`}
                    title="Delete"
                    className="grid h-9 w-9 place-items-center rounded-[8px] text-text-low transition-colors hover:bg-danger/15 hover:text-danger"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 12.1A1.5 1.5 0 0 0 9.3 20.5h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
