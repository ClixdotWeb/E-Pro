"use client";

import { useMemo, useState } from "react";
import {
  DEVICE_CATEGORIES,
  modelsForCategory,
  variantPriceInPaise,
  variantCompareAtInPaise,
  type Product,
} from "@/lib/catalog";
import { formatPaise } from "@/lib/money";

/**
 * Two-step selector: device category, then exact model.
 * Price updates with the category because a laptop skin uses far more
 * material than an earbud one. Add-to-cart stays disabled until a
 * specific model is chosen — a skin cut for the wrong model is scrap.
 */

type Props = {
  product: Product;
  initialCategory?: string;
};

export function DevicePicker({ product, initialCategory }: Props) {
  const available = DEVICE_CATEGORIES.filter((c) =>
    product.categories.includes(c.slug),
  );

  const [categorySlug, setCategorySlug] = useState(
    initialCategory && product.categories.includes(initialCategory)
      ? initialCategory
      : available[0]?.slug,
  );
  const [modelSlug, setModelSlug] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const models = useMemo(
    () => (categorySlug ? modelsForCategory(categorySlug) : []),
    [categorySlug],
  );

  const brands = useMemo(
    () => [...new Set(models.map((m) => m.brand))],
    [models],
  );

  if (!categorySlug) return null;

  const unit = variantPriceInPaise(product, categorySlug);
  const compareAt = variantCompareAtInPaise(product, categorySlug);
  const selectedModel = models.find((m) => m.slug === modelSlug) ?? null;

  function selectCategory(slug: string) {
    setCategorySlug(slug);
    setModelSlug(null); // a model from the old category would be wrong
    setAdded(false);
  }

  function addToCart() {
    if (!selectedModel) return;
    // Wired to POST /api/cart once the DB is connected. The server will
    // re-read the price from the variant row; this number is display only.
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div>
      {/* price */}
      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl font-semibold tabular-nums text-text-hi">
          {formatPaise(unit)}
        </span>
        {compareAt && compareAt > unit && (
          <>
            <span className="text-sm text-text-low line-through tabular-nums">
              {formatPaise(compareAt)}
            </span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
              Save {Math.round(((compareAt - unit) / compareAt) * 100)}%
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-[11px] text-text-low">
        Inclusive of all taxes · Free shipping over ₹499
      </p>

      {/* step 1: category */}
      <fieldset className="mt-7">
        <legend className="kicker">1 · Device type</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {available.map((c) => {
            const active = c.slug === categorySlug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => selectCategory(c.slug)}
                aria-pressed={active}
                className={`rounded-[var(--r-md)] border px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? "border-accent bg-accent-soft font-medium text-accent"
                    : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* step 2: model */}
      <fieldset className="mt-7">
        <legend className="kicker">2 · Your exact model</legend>

        <div className="mt-3 space-y-4">
          {brands.map((brand) => (
            <div key={brand}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-low">
                {brand}
              </p>
              <div className="flex flex-wrap gap-2">
                {models
                  .filter((m) => m.brand === brand)
                  .map((m) => {
                    const active = m.slug === modelSlug;
                    return (
                      <button
                        key={m.slug}
                        type="button"
                        onClick={() => {
                          setModelSlug(m.slug);
                          setAdded(false);
                        }}
                        aria-pressed={active}
                        className={`rounded-[var(--r-sm)] border px-2.5 py-1.5 text-[12px] transition-colors ${
                          active
                            ? "border-accent bg-accent text-accent-ink"
                            : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[12px] text-text-low">
          Model missing?{" "}
          <a href="/request-model" className="text-accent hover:underline">
            Request a cut
          </a>{" "}
          — usually ready in a week.
        </p>
      </fieldset>

      {/* step 3: quantity + add */}
      <div className="mt-8 flex gap-3">
        <div className="flex items-center rounded-[var(--r-md)] border border-hairline">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="px-3.5 py-3 text-text-mid disabled:opacity-35"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span
            className="min-w-8 text-center text-sm font-medium tabular-nums text-text-hi"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            disabled={qty >= 10}
            className="px-3.5 py-3 text-text-mid disabled:opacity-35"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={!selectedModel}
          className="flex-1 rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-text-low"
        >
          {added
            ? "Added to cart ✓"
            : selectedModel
              ? `Add to cart · ${formatPaise(unit * qty)}`
              : "Select your model"}
        </button>
      </div>

      <p className="mt-3 min-h-4 text-[12px]" aria-live="polite">
        {selectedModel ? (
          <span className="text-text-mid">
            Cut for{" "}
            <span className="text-text-hi">
              {selectedModel.brand} {selectedModel.name}
            </span>
          </span>
        ) : (
          <span className="text-text-low">
            Pick a model so we cut the right template.
          </span>
        )}
      </p>
    </div>
  );
}
