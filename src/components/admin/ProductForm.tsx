"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "./ui";
import { CatalogMedia } from "@/components/CatalogMedia";
import { formatPaise } from "@/lib/money";
import { CATEGORY_LABEL, FINISH_LABEL } from "@/lib/realCatalog";

/**
 * Add / edit a product.
 *
 * The shape of this screen is the point. It is one column, in the
 * order someone actually fills a product in: what it is, what it looks
 * like, where it belongs, what you can buy, and only then the search
 * settings most people never touch.
 *
 * Rules it follows, so nobody has to think:
 *
 *  - Every field says what it is for underneath, in plain words.
 *  - Nothing is required that does not have to be. Name and one option
 *    with a price is the whole minimum, and the save bar says so.
 *  - The save bar is always visible and always says whether there is
 *    anything to save. No hunting for a button at the bottom.
 *  - Prices are typed in rupees, because that is what a person has in
 *    their head, and converted to paise on the way in. Money is never
 *    stored as a float.
 *  - Deleting anything asks first, in a sentence that names the thing.
 *
 * Nothing saves yet - there is no database. The form is complete so
 * that wiring it is one Server Action, not a redesign.
 */

export type VariantDraft = {
  key: string;
  title: string;
  /** rupees as typed, kept as a string so the field can be empty */
  price: string;
  stock: string;
  sku: string;
};

export type ProductDraft = {
  title: string;
  slug: string;
  description: string;
  category: string;
  finish: string;
  status: "draft" | "active";
  optionLabel: string;
  images: string[];
  variants: VariantDraft[];
};

