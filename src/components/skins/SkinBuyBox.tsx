"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { formatPaise } from "@/lib/money";
import { addToCart } from "@/app/cart-actions";
import { getCoveragesFor, type DeviceCoverages } from "@/app/design-actions";
import { whatsappAboutDevice } from "@/lib/whatsapp";
import type { BrandModels } from "@/lib/catalog";

/**
 * One skin, onto one device.
 *
 * The customer has already said what they own and which skin they
 * want - that was the two clicks that got them here - so this asks
 * the one thing left: which model. Brand chips, then the models that
 * brand makes, then the price for that exact model and the button.
 *
 * The price is per model, which is why it cannot be shown earlier:
 * a Canon EOS R takes Rs. 899 in Printed Skin and an RF 24-105mm
 * takes Rs. 849, off the same column of the same sheet. The tile
 * that sent them here quoted the cheapest with "From".
 *
 * Brands wrap rather than scroll sideways, because a sideways strip
 * hides half of them behind a drag. They are ordered by how often
 * somebody walks in holding one, not by how many models we cut.
 *
 * A Samsung has 235 models, so there is a filter above the dropdown
 * once the list is long enough to be a scroll.
 *
 * If this model turns out not to take this skin - the price lists do
 * that, 64 phones take nothing but Back Only - it says so and offers
 * the ones it does take, rather than failing silently at the button.
 */

const SEARCH_FROM = 12;

