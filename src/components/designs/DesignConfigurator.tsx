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
 * unlocks the next rather than all four sitting greyed, because a
 * coverage cannot be priced until we know what it is going onto.
 *
 * Three things the first version of this got wrong, all of them
 * about getting out of the customer's way:
 *
 * The artwork had the whole left half of a 1600px page, so on a
 * laptop the questions were below the fold. It is capped now - a
 * phone skin is a tall rectangle and no amount of screen makes it
 * worth more than about 420px.
 *
 * The brands were a sideways-scrolling strip, which hides half of
 * them behind a drag. They wrap now, and they are ordered by how
 * often somebody walks in holding one rather than by how many models
 * we cut - Samsung ships forty phones a year and Apple ships four,
 * so counting models buries Apple at eighth.
 *
 * And a Samsung has 235 models. A bare dropdown of 235 is a scroll,
 * so there is a filter above it.
 *
 * The coverages arrive from the server when the device is chosen: a
 * design cut for phones has 1,033 devices and 2,400 options behind
 * it, all of it to show three lines. Ones we cannot sell are shown
 * with the reason rather than hidden - "Back Only, N/A for this one"
 * is an answer, a quietly shorter list is not.
 */

export function DesignConfigurator({
  design,
  device,
  whatsapp,
}: {
  design: DesignPage;
  /** the category the customer came in through, if any */
  device?: string;
  /** the shop's WhatsApp number, read from settings on the server */
  whatsapp?: string;
}) {
  const router = useRouter();

  // Someone who clicked Camera should not have to look past twelve
  // phone brands, so the chips open on the device they arrived on.
  const inDevice = device
    ? design.brands.filter((b) => b.category === device)
    : design.brands;
  const brandChoices = inDevice.length > 0 ? inDevice : design.brands;

  const [brandSlug, setBrandSlug] = useState<string | null>(
    brandChoices.length === 1 ? brandChoices[0].slug : null,
  );
  const [modelQuery, setModelQuery] = useState("");
  const [modelId, setModelId] = useState("");
  const [chosenDevice, setChosenDevice] = useState<DeviceCoverages | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [logoCutout, setLogoCutout] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [loadingDevice, startLoad] = useTransition();
  const [adding, startAdd] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const brand = brandChoices.find((b) => b.slug === brandSlug) ?? null;

  const models = useMemo(() => {
    if (!brand) return [];
    const q = modelQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!q) return brand.models;
    return brand.models.filter((m) =>
      m.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q),
    );
  }, [brand, modelQuery]);

  const chosen =
    chosenDevice?.options.find((o) => o.variantId === variantId) ?? null;

  const unitInPaise = chosen ? chosen.priceInPaise + design.priceInPaise : null;
  const totalInPaise = unitInPaise === null ? null : unitInPaise * quantity;

  const brandGroups = useMemo(() => {
    const map = new Map<string, typeof brandChoices>();
    for (const b of brandChoices) {
      const list = map.get(b.category) ?? [];
      list.push(b);
      map.set(b.category, list);
    }
    return [...map.entries()];
  }, [brandChoices]);

  function pickBrand(slug: string) {
    setBrandSlug(slug);
    setModelId("");
    setModelQuery("");
    setChosenDevice(null);
    setVariantId(null);
    setResult(null);
  }

  function pickModel(id: string) {
    setModelId(id);
    setChosenDevice(null);
    setVariantId(null);
    setResult(null);
    if (!id) return;

    startLoad(async () => {
      const d = await getCoveragesFor(id);
      setChosenDevice(d);
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
        logoCutout: chosenDevice?.logoCutout ? logoCutout : undefined,
      });
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  const buyLabel = adding
    ? "Adding…"
    : chosen?.available
      ? "Add to cart"
      : !brand
        ? "Pick a brand"
        : !chosenDevice
          ? "Pick your model"
          : `Pick a ${chosenDevice.optionLabel.toLowerCase()}`;

  return (
    // Spans the full page container (1600px). It used to sit in an
    // 1180px box inside it, which left a dead margin down both sides
    // on a laptop or a desktop while the header ran the full width.
    //
    // Both tracks are capped and pushed apart with space-between, so
    // the artwork lines up with the left edge of the header and the
    // buy column with the right, and the slack lands in the middle as
    // breathing room rather than as a gutter outside the content. The
    // caps also stop the select and the buy button from stretching to
    // 900px on a wide screen. Below lg the two stack.
    <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,620px)] lg:justify-between lg:gap-12 xl:grid-cols-[minmax(0,520px)_minmax(0,680px)] xl:gap-16 2xl:grid-cols-[minmax(0,580px)_minmax(0,720px)]">
      {/* ---------------- the artwork ---------------- */}
      <div className="mx-auto w-full max-w-[460px] lg:sticky lg:top-24 lg:max-w-none lg:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--r-md)] border border-hairline bg-white">
          {design.imageUrl && (
            <Image
              src={design.imageUrl}
              alt={design.name}
              fill
              sizes="(min-width: 1536px) 580px, (min-width: 1280px) 520px, (min-width: 1024px) 440px, (min-width: 460px) 460px, 100vw"
              className="object-contain p-5"
              priority
            />
          )}
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-text-low">
          Mock-ups may vary slightly in colour between devices. The skin
          itself is cut and printed the same for every device it is made
          for.
        </p>
      </div>

      {/* ---------------- the choices ---------------- */}
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
          {design.categoryName}
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-text-hi md:text-[34px]">
          {design.name}
        </h1>

        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[22px] font-bold tabular-nums text-text-hi">
            {unitInPaise === null
              ? design.priceInPaise > 0
                ? formatPaise(design.priceInPaise)
                : "—"
              : formatPaise(unitInPaise)}
          </span>
          {unitInPaise === null && (
            <span className="text-[13px] text-text-mid">
              Pick your device for the price
            </span>
          )}
        </p>

        {/* 1. brand */}
        <Step n={1} title="Select brand" value={brand?.name}>
          {brandGroups.map(([category, brands]) => (
            <div key={category} className="mt-3">
              {brandGroups.length > 1 && (
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low">
                  {CATEGORY_LABEL[category] ?? category}
                </p>
              )}
              {/* Wrapped, not a scrolling strip: a brand hidden behind
                  a sideways drag is a brand nobody finds. */}
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={`${b.category}-${b.slug}`}
                    type="button"
                    aria-pressed={b.slug === brandSlug}
                    onClick={() => pickBrand(b.slug)}
                    className={`h-10 rounded-[var(--r-sm)] border px-4 text-[13.5px] font-bold transition-colors ${
                      b.slug === brandSlug
                        ? "border-accent bg-accent-soft/40 text-accent"
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
          value={
            chosenDevice?.deviceName ?? (brand ? "None selected" : undefined)
          }
        >
          {brand && brand.models.length > 12 && (
            <input
              value={modelQuery}
              onChange={(e) => setModelQuery(e.target.value)}
              placeholder={`Search ${brand.models.length} ${brand.name} models`}
              aria-label={`Search ${brand.name} models`}
              autoComplete="off"
              className="mt-3 h-11 w-full rounded-[var(--r-sm)] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
            />
          )}

          <select
            value={modelId}
            disabled={!brand}
            onChange={(e) => pickModel(e.target.value)}
            aria-label="Device model"
            className="mt-2.5 h-12 w-full rounded-[var(--r-sm)] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi focus:border-accent focus:outline-none disabled:opacity-50"
          >
            <option value="">
              {!brand
                ? "Pick a brand first"
                : models.length === 0
                  ? `No ${brand.name} model matches that`
                  : `Select your ${brand.name} model…`}
            </option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {loadingDevice && (
            <p className="mt-2 text-[12px] text-text-low">
              Checking what we cut for it…
            </p>
          )}
        </Step>

        {/* 3. coverage */}
        <Step
          n={3}
          title={`${chosenDevice?.optionLabel ?? "Coverage"} option`}
          required
          value={chosen?.label ?? (chosenDevice ? undefined : "Select model first")}
        >
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {(chosenDevice?.options ?? PLACEHOLDERS).map((o, i) => {
              const real = Boolean(chosenDevice);
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
                  } ${
                    !real || !o.available
                      ? "cursor-not-allowed opacity-45"
                      : "hover:border-hairline-strong"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[13.5px] font-bold leading-tight text-text-hi">
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
                      : (COVERAGE_BLURB[o.label] ?? "")}
                  </span>
                </button>
              );
            })}
          </div>
        </Step>

        {/* 4. logo */}
        {chosenDevice?.logoCutout && (
          <Step
            n={4}
            title="Apple logo cutout"
            value={logoCutout ? "With cutout" : "Solid back"}
          >
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <Choice
                selected={logoCutout}
                onClick={() => setLogoCutout(true)}
                title="With Logo Cutout"
                body="Cut around the logo"
              />
              <Choice
                selected={!logoCutout}
                onClick={() => setLogoCutout(false)}
                title="Solid Back"
                body="One unbroken piece"
              />
            </div>
          </Step>
        )}

        {/* buy */}
        <div className="mt-8 border-t border-hairline pt-6">
          {totalInPaise !== null && quantity > 1 && (
            <p className="mb-3 flex items-baseline justify-between text-[13px]">
              <span className="text-text-mid">
                {quantity} × {formatPaise(unitInPaise!)}
              </span>
              <span className="text-[17px] font-bold tabular-nums text-text-hi">
                {formatPaise(totalInPaise)}
              </span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
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
              disabled={!chosen?.available || adding}
              onClick={add}
              className="inline-flex h-12 min-w-[200px] flex-1 items-center justify-center rounded-full bg-accent px-8 text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {buyLabel}
            </button>
          </div>

          {result && (
            <p
              role="status"
              className={`mt-3 text-[13px] ${
                result.ok ? "text-text-mid" : "text-danger"
              }`}
            >
              {result.ok ? (
                <>
                  Added.{" "}
                  <Link
                    href="/cart"
                    className="font-bold text-accent hover:underline"
                  >
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
              device: chosenDevice?.deviceName ?? "device",
              design: design.name,
              coverage: chosen?.label ?? null,
              logoCutout: chosenDevice?.logoCutout ? logoCutout : null,
              number: whatsapp,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline text-[13.5px] font-bold text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
          >
            Not sure? Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

/** Shown before a device is chosen, so step 3 is not an empty box. */
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
    <section className="mt-6 border-t border-hairline pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-text-mid">
          {n}. {title}
          {required && <sup className="ml-1 text-danger">*</sup>}
        </h2>
        {value && (
          <p className="text-[12.5px] font-bold text-accent">{value}</p>
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
  body,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-start gap-2.5 rounded-[var(--r-sm)] border px-4 py-3.5 text-left transition-colors ${
        selected
          ? "border-accent bg-accent-soft/40"
          : "border-hairline bg-surface-1 hover:border-hairline-strong"
      }`}
    >
      <span
        aria-hidden
        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
          selected ? "bg-accent" : "bg-hairline-strong"
        }`}
      />
      <span>
        <span className="block text-[13.5px] font-bold text-text-hi">
          {title}
        </span>
        <span className="mt-0.5 block text-[12px] text-text-mid">{body}</span>
      </span>
    </button>
  );
}
