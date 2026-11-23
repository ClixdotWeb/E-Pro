"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Empty, Pill } from "./ui";
import { formatPaise } from "@/lib/money";
import { setFlatPrice, unpublishProduct } from "@/app/admin/actions";
import { CATEGORY_LABEL, FINISH_LABEL } from "@/lib/catalog-shared";
import type { PricingGroup } from "@/lib/catalog";

/**
 * Pricing, one number per product.
 *
 * A product in this shop is a coverage or a material - "Full Wrap",
 * "Printed Skin" - and its options are that same thing cut for
 * different device models. Where the price does not vary by model,
 * which is how the phone list is sold, the honest editing unit is the
 * product, not the 932 rows under it. This screen is that unit.
 *
 * Unpriced products sort to the top and are tinted, because an
 * unpriced product is not for sale and that is the only thing on this
 * screen that costs money. Typing a price here also publishes: those
 * rows were drafts solely for want of a price.
 *
 * A product whose options already carry different prices is shown as
 * a range and warns before it flattens them, since for camera and
 * lens the per-model price is real data from the price lists and
 * overwriting it would throw that away.
 */

export function FlatPricing({ groups }: { groups: PricingGroup[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const unpriced = groups.filter((g) => !g.minPaise);
  const waiting = unpriced.reduce((n, g) => n + g.options, 0);

  const sorted = [...groups].sort((a, b) => {
    const ap = a.minPaise ? 1 : 0;
    const bp = b.minPaise ? 1 : 0;
    if (ap !== bp) return ap - bp;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.title.localeCompare(b.title);
  });

  function apply(g: PricingGroup) {
    const typed = (drafts[g.slug] ?? "").trim();
    if (!typed) return;

    if (g.minPaise && !g.flat) {
      const ok = window.confirm(
        `${g.title} has prices from ${formatPaise(g.minPaise)} to ${formatPaise(
          g.maxPaise ?? g.minPaise,
        )} — they came from your price list. Replacing them with one price for all ${g.options} options cannot be undone. Go ahead?`,
      );
      if (!ok) return;
    }

    setPendingSlug(g.slug);
    startTransition(async () => {
      const r = await setFlatPrice(g.slug, typed);
      setResult(r);
      setPendingSlug(null);
      if (r.ok) {
        setDrafts((d) => {
          const next = { ...d };
          delete next[g.slug];
          return next;
        });
        router.refresh();
      }
    });
  }

  function takeOff(g: PricingGroup) {
    if (!window.confirm(`Take ${g.title} off the shop? Prices are kept.`))
      return;

    setPendingSlug(g.slug);
    startTransition(async () => {
      const r = await unpublishProduct(g.slug);
      setResult(r);
      setPendingSlug(null);
      if (r.ok) router.refresh();
    });
  }

  if (groups.length === 0) {
    return (
      <Empty
        title="No products yet"
        body="Import a price list and the products appear here."
      />
    );
  }

  return (
    <>
      {waiting > 0 && (
        <div className="mb-6 rounded-[14px] border border-warning/30 bg-warning/10 px-5 py-4">
          <p className="text-[14px] font-bold text-warning">
            {unpriced.length} product
            {unpriced.length === 1 ? "" : "s"} have no price —{" "}
            {waiting.toLocaleString("en-IN")} options cannot be bought
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-warning/90">
            Type one price against each and it goes on sale for every device
            model under it, with stock. That is all the phone list is waiting
            for.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
        <div className="hidden items-center gap-4 border-b border-hairline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low lg:flex">
          <span className="flex-1">Product</span>
          <span className="w-[90px] text-right">Options</span>
          <span className="w-[150px] text-right">Price now</span>
          <span className="w-[230px] text-right">One price for all</span>
          <span className="w-[90px]" />
        </div>

        <ul>
          {sorted.map((g) => {
            const busy = pendingSlug === g.slug;
            const none = !g.minPaise;
            const range =
              g.minPaise && !g.flat
                ? `${formatPaise(g.minPaise)} – ${formatPaise(g.maxPaise ?? g.minPaise)}`
                : g.minPaise
                  ? formatPaise(g.minPaise)
                  : null;

            return (
              <li
                key={g.slug}
                className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hairline px-5 py-4 last:border-0 ${
                  none ? "bg-warning/[0.05]" : ""
                }`}
              >
                <div className="min-w-[200px] flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-text-hi">
                    {g.title}
                    {g.status === "ACTIVE" ? (
                      <Pill tone="success">On sale</Pill>
                    ) : (
                      <Pill tone="warning">Not on sale</Pill>
                    )}
                  </p>
                  <p className="mt-1 text-[12px] text-text-low">
                    {CATEGORY_LABEL[g.category] ?? (g.category || "No category")}
                    {g.finish ? ` · ${FINISH_LABEL[g.finish] ?? g.finish}` : ""}
                  </p>
                </div>

                <p className="w-[90px] text-right text-[13px] tabular-nums text-text-mid">
                  {g.options.toLocaleString("en-IN")}
                </p>

                <p
                  className={`w-[150px] text-right text-[13px] tabular-nums ${
                    none ? "font-bold text-warning" : "text-text-mid"
                  }`}
                >
                  {range ?? "No price"}
                </p>

                <div className="flex w-[230px] items-center justify-end gap-2">
                  <span className="text-[13px] text-text-low">Rs.</span>
                  <label className="sr-only" htmlFor={`price-${g.slug}`}>
                    One price for every option in {g.title}
                  </label>
                  <input
                    id={`price-${g.slug}`}
                    value={drafts[g.slug] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [g.slug]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") apply(g);
                    }}
                    inputMode="decimal"
                    placeholder={g.flat && g.minPaise ? String(g.minPaise / 100) : "0"}
                    className="h-10 w-24 rounded-[6px] border border-hairline bg-surface-2 px-3 text-right text-[14px] font-bold tabular-nums text-text-hi focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => apply(g)}
                    disabled={busy || !(drafts[g.slug] ?? "").trim()}
                    className="h-10 shrink-0 rounded-[6px] bg-accent px-4 text-[13px] font-bold text-black transition-opacity disabled:opacity-40"
                  >
                    {busy ? "Saving…" : "Apply"}
                  </button>
                </div>

                <div className="flex w-[90px] items-center justify-end gap-3">
                  <Link
                    href={`/admin/products/${g.slug}`}
                    className="text-[12px] font-bold text-text-low hover:text-text-hi"
                  >
                    Edit
                  </Link>
                  {g.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => takeOff(g)}
                      disabled={busy}
                      className="text-[12px] font-bold text-text-low hover:text-danger disabled:opacity-40"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {result && (
        <p
          role="status"
          className={`mt-5 text-[13px] font-bold ${
            result.ok ? "text-success" : "text-danger"
          }`}
        >
          {result.message}
        </p>
      )}
    </>
  );
}