export function SkinBuyBox({
  category,
  finish,
  finishName,
  brands,
  whatsapp,
}: {
  category: string;
  /** the finish slug this page is about; the option is not a choice here */
  finish: string;
  finishName: string;
  brands: BrandModels[];
  whatsapp?: string;
}) {
  const router = useRouter();

  const [brandSlug, setBrandSlug] = useState<string | null>(
    brands.length === 1 ? brands[0].slug : null,
  );
  const [query, setQuery] = useState("");
  const [modelId, setModelId] = useState("");
  const [device, setDevice] = useState<DeviceCoverages | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, startLoad] = useTransition();
  const [adding, startAdd] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const brand = brands.find((b) => b.slug === brandSlug) ?? null;

  const models = useMemo(() => {
    if (!brand) return [];
    const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!q) return brand.models;
    return brand.models.filter((m) =>
      m.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q),
    );
  }, [brand, query]);

  // The one option this page is about, out of everything the model
  // takes. Matched on the finish slug rather than its printed name,
  // so renaming "Korean Skin" in the dashboard cannot break buying.
  const option = device?.options.find((o) => o.finish === finish) ?? null;
  const alternatives =
    device?.options.filter((o) => o.finish !== finish && o.available) ?? [];

  const unit = option ? option.priceInPaise : null;
  const total = unit === null ? null : unit * quantity;

  function pickBrand(slug: string) {
    setBrandSlug(slug);
    setModelId("");
    setQuery("");
    setDevice(null);
    setResult(null);
  }

  function pickModel(id: string) {
    setModelId(id);
    setDevice(null);
    setResult(null);
    if (!id) return;
    startLoad(async () => setDevice(await getCoveragesFor(id)));
  }

  function add() {
    if (!option?.available) return;
    setResult(null);
    startAdd(async () => {
      const r = await addToCart({ variantId: option.variantId, quantity });
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  const label = adding
    ? "Adding…"
    : option?.available
      ? "Add to cart"
      : !brand
        ? "Pick a brand"
        : !device
          ? "Pick your model"
          : `Not cut in ${finishName}`;

  return (
    <div className="mx-auto mt-10 max-w-[760px]">
      {/* 1. brand */}
      <Step n={1} title="Select brand" value={brand?.name}>
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => pickBrand(b.slug)}
              aria-pressed={b.slug === brandSlug}
              className={`rounded-[var(--r-sm)] border px-4 py-2.5 text-[13.5px] font-bold transition-colors ${
                b.slug === brandSlug
                  ? "border-accent bg-accent-soft/40 text-accent"
                  : "border-hairline bg-surface-1 text-text-mid hover:border-hairline-strong hover:text-text-hi"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </Step>

      {/* 2. model */}
      <Step
        n={2}
        title={brand ? `Select ${brand.name} model` : "Select model"}
        required
        value={
          device?.deviceName ?? (brand ? undefined : "Pick a brand first")
        }
      >
        {brand && brand.models.length >= SEARCH_FROM && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${brand.models.length} ${brand.name} models`}
            aria-label={`Search ${brand.name} models`}
            className="mt-3 h-12 w-full min-w-0 rounded-[var(--r-sm)] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
          />
        )}

        <select
          value={modelId}
          disabled={!brand}
          onChange={(e) => pickModel(e.target.value)}
          aria-label="Model"
          className="mt-3 h-12 w-full min-w-0 rounded-[var(--r-sm)] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi focus:border-accent focus:outline-none disabled:opacity-50"
        >
          <option value="">
            {brand ? `Choose your ${brand.name} model…` : "Pick a brand first"}
          </option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Step>

      {/* price */}
      <div className="mt-8 border-t border-hairline pt-6">
        {loading && (
          <p className="text-[14px] text-text-mid">Checking the price…</p>
        )}

        {!loading && option?.available && (
          <>
            <p className="text-[13px] uppercase tracking-[0.1em] text-text-low">
              {finishName} for the {device?.deviceName}
            </p>
            <p className="mt-1 text-[30px] font-bold leading-none text-text-hi">
              {formatPaise(total ?? 0)}
            </p>
            {quantity > 1 && (
              <p className="mt-1 text-[12px] text-text-low">
                {formatPaise(unit ?? 0)} each
              </p>
            )}
          </>
        )}

        {!loading && device && option && !option.available && (
          <p className="text-[14px] leading-relaxed text-danger">
            We do not cut the {device.deviceName} in {finishName}
            {option.reason ? ` — ${option.reason.toLowerCase()}` : ""}.
          </p>
        )}

        {!loading && device && !option && (
          <p className="text-[14px] leading-relaxed text-danger">
            The {device.deviceName} is not cut in {finishName}.
          </p>
        )}

        {/* What it IS cut in, so a dead end is a signpost instead. */}
        {!loading && device && !option?.available && alternatives.length > 0 && (
          <div className="mt-4">
            <p className="text-[13px] text-text-mid">It does take:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {alternatives.map((o) => (
                <Link
                  key={o.variantId}
                  href={`/skins/${category}/${o.finish}`}
                  className="rounded-full border border-hairline px-4 py-2 text-[13px] font-bold text-text-hi hover:border-accent hover:text-accent"
                >
                  {o.label} · {formatPaise(o.priceInPaise)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* buy */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-hairline">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="One fewer"
            className="h-full w-11 text-[18px] text-text-mid hover:text-text-hi"
          >
            −
          </button>
          <span className="w-8 text-center text-[14px] font-bold text-text-hi">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            aria-label="One more"
            className="h-full w-11 text-[18px] text-text-mid hover:text-text-hi"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={!option?.available || adding}
          className="h-12 flex-1 rounded-full bg-accent px-8 text-[15px] font-bold text-accent-ink transition-opacity disabled:opacity-45"
        >
          {label}
        </button>
      </div>

      <a
        href={whatsappAboutDevice({
          device: device?.deviceName ?? finishName,
          category,
          coverage: finishName,
          number: whatsapp,
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-hairline text-[14px] font-bold text-text-hi hover:border-accent hover:text-accent"
      >
        Not sure? Ask on WhatsApp
      </a>

      {result && (
        <p
          role="status"
          className={`mt-4 text-[13.5px] font-bold ${
            result.ok ? "text-success" : "text-danger"
          }`}
        >
          {result.message}{" "}
          {result.ok && (
            <Link href="/cart" className="underline">
              View cart
            </Link>
          )}
        </p>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  required = false,
  value,
  children,
}: {
  n: number;
  title: string;
  required?: boolean;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-hairline pt-6 first:border-t-0 first:pt-0 [&+&]:mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-low">
          {n}. {title}
          {required && <span className="ml-1 text-danger">*</span>}
        </h2>
        {value && (
          <span className="text-[13px] font-bold text-accent">{value}</span>
        )}
      </div>
      {children}
    </section>
  );
}
