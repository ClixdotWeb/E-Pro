"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Empty, Pill } from "./ui";
import { formatPaise } from "@/lib/money";
import { saveStock } from "@/app/admin/actions";

/**
 * Stock control.
 *
 * One row per buyable option, not per product, because stock is held
 * per option - "Camera Skins - Korean Skin" is not in or out of
 * stock, "Sony Alpha 7 IV" in that finish is.
 *
 * The number is editable right here. Typing in a list is the whole
 * point of this screen: counting shelves and typing numbers is one
 * task, and making someone open a thousand product pages to do it
 * would be absurd. Changes are held until Save, so a mistyped digit
 * can be abandoned.
 *
 * One product at a time, chosen in the dropdown, which navigates - the
 * server then sends only that product's rows. Picking a different
 * product discards nothing silently: the save bar warns first. The
 * page keys this component on the product, so arriving at a new one
 * remounts it and no typed number can survive onto the wrong rows.
 *
 * Out-of-stock rows sort to the top, since those are the ones costing
 * money.
 */

type Row = {
  /** the variant id - what the server updates */
  id: string;
  variantTitle: string;
  priceInPaise: number;
  stock: number;
};

type Choice = { slug: string; title: string; count: number };

export function StockTable({
  choices,
  selected,
  productTitle,
  rows: incoming,
}: {
  choices: Choice[];
  selected: string;
  productTitle: string;
  rows: Row[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(incoming);
  const [query, setQuery] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [dirty, setDirty] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const stockOf = (r: Row) => dirty[r.id] ?? r.stock;
  const changed = Object.keys(dirty).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Inlined rather than calling stockOf, so the dependency list is
    // honestly just these values.
    const current = (r: Row) => dirty[r.id] ?? r.stock;

    return rows
      .filter((r) => {
        if (onlyProblems && current(r) > 3) return false;
        if (!q) return true;
        return r.variantTitle.toLowerCase().includes(q);
      })
      .sort((a, b) => current(a) - current(b));
  }, [rows, query, onlyProblems, dirty]);

  const out = rows.filter((r) => stockOf(r) === 0).length;
  const low = rows.filter((r) => {
    const n = stockOf(r);
    return n > 0 && n <= 3;
  }).length;

  function setStock(id: string, value: string) {
    const n = Math.max(0, Number(value.replace(/[^0-9]/g, "")) || 0);
    setDirty((d) => ({ ...d, [id]: n }));
  }

  function switchProduct(slug: string) {
    if (
      changed > 0 &&
      !window.confirm(
        `${changed} change${changed === 1 ? "" : "s"} here have not been saved. Leave them?`,
      )
    ) {
      return;
    }
    setDirty({});
    router.push(`/admin/stock?product=${encodeURIComponent(slug)}`);
  }

  function save() {
    const changes = Object.entries(dirty).map(([id, stock]) => ({ id, stock }));
    setResult(null);

    startTransition(async () => {
      const res = await saveStock(changes);
      setResult(res);

      if (res.ok) {
        // Only now is the typed number the real one.
        setRows((rs) =>
          rs.map((r) => (r.id in dirty ? { ...r, stock: dirty[r.id] } : r)),
        );
        setDirty({});
      }
    });
  }

  return (
    <>
      {/* counts */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Tally label="Out of stock" value={out} tone="danger" />
        <Tally label="Running low" value={low} tone="warning" />
        <Tally label={`options in ${productTitle}`} value={rows.length} />
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[260px]">
          <label htmlFor="stock-product" className="sr-only">
            Product
          </label>
          <select
            id="stock-product"
            value={selected}
            onChange={(e) => switchProduct(e.target.value)}
            className="h-12 w-full rounded-[8px] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi focus:border-accent focus:outline-none"
          >
            {choices.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title} ({c.count})
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[240px] flex-1">
          <label htmlFor="stock-search" className="sr-only">
            Search options
          </label>
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-low"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            id="stock-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model"
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
                ? "Everything here has stock. Turn the filter off to see all options."
                : `No model matches “${query}”.`
            }
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
          <div className="hidden items-center gap-4 border-b border-hairline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low md:flex">
            <span className="flex-1">Model</span>
            <span className="w-[130px] text-right">Price</span>
            <span className="w-[110px] text-right">In stock</span>
          </div>

          <ul className="max-h-[62vh] overflow-y-auto">
            {shown.map((r) => {
              const n = stockOf(r);
              const edited = r.id in dirty && dirty[r.id] !== r.stock;

              return (
                <li
                  key={r.id}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-5 py-3 last:border-0 ${
                    edited ? "bg-accent-soft/40" : ""
                  }`}
                >
                  <p className="min-w-0 flex-1 truncate text-[14px] text-text-hi">
                    {r.variantTitle || "Default"}
                  </p>

                  <p className="w-[130px] text-right text-[13px] tabular-nums text-text-mid">
                    {formatPaise(r.priceInPaise)}
                  </p>

                  <div className="flex w-[110px] items-center justify-end gap-2">
                    {n === 0 && <Pill tone="danger">Out</Pill>}
                    {n > 0 && n <= 3 && <Pill tone="warning">Low</Pill>}

                    <label className="sr-only" htmlFor={`stock-${r.id}`}>
                      Stock for {r.variantTitle}
                    </label>
                    <input
                      id={`stock-${r.id}`}
                      value={String(n)}
                      onChange={(e) => setStock(r.id, e.target.value)}
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
      {(changed > 0 || result) && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface-1/95 px-5 py-3.5 backdrop-blur md:left-[240px] md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={`text-[13px] ${
                result && !result.ok ? "text-danger" : "text-text-mid"
              }`}
            >
              {changed > 0
                ? `${changed} option${changed === 1 ? "" : "s"} changed — not saved yet.`
                : result?.message}
            </p>

            {changed > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDirty({});
                    setResult(null);
                  }}
                  disabled={pending}
                  className="text-[13px] text-text-mid hover:text-text-hi disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save stock"}
                </button>
              </div>
            )}
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
