"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { formatPaise } from "@/lib/money";
import { addToCart } from "@/app/cart-actions";
import { getCoveragesFor, type DeviceCoverages } from "@/app/design-actions";
import { whatsappAboutDevice } from "@/lib/whatsapp";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import type { DesignPage } from "@/lib/designs";

/**
 * One design, configured onto a device.
 *
 * Four questions in the order the answers narrow: brand, model,
 * coverage, and - on an iPhone - whether the logo stays visible. Each
 * one unlocks the next rather than all four sitting there greyed,
 * because a coverage cannot be priced until we know what it is going
 * onto.
 *
 * The coverages arrive from the server when the device is chosen.
 * A design cut for phones has 1,033 devices and 2,400 options behind
 * it, and shipping that to a browser to show four lines would be
 * absurd.
 *
 * Coverages we cannot sell are shown struck through with the reason
 * rather than hidden. "Back Only, not available for this one" is an
 * answer; a quietly shorter list is not.
 */

export function DesignConfigurator({ design }: { design: DesignPage }) {
  const router = useRouter();
  const [brandSlug, setBrandSlug] = useState<string | null>(
    design.brands.length === 1 ? design.brands[0].slug : null,
  );
  const [modelId, setModelId] = useState<string>("");
  const [device, setDevice] = useState<DeviceCoverages | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [logoCutout, setLogoCutout] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [loadingDevice, startLoad] = useTransition();
  const [adding, startAdd] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const brand = design.brands.find((b) => b.slug === brandSlug) ?? null;

  const chosen =
    device?.options.find((o) => o.variantId === variantId) ?? null;

  const totalInPaise = chosen
    ? (chosen.priceInPaise + design.priceInPaise) * quantity
    : null;

  const canBuy = Boolean(chosen?.available) && !adding;

  // Brands can span device categories when a design is cut for more
  // than one, so the chip row is grouped by category rather than
  // pretending Canon and Apple belong in one list.
  const brandGroups = useMemo(() => {
    const map = new Map<string, typeof design.brands>();
    for (const b of design.brands) {
      const list = map.get(b.category) ?? [];
      list.push(b);
      map.set(b.category, list);
    }
    return [...map.entries()];
  }, [design]);

  function pickBrand(slug: string) {
    setBrandSlug(slug);
    setModelId("");
    setDevice(null);
    setVariantId(null);
    setResult(null);
  }

  function pickModel(id: string) {
    setModelId(id);
    setDevice(null);
    setVariantId(null);
    setResult(null);
    if (!id) return;

    startLoad(async () => {
      const d = await getCoveragesFor(id);
      setDevice(d);
      // One real choice is not a choice; take it.
      const live = d?.options.filter((o) => o.available) ?? [];
      if (live.length === 1) setVariantId(live[0].variantId);
    });
  }

  function add() {
    if (!chosen) return;
    setResult(null);
    startAdd(async () => {
      const r = await addToCart({
        variantId: chosen.variantId,
        quantity,
        designId: design.id,
        logoCutout: device?.logoCutout ? logoCutout : undefined,
      });
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
      {/* ---------------- the artwork ---------------- */}
      <div className="min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface-1">
          {design.imageUrl && (
            <Image
              src={design.imageUrl}
              alt={design.name}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-text-low">
          Mock-ups may vary slightly in colour from one device to
          another. The skin itself is cut and printed the same for every
          device it is made for.
        </p>
      </div>

      {/* ---------------- the choices ---------------- */}
      <div className="min-w-0">
        <p className="text-[12px] uppercase tracking-[0.1em] text-text-low">
          {design.categoryName}
        </p>
        <h1 className="mt-1.5 text-[30px] font-bold leading-tight tracking-tight text-text-hi md:text-[36px]">
          {design.name}
        </h1>

        <p className="mt-3 text-[20px] font-bold tabular-nums text-text-hi">
          {totalInPaise === null
            ? design.priceInPaise > 0
              ? `From ${formatPaise(design.priceInPaise)}`
              : "Pick your device for the price"
            : formatPaise(totalInPaise)}
        </p>

        {/* 1. brand */}
        <Step n={1} title="Select brand" done={Boolean(brand)} value={brand?.name}>
          {brandGroups.map(([category, brands]) => (
            <div key={category} className="mt-3">
              {brandGroups.length > 1 && (
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low">
                  {CATEGORY_LABEL[category] ?? category}
                </p>
              )}
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                {brands.map((b) => (
                  <button
                    key={`${b.category}-${b.slug}`}
                    type="button"
                    aria-pressed={b.slug === brandSlug}
                    onClick={() => pickBrand(b.slug)}
                    className={`h-10 shrink-0 rounded-[var(--r-sm)] border px-4 text-[13.5px] font-bold transition-colors ${
                      b.slug === brandSlug
                        ? "border-accent text-accent"
                        : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Step>

        {/* 2. model */}
        <Step
          n={2}
          title={brand ? `Select ${brand.name} model` : "Select model"}
          required
          done={Boolean(device)}
          value={device?.deviceName ?? (brand ? "None selected" : undefined)}
        >
          <select
            value={modelId}
            disabled={!brand}
            onChange={(e) => pickModel(e.target.value)}
            aria-label="Device model"
            className="mt-3 h-12 w-full rounded-[var(--r-sm)] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi focus:border-accent focus:outline-none disabled:opacity-50"
          >
            <option value="">
              {brand ? `Select your ${brand.name} model…` : "Pick a brand first"}
            </option>
            {brand?.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {loadingDevice && (
            <p className="mt-2 text-[12px] text-text-low">Checking what we cut…</p>
          )}
        </Step>

        {/* 3. coverage */}
        <Step
          n={3}
          title={`${device?.optionLabel ?? "Coverage"} option`}
          required
          done={Boolean(chosen)}
          value={chosen?.label ?? (device ? undefined : "Select model first")}
        >
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {(device?.options ?? PLACEHOLDERS).map((o, i) => {
              const real = Boolean(device);
              const selected = real && o.variantId === variantId;

              return (
                <button
                  key={real ? o.variantId : i}
                  type="button"
                  disabled={!real || !o.available}
                  onClick={() => setVariantId(o.variantId)}
                  aria-pressed={selected}
                  className={`rounded-[var(--r-sm)] border px-4 py-3.5 text-left transition-colors ${
                    selected
                      ? "border-accent bg-accent-soft/40"
                      : "border-hairline bg-surface-1"
                  } ${!real || !o.available ? "cursor-not-allowed opacity-45" : "hover:border-hairline-strong"}`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[14px] font-bold text-text-hi">
                      {o.label}
                    </span>
                    {real && o.reason && (
                      <span className="shrink-0 text-[10px] font-bold uppercase text-danger">
                        {o.reason}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[12px] text-text-mid">
                    {real && o.available
                      ? formatPaise(o.priceInPaise + design.priceInPaise)
                      : COVERAGE_BLURB[o.label] ?? ""}
                  </span>
                </button>
              );
            })}
          </div>
        </Step>

        {/* 4. logo */}
        {device?.logoCutout && (
          <Step
            n={4}
            title="Apple logo cutout"
            done
            value={logoCutout ? "With cutout" : "Solid back"}
          >
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <Choice
                selected={logoCutout}
                onClick={() => setLogoCutout(true)}
                title="With Logo Cutout"
              />
              <Choice
                selected={!logoCutout}
                onClick={() => setLogoCutout(false)}
                title="Solid Back (No Cutout)"
              />
            </div>
          </Step>
        )}

        {/* buy */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center rounded-[var(--r-sm)] border border-hairline">
            <button
              type="button"
              aria-label="Fewer"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-full w-11 text-[17px] text-text-mid hover:text-text-hi"
            >
              −
            </button>
            <span className="w-8 text-center text-[14px] tabular-nums text-text-hi">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="More"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="h-full w-11 text-[17px] text-text-mid hover:text-text-hi"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={!canBuy}
            onClick={add}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-accent px-8 text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
          >
            {adding
              ? "Adding…"
              : chosen?.available
                ? "Add to cart"
                : !brand
                  ? "Pick a brand"
                  : !device
                    ? "Pick your model"
                    : `Pick a ${(device.optionLabel ?? "coverage").toLowerCase()}`}
          </button>
        </div>

        {result && (
          <p
            role="status"
            className={`mt-3 text-[13px] ${result.ok ? "text-text-mid" : "text-danger"}`}
          >
            {result.ok ? (
              <>
                Added.{" "}
                <Link href="/cart" className="font-bold text-accent hover:underline">
                  Go to cart
                </Link>
              </>
            ) : (
              result.message
            )}
          </p>
        )}

        <a
          href={whatsappAboutDevice({
            device: device?.deviceName ?? "device",
            design: design.name,
            coverage: chosen?.label ?? null,
            logoCutout: device?.logoCutout ? logoCutout : null,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline text-[14px] font-bold text-text-hi transition-colors hover:border-hairline-strong"
        >
          Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}

/** Shown before a device is chosen, so the step is not an empty box. */
const PLACEHOLDERS = [
  { variantId: "p1", label: "Full Wrap", priceInPaise: 0, available: false, reason: null },
  { variantId: "p2", label: "Back With Sides", priceInPaise: 0, available: false, reason: null },
  { variantId: "p3", label: "Back Only", priceInPaise: 0, available: false, reason: null },
];

const COVERAGE_BLURB: Record<string, string> = {
  "Full Wrap": "360° body + sides",
  "Back With Sides": "Rear panel + frame",
  "Back Only": "Back panel only",
};

function Step({
  n,
  title,
  required = false,
  done = false,
  value,
  children,
}: {
  n: number;
  title: string;
  required?: boolean;
  done?: boolean;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7 border-t border-hairline pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-text-mid">
          {n}. {title}
          {required && <sup className="ml-1 text-danger">*</sup>}
        </h2>
        {value && (
          <p
            className={`text-[12.5px] font-bold ${
              done ? "text-accent" : "text-text-low"
            }`}
          >
            {value}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Choice({
  selected,
  onClick,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-[var(--r-sm)] border px-4 py-3.5 text-left transition-colors ${
        selected
          ? "border-accent bg-accent-soft/40"
          : "border-hairline bg-surface-1 hover:border-hairline-strong"
      }`}
    >
      <span
        aria-hidden
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          selected ? "bg-accent" : "bg-hairline-strong"
        }`}
      />
      <span className="text-[14px] font-bold text-text-hi">{title}</span>
    </button>
  );
}
