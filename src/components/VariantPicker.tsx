"use client";

import { useMemo, useState } from "react";
import { formatPaise } from "@/lib/money";
import type { ImportedVariant } from "@/lib/realCatalog";

/**
 * Variant picker for a real imported product.
 *
 * Two things in the source data shape this component:
 *
 *  1. Variant counts vary wildly - some products have 2 options, the
 *     Sony lens product has 44. Below the threshold it renders as a
 *     button grid; above it, a filterable list, because a 44-button
 *     grid was the exact thing that made the old flow unusable.
 *
 *  2. Variants within one product have different prices, so the price
 *     shown must follow the selection rather than sit above it.
 *
 * Nothing is added to the cart until a variant is chosen. A skin cut for
 * the wrong model is scrap, so there is no sensible default to preselect.
 */

const GRID_THRESHOLD = 12;

type Props = {
  productSlug: string;
  productTitle: string;
  variants: ImportedVariant[];
  /** what the variants actually name, e.g. "Model" or "Brand" */
  optionLabel: string;
};

export function VariantPicker({
  productSlug,
  productTitle,
  variants,
  optionLabel,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [added, setAdded] = useState(0);

  const asList = variants.length > GRID_THRESHOLD;

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return variants;
    return variants.filter((v) => v.title.toLowerCase().includes(q));
  }, [variants, filter]);

  const selected = variants.find((v) => v.shopifyId === selectedId) ?? null;

  function addToCart() {
    if (!selected?.available) return;
    // Wired to POST /api/cart once the database is connected. The server
    // re-reads the price from the variant row - this is optimistic UI,
    // and the number below is never what the customer is charged.
    setAdded((n) => n + 1);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold text-text-hi">
          Choose your {optionLabel.toLowerCase()}
        </h2>
        <span className="text-[11px] text-text-low tabular-nums">
          {variants.length} available
        </span>
      </div>

      {asList && (
        <div className="relative mt-3">
          <label htmlFor={`filter-${productSlug}`} className="sr-only">
            Filter {optionLabel.toLowerCase()}s
          </label>
          <input
            id={`filter-${productSlug}`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Filter ${variants.length} options…`}
            autoComplete="off"
            className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent"
          />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="mt-4 rounded-[var(--r-md)] border border-hairline px-4 py-6 text-center text-[13px] text-text-mid">
          Nothing matches “{filter}”.
        </p>
      ) : asList ? (
        <ul
          role="radiogroup"
          aria-label={optionLabel}
          className="mt-3 max-h-[320px] divide-y divide-hairline overflow-y-auto rounded-[var(--r-md)] border border-hairline"
        >
          {shown.map((v) => {
            const active = v.shopifyId === selectedId;
            return (
              <li key={v.shopifyId}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!v.available}
                  onClick={() => setSelectedId(v.shopifyId)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                    active
                      ? "bg-accent-soft"
                      : v.available
                        ? "hover:bg-surface-2"
                        : "cursor-not-allowed opacity-45"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text-hi">
                    {v.title}
                  </span>
                  <span className="shrink-0 text-[12px] tabular-nums text-text-mid">
                    {v.available ? formatPaise(v.priceInPaise) : "Sold out"}
                  </span>
                  <span
                    aria-hidden
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                      active ? "border-accent bg-accent" : "border-hairline-strong"
                    }`}
                  >
                    {active && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="3.5" strokeLinecap="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul role="radiogroup" aria-label={optionLabel} className="mt-3 grid grid-cols-2 gap-2">
          {shown.map((v) => {
            const active = v.shopifyId === selectedId;
            return (
              <li key={v.shopifyId}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!v.available}
                  onClick={() => setSelectedId(v.shopifyId)}
                  className={`w-full rounded-[var(--r-md)] border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent-soft"
                      : v.available
                        ? "border-hairline hover:border-hairline-strong"
                        : "cursor-not-allowed border-hairline opacity-45"
                  }`}
                >
                  <span className="block truncate text-[13px] font-medium text-text-hi">
                    {v.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] tabular-nums text-text-low">
                    {v.available ? formatPaise(v.priceInPaise) : "Sold out"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* price + add */}
      <div className="mt-6 border-t border-hairline pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Price</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-text-hi">
              {selected ? formatPaise(selected.priceInPaise) : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-text-low">
              GST included · shipping shown at checkout
            </p>
          </div>

          {selected && (
            <p className="text-right text-[12px] text-text-mid">
              {productTitle}
              <br />
              <span className="text-text-hi">{selected.title}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={!selected?.available}
          className={`mt-5 w-full rounded-[var(--r-md)] px-5 py-3.5 text-sm font-semibold transition-colors ${
            selected?.available
              ? added > 0
                ? "bg-success/20 text-success"
                : "bg-accent text-accent-ink hover:bg-accent-hover"
              : "cursor-not-allowed bg-surface-3 text-text-low"
          }`}
        >
          {!selected
            ? `Select a ${optionLabel.toLowerCase()} first`
            : !selected.available
              ? "Sold out"
              : added > 0
                ? `✓ Added (${added})`
                : "Add to cart"}
        </button>

        {added > 0 && (
          <a
            href="/cart"
            className="mt-2.5 block w-full rounded-[var(--r-md)] border border-hairline px-5 py-3 text-center text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
          >
            Go to cart →
          </a>
        )}
      </div>
    </div>
  );
}
