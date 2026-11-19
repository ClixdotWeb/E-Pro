"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Empty, Pill } from "./ui";
import { formatPaise } from "@/lib/money";
import { CATEGORY_LABEL, type ImportedProduct } from "@/lib/realCatalog";

/**
 * Stock control.
 *
 * One row per buyable option, not per product, because stock is held
 * per option - "Sony Lens Skin" is not in or out of stock, "24-70mm GM
 * II" is.
 *
 * The number is editable right here. Typing in a list is the whole
 * point of this screen: counting shelves and typing numbers is one
 * task, and making someone open 205 product pages to do it would be
 * absurd. Changes are held until Save, so a mistyped digit can be
 * abandoned.
 *
 * Out-of-stock rows sort to the top by default, since those are the
 * ones costing money.
 */

type Row = {
  key: string;
  productSlug: string;
  productTitle: string;
  category: string | null;
  variantTitle: string;
  priceInPaise: number;
  stock: number;
};

export function StockTable({ products }: { products: ImportedProduct[] }) {
  const initial = useMemo<Row[]>(
    () =>
      products.flatMap((p) =>
        p.variants.map((v) => ({
          key: `${p.slug}:${v.shopifyId}`,
          productSlug: p.slug,
          productTitle: p.title,
          category: p.category,
          variantTitle: v.title,
          priceInPaise: v.priceInPaise,
          // The import only knows available/not, so this is a stand-in
          // until real counts are entered.
          stock: v.available ? 10 : 0,
        })),
      ),
    [products],
  );

  const [rows, setRows] = useState<Row[]>(initial);
  const [query, setQuery] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [dirty, setDirty] = useState<Record<string, number>>({});

  const stockOf = (r: Row) => dirty[r.key] ?? r.stock;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Inlined rather than calling stockOf, so the dependency list is
    // honestly just rows/query/onlyProblems/dirty.
    const current = (r: Row) => dirty[r.key] ?? r.stock;

    return rows
      .filter((r) => {
        if (onlyProblems && current(r) > 3) return false;
        if (!q) return true;
        return (
          r.productTitle.toLowerCase().includes(q) ||
          r.variantTitle.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => current(a) - current(b));
  }, [rows, query, onlyProblems, dirty]);

  const out = rows.filter((r) => stockOf(r) === 0).length;
  const low = rows.filter((r) => {
    const n = stockOf(r);
    return n > 0 && n <= 3;
  }).length;
  const changed = Object.keys(dirty).length;

  function setStock(key: string, value: string) {
    const n = Math.max(0, Number(value.replace(/[^0-9]/g, "")) || 0);
    setDirty((d) => ({ ...d, [key]: n }));
  }

  function save() {
    // Replaced by a Server Action once the database is connected.
    setRows((rs) => rs.map((r) => ({ ...r, stock: dirty[r.key] ?? r.stock })));
    setDirty({});
  }

  return (
    <>
      {/* counts */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Tally label="Out of stock" value={out} tone="danger" />
        <Tally label="Running low" value={low} tone="warning" />
        <Tally label="Options in total" value={rows.length} />
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <label htmlFor="stock-search" className="sr-only">
            Search options
          </label>
          <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-low">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            id="stock-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product or option"
            autoComplete="off"
            className="h-12 w-full rounded-[8px] border border-hairline bg-surface-1 pl-11 pr-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlyProblems((v) => !v)}
          aria-pressed={onlyProblems}
          className={`h-12 shrink-0 rounded-[8px] border px-5 text-[13px] transition-colors ${
            onlyProblems
              ? "border-accent bg-accent font-bold text-black"
              : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
          }`}
        >
          Only what needs restocking
        </button>
      </div>

      {/* rows */}
      {shown.length === 0 ? (
        <div className="mt-5">
          <Empty
            title="Nothing to show"
            body={
              onlyProblems
                ? "Everything has stock. Turn the filter off to see all options."
                : `No option matches “${query}”.`
            }
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
          <div className="hidden items-center gap-4 border-b border-hairline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low md:flex">
            <span className="flex-1">Option</span>
            <span className="w-[130px] text-right">Price</span>
            <span className="w-[110px] text-right">In stock</span>
          </div>

          <ul className="max-h-[62vh] overflow-y-auto">
            {shown.map((r) => {
              const n = stockOf(r);
              const edited = r.key in dirty && dirty[r.key] !== r.stock;

              return (
                <li
                  key={r.key}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-5 py-3 last:border-0 ${
                    edited ? "bg-accent-soft/40" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-text-hi">
                      {r.variantTitle || "Default"}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-text-low">
                      <Link
                        href={`/admin/products/${r.productSlug}`}
                        className="hover:text-accent hover:underline"
                      >
                        {r.productTitle}
                      </Link>
                      {r.category && (
                        <>
                          <span className="px-1.5">·</span>
                          {CATEGORY_LABEL[r.category] ?? r.category}
                        </>
                      )}
                    </p>
                  </div>

                  <p className="w-[130px] text-right text-[13px] tabular-nums text-text-mid">
                    {formatPaise(r.priceInPaise)}
                  </p>

                  <div className="flex w-[110px] items-center justify-end gap-2">
                    {n === 0 && <Pill tone="danger">Out</Pill>}
                    {n > 0 && n <= 3 && <Pill tone="warning">Low</Pill>}

                    <label className="sr-only" htmlFor={`stock-${r.key}`}>
                      Stock for {r.productTitle} {r.variantTitle}
                    </label>
                    <input
                      id={`stock-${r.key}`}
                      value={String(n)}
                      onChange={(e) => setStock(r.key, e.target.value)}
                      inputMode="numeric"
                      className={`h-10 w-16 rounded-[6px] border bg-surface-2 px-2 text-center text-[14px] font-bold tabular-nums text-text-hi focus:outline-none ${
                        n === 0
                          ? "border-danger/40 focus:border-danger"
                          : "border-hairline focus:border-accent"
                      }`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* save bar */}
      {changed > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface-1/95 px-5 py-3.5 backdrop-blur md:left-[240px] md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-text-mid">
              {changed} option{changed === 1 ? "" : "s"} changed.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDirty({})}
                className="text-[13px] text-text-mid hover:text-text-hi"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                className="inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover"
              >
                Save stock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Tally({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warning" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "border-danger/30 text-danger"
      : tone === "warning"
        ? "border-warning/30 text-warning"
        : "border-hairline text-text-hi";

  return (
    <div className={`rounded-[10px] border bg-surface-1 px-4 py-3 ${cls}`}>
      <span className="text-[20px] font-bold tabular-nums">{value}</span>
      <span className="ml-2 text-[12px] text-text-mid">{label}</span>
    </div>
  );
}
