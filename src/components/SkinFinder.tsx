"use client";

import { useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  FINISH_LABEL,
  searchOffers,
  swatchFor,
  type Offer,
} from "@/lib/realCatalog";
import { formatPaise } from "@/lib/money";

/**
 * One screen, one input, straight to add-to-cart.
 *
 * Replaces the old journey (home -> category -> finish filter -> product
 * -> device type -> model grid of 44 buttons), which took three page loads
 * before a customer could buy anything. Here, typing "24-70" or "hp" lands
 * on the exact buyable row. Nothing navigates; the URL is not even touched
 * until checkout.
 */

type Props = {
  /** compact variant for the home hero */
  compact?: boolean;
  initialCategory?: string;
};

export function SkinFinder({ compact = false, initialCategory }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [added, setAdded] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const limit = compact ? 6 : 50;

  const results = useMemo(
    () => searchOffers(query, { category, limit }),
    [query, category, limit],
  );

  // Reset the keyboard cursor whenever the result set changes, adjusted
  // during render so no frame is painted with a stale highlight.
  const resultKey = `${query}\u0000${category}`;
  const [lastResultKey, setLastResultKey] = useState(resultKey);
  if (lastResultKey !== resultKey) {
    setLastResultKey(resultKey);
    setActiveIndex(0);
  }

  function addOffer(offer: Offer) {
    // Wired to POST /api/cart once the DB is connected. The server will
    // re-read the price from the variant row; this is optimistic UI only.
    setAdded((prev) => ({ ...prev, [offer.id]: (prev[offer.id] ?? 0) + 1 }));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const offer = results[activeIndex];
      if (offer?.available) addOffer(offer);
    }
  }

  const totalAdded = Object.values(added).reduce((n, v) => n + v, 0);

  return (
    <div className={compact ? "" : "card p-5 md:p-6"}>
      {/* search */}
      <div className="relative">
        <label htmlFor="skin-finder" className="sr-only">
          Search your device
        </label>
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-low"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" />
          </svg>
        </span>

        <input
          id="skin-finder"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your device — 24-70, Sony, hp, iPhone…"
          autoComplete="off"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="skin-finder-results"
          className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 py-3.5 pl-11 pr-11 text-sm text-text-hi placeholder:text-text-low focus:border-accent"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-low hover:text-text-hi"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* category chips */}
      <div className="rail mt-3 flex gap-1.5 overflow-x-auto pb-1">
        <Chip
          label="All"
          active={category === "all"}
          onClick={() => setCategory("all")}
        />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.slug}
            label={c.label}
            count={c.count}
            active={category === c.slug}
            onClick={() => setCategory(c.slug)}
          />
        ))}
      </div>

      {/* results */}
      <p className="mt-4 text-[12px] text-text-low tabular-nums" aria-live="polite">
        {results.length === 0
          ? "No match"
          : `${results.length}${results.length === limit ? "+" : ""} option${results.length === 1 ? "" : "s"}`}
        {query && ` for “${query}”`}
      </p>

      {results.length === 0 ? (
        <div className="mt-3 rounded-[var(--r-md)] border border-hairline px-4 py-8 text-center">
          <p className="text-[13px] text-text-hi">
            We have not cut that one yet.
          </p>
          <a
            href="/request-model"
            className="mt-3 inline-block rounded-[var(--r-sm)] bg-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink"
          >
            Request this model
          </a>
        </div>
      ) : (
        <ul
          id="skin-finder-results"
          ref={listRef}
          role="listbox"
          className={`mt-3 divide-y divide-hairline overflow-y-auto rounded-[var(--r-md)] border border-hairline ${
            compact ? "max-h-[320px]" : "max-h-[560px]"
          }`}
        >
          {results.map((offer, i) => (
            <OfferRow
              key={offer.id}
              offer={offer}
              active={i === activeIndex}
              addedCount={added[offer.id] ?? 0}
              onAdd={() => addOffer(offer)}
              onHover={() => setActiveIndex(i)}
            />
          ))}
        </ul>
      )}

      {totalAdded > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--r-md)] bg-accent-soft px-4 py-3">
          <p className="text-[13px] text-accent">
            {totalAdded} {totalAdded === 1 ? "item" : "items"} in cart
          </p>
          <a
            href="/cart"
            className="rounded-[var(--r-sm)] bg-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink"
          >
            Go to cart →
          </a>
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
      )}
    </button>
  );
}

function OfferRow({
  offer,
  active,
  addedCount,
  onAdd,
  onHover,
}: {
  offer: Offer;
  active: boolean;
  addedCount: number;
  onAdd: () => void;
  onHover: () => void;
}) {
  const [from, to] = swatchFor(offer.productSlug);

  return (
    <li
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
        active ? "bg-surface-2" : ""
      }`}
    >
      {/* thumbnail: real photo when Shopify has one, swatch when it does not */}
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--r-sm)]">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-text-hi">
          {offer.variantTitle}
        </p>
        <p className="truncate text-[11px] text-text-low">
          {offer.productTitle}
          <span className="px-1.5">·</span>
          {offer.categoryLabel}
          {offer.finish && (
            <>
              <span className="px-1.5">·</span>
              {FINISH_LABEL[offer.finish] ?? offer.finish}
            </>
          )}
        </p>
      </div>

      <p className="shrink-0 text-[13px] font-semibold tabular-nums text-text-hi">
        {formatPaise(offer.priceInPaise)}
      </p>

      <button
        type="button"
        onClick={onAdd}
        disabled={!offer.available}
        className={`shrink-0 rounded-[var(--r-sm)] px-3 py-1.5 text-[12px] font-semibold transition-colors ${
          offer.available
            ? addedCount > 0
              ? "bg-success/20 text-success"
              : "bg-accent text-accent-ink hover:bg-accent-hover"
            : "cursor-not-allowed bg-surface-3 text-text-low"
        }`}
      >
        {!offer.available
          ? "Sold out"
          : addedCount > 0
            ? `✓ ${addedCount}`
            : "Add"}
      </button>
    </li>
  );
}