export const EMPTY_DRAFT: ProductDraft = {
  title: "",
  slug: "",
  description: "",
  category: "",
  finish: "",
  status: "draft",
  optionLabel: "Model",
  images: [],
  variants: [{ key: "v1", title: "", price: "", stock: "", sku: "" }],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  initial,
  mode,
}: {
  initial: ProductDraft;
  mode: "new" | "edit";
}) {
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setTouched(true);
    setSaved(false);
  }

  function setVariant(key: string, patch: Partial<VariantDraft>) {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)),
    }));
    setTouched(true);
    setSaved(false);
  }

  function addVariant() {
    setDraft((d) => ({
      ...d,
      variants: [
        ...d.variants,
        {
          key: `v${Date.now()}`,
          title: "",
          price: d.variants.at(-1)?.price ?? "",
          stock: "",
          sku: "",
        },
      ],
    }));
    setTouched(true);
    setSaved(false);
  }

  function removeVariant(key: string) {
    const v = draft.variants.find((x) => x.key === key);
    const name = v?.title.trim() || "this option";
    if (!confirm(`Remove ${name}? It will be gone when you save.`)) return;

    setDraft((d) => ({ ...d, variants: d.variants.filter((x) => x.key !== key) }));
    setTouched(true);
    setSaved(false);
  }

  // What is still missing before this can be saved, in plain words.
  const problems: string[] = [];
  if (!draft.title.trim()) problems.push("a name");
  if (draft.variants.length === 0) problems.push("at least one option");
  if (draft.variants.some((v) => !v.price.trim()))
    problems.push("a price on every option");

  const canSave = problems.length === 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    // Replaced by a Server Action once the database is connected.
    setSaved(true);
    setTouched(false);
  }

  const autoSlug = draft.slug || slugify(draft.title);

  return (
    <form onSubmit={onSubmit} className="pb-28">
      <div className="space-y-5">
        {/* ---- what it is ---- */}
        <Card title="What it is">
          <Field
            label="Name"
            hint="What a customer sees. For example: Sony Lens Skin."
            value={draft.title}
            onChange={(v) => set("title", v)}
            placeholder="Sony Lens Skin"
            autoFocus={mode === "new"}
          />

          <div className="mt-5">
            <Label htmlFor="description">Description</Label>
            <p className="mb-2 text-[12px] text-text-mid">
              Shown on the product page. Say what it fits and what it feels
              like. Two or three sentences is plenty.
            </p>
            <textarea
              id="description"
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              placeholder="Precision-cut 3M vinyl for the Sony 24-70mm GM II…"
              className="w-full resize-y rounded-[8px] border border-hairline bg-surface-2 px-4 py-3 text-[14px] leading-relaxed text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
            />
          </div>
        </Card>

        {/* ---- photos ---- */}
        <Card
          title="Photos"
          hint="The first photo is the one shown in the grid. Without one, a colour swatch is used instead."
        >
          <ul className="flex flex-wrap gap-3">
            {draft.images.map((src, i) => (
              <li key={src} className="relative">
                <CatalogMedia
                  src={src}
                  seed={autoSlug}
                  alt=""
                  sizes="112px"
                  className="h-28 w-28 rounded-[8px] border border-hairline"
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("Remove this photo?")) return;
                    set(
                      "images",
                      draft.images.filter((x) => x !== src),
                    );
                  }}
                  aria-label="Remove photo"
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-surface-3 text-text-mid transition-colors hover:bg-danger hover:text-white"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}

            <li>
              <button
                type="button"
                disabled
                title="Uploading needs file storage, which is not set up yet"
                className="grid h-28 w-28 place-items-center rounded-[8px] border border-dashed border-hairline-strong text-text-low disabled:cursor-not-allowed"
              >
                <span className="text-center text-[11px] leading-tight">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mx-auto mb-1.5">
                    <path d="M12 16V4M7 9l5-5 5 5" />
                    <path d="M4 16v3.5h16V16" />
                  </svg>
                  Add photo
                </span>
              </button>
            </li>
          </ul>

          <p className="mt-4 text-[12px] leading-relaxed text-text-low">
            Uploading is switched off until file storage is set up. Existing
            photos still come from the Shopify import.
          </p>
        </Card>

        {/* ---- where it belongs ---- */}
        <Card
          title="Where it belongs"
          hint="This decides which pages it shows up on."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Device</Label>
              <p className="mb-2 text-[12px] text-text-mid">
                Which device this is cut for.
              </p>
              <select
                id="category"
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3 text-[14px] text-text-hi focus:border-accent focus:outline-none"
              >
                <option value="">Not set</option>
                {Object.entries(CATEGORY_LABEL).map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
              {!draft.category && (
                <p className="mt-2 text-[12px] text-warning">
                  Without a device it will not appear when customers browse.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="finish">Finish</Label>
              <p className="mb-2 text-[12px] text-text-mid">
                The surface — texture, matte, printed and so on.
              </p>
              <select
                id="finish"
                value={draft.finish}
                onChange={(e) => set("finish", e.target.value)}
                className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3 text-[14px] text-text-hi focus:border-accent focus:outline-none"
              >
                <option value="">Not set</option>
                {Object.entries(FINISH_LABEL).map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ---- options ---- */}
        <Card
          title="What people can buy"
          hint="One row per thing a customer picks. A lens skin has one row per lens; a camera skin has one per brand."
        >
          <div className="mb-5 max-w-xs">
            <Label htmlFor="optionLabel">What are they choosing?</Label>
            <p className="mb-2 text-[12px] text-text-mid">
              The word shown above the choices.
            </p>
            <input
              id="optionLabel"
              value={draft.optionLabel}
              onChange={(e) => set("optionLabel", e.target.value)}
              placeholder="Model"
              className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
            />
          </div>

          <ul className="space-y-3">
            {draft.variants.map((v, i) => (
              <li
                key={v.key}
                className="grid gap-3 rounded-[8px] border border-hairline bg-surface-2 p-4 md:grid-cols-[1fr_130px_110px_140px_auto] md:items-end"
              >
                <div>
                  <Label htmlFor={`v-title-${v.key}`} small>
                    {draft.optionLabel || "Option"}
                  </Label>
                  <input
                    id={`v-title-${v.key}`}
                    value={v.title}
                    onChange={(e) => setVariant(v.key, { title: e.target.value })}
                    placeholder={i === 0 ? "24-70mm GM II" : ""}
                    className="h-10 w-full rounded-[6px] border border-hairline bg-surface-1 px-3 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <Label htmlFor={`v-price-${v.key}`} small>
                    Price (₹)
                  </Label>
                  <input
                    id={`v-price-${v.key}`}
                    value={v.price}
                    onChange={(e) =>
                      setVariant(v.key, {
                        price: e.target.value.replace(/[^0-9.]/g, ""),
                      })
                    }
                    inputMode="decimal"
                    placeholder="949"
                    className="h-10 w-full rounded-[6px] border border-hairline bg-surface-1 px-3 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <Label htmlFor={`v-stock-${v.key}`} small>
                    Stock
                  </Label>
                  <input
                    id={`v-stock-${v.key}`}
                    value={v.stock}
                    onChange={(e) =>
                      setVariant(v.key, {
                        stock: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    inputMode="numeric"
                    placeholder="0"
                    className="h-10 w-full rounded-[6px] border border-hairline bg-surface-1 px-3 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <Label htmlFor={`v-sku-${v.key}`} small>
                    Code (optional)
                  </Label>
                  <input
                    id={`v-sku-${v.key}`}
                    value={v.sku}
                    onChange={(e) => setVariant(v.key, { sku: e.target.value })}
                    placeholder="SNY-2470"
                    className="h-10 w-full rounded-[6px] border border-hairline bg-surface-1 px-3 font-mono text-[12px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(v.key)}
                  aria-label={`Remove ${v.title || "option"}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] text-text-low transition-colors hover:bg-danger/15 hover:text-danger"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 12.1A1.5 1.5 0 0 0 9.3 20.5h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addVariant}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-[8px] border border-hairline px-4 text-[13px] font-bold text-text-hi transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add another {(draft.optionLabel || "option").toLowerCase()}
          </button>

          {draft.variants.length > 1 && (
            <p className="mt-4 text-[12px] text-text-low">
              Cheapest shown on the shop:{" "}
              {(() => {
                const prices = draft.variants
                  .map((v) => Number(v.price))
                  .filter((n) => Number.isFinite(n) && n > 0);
                return prices.length
                  ? formatPaise(Math.round(Math.min(...prices) * 100))
                  : "—";
              })()}
            </p>
          )}
        </Card>

        {/* ---- visibility ---- */}
        <Card title="Visibility">
          <fieldset>
            <legend className="sr-only">Visibility</legend>
            <div className="space-y-3">
              <Radio
                name="status"
                checked={draft.status === "draft"}
                onChange={() => set("status", "draft")}
                title="Draft"
                body="Only you can see it. Nothing on the shop changes."
              />
              <Radio
                name="status"
                checked={draft.status === "active"}
                onChange={() => set("status", "active")}
                title="Live"
                body="Anyone can find it and buy it."
              />
            </div>
          </fieldset>
        </Card>

        {/* ---- link ---- */}
        <Card
          title="Web address"
          hint="Most people never need to change this."
        >
          <Label htmlFor="slug">Link</Label>
          <p className="mb-2 text-[12px] text-text-mid">
            Leave it alone and it is made from the name. Changing it on a
            product people already have bookmarked breaks those links.
          </p>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[13px] text-text-low">
              /products/
            </span>
            <input
              id="slug"
              value={draft.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder={slugify(draft.title) || "sony-lens-skin"}
              className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 font-mono text-[13px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
            />
          </div>
        </Card>
      </div>

      {/* ---- save bar ---- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface-1/95 px-5 py-3.5 backdrop-blur md:left-[240px] md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-text-mid" aria-live="polite">
            {saved ? (
              <span className="font-bold text-accent">
                Saved — except it is not, see below
              </span>
            ) : !canSave ? (
              <>
                Still needs {problems.join(", ")}.
              </>
            ) : touched ? (
              "Ready to save."
            ) : (
              "Nothing changed yet."
            )}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="text-[13px] text-text-mid hover:text-text-hi"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSave || !touched}
              className="inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {mode === "new" ? "Add product" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ---------------- small bits ---------------- */

function Label({
  htmlFor,
  small = false,
  children,
}: {
  htmlFor: string;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-bold text-text-hi ${
        small ? "mb-1.5 text-[12px]" : "mb-1 text-[14px]"
      }`}
    >
      {children}
    </label>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {hint && <p className="mb-2 text-[12px] text-text-mid">{hint}</p>}
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        {...rest}
      />
    </div>
  );
}

function Radio({
  name,
  checked,
  onChange,
  title,
  body,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  body: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-4 transition-colors ${
        checked
          ? "border-accent bg-accent-soft"
          : "border-hairline hover:border-hairline-strong"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span>
        <span className="block text-[14px] font-bold text-text-hi">
          {title}
        </span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-text-mid">
          {body}
        </span>
      </span>
    </label>
  );
}
