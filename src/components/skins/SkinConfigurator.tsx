"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatPaise } from "@/lib/money";
import type { ModelPage } from "@/lib/catalog";
import type { StyleTile } from "@/lib/catalog-shared";

/**
 * The page that sells: one model, configured and added to the cart.
 *
 * It asks in the order the answers exist. The model is already settled
 * by the URL, so what is left is how the skin should look, what it is
 * made of, and - on an iPhone - whether the logo stays visible. The
 * price only appears once there is something to price, because a
 * number that changes under the customer's hand reads as a trick.
 *
 * Styles have no designs behind them yet, on this site or the live
 * one, so those tiles are shown as unavailable rather than hidden:
 * the customer should see what is coming, and nobody should be able
 * to buy a design that does not exist.
 */

export function SkinConfigurator({
  model,
  styles,
}: {
  model: ModelPage;
  styles: StyleTile[];
}) {
  const buyable = model.options.filter((o) => !o.pending);
  const [optionId, setOptionId] = useState<string | null>(
    buyable.length === 1 ? buyable[0].variantId : null,
  );
  const [logoCutout, setLogoCutout] = useState(true);
  const [added, setAdded] = useState(0);

  const chosen = model.options.find((o) => o.variantId === optionId) ?? null;
  const canBuy = Boolean(chosen?.available);

  let step = 1;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-14">
      {/* ---------------- choices ---------------- */}
      <div className="min-w-0">
        {styles.length > 0 && (
          <section className="mb-10">
            <StepHeading
              n={step++}
              title="Pick a design"
              note="Designs are being photographed — choose a finish below for now."
            />
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {styles.map((s) => (
                <li key={s.slug}>
                  <div
                    aria-disabled
                    className="relative block cursor-not-allowed overflow-hidden rounded-[12px] opacity-45"
                  >
                    <span className="relative block aspect-square">
                      <Image
                        src={s.image}
                        alt={s.title}
                        fill
                        sizes="(min-width: 1024px) 15vw, 45vw"
                        className="object-cover"
                      />
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                    />
                    <span className="absolute bottom-3 left-3 right-3 text-[13px] font-bold text-white">
                      {s.title}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <StepHeading
            n={step++}
            title={`Pick the ${model.optionLabel.toLowerCase()}`}
            note={
              model.category === "phone"
                ? "How much of the body the skin covers."
                : "What the skin is made of. This is what sets the price."
            }
          />

          {model.options.length === 0 ? (
            <Unavailable model={model.name} />
          ) : (
            <ul className="mt-4 space-y-2.5" role="radiogroup">
              {model.options.map((o) => {
                const selected = o.variantId === optionId;
                const disabled = !o.available;

                return (
                  <li key={o.variantId}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={disabled}
                      onClick={() => setOptionId(o.variantId)}
                      className={`flex w-full items-center justify-between gap-4 rounded-[var(--r-sm)] border px-5 py-4 text-left transition-colors ${
                        selected
                          ? "border-accent bg-accent-soft/40"
                          : "border-hairline bg-surface-1 hover:border-hairline-strong"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                            selected
                              ? "border-accent"
                              : "border-hairline-strong"
                          }`}
                        >
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                          )}
                        </span>
                        <span className="text-[15px] text-text-hi">
                          {o.label}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        {o.pending ? (
                          <span className="text-[13px] text-text-low">
                            price soon
                          </span>
                        ) : (
                          <>
                            <span className="block text-[15px] font-bold tabular-nums text-text-hi">
                              {formatPaise(o.priceInPaise)}
                            </span>
                            {!o.available && (
                              <span className="block text-[12px] text-danger">
                                out of stock
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {model.logoCutout && (
          <section className="mt-10">
            <StepHeading
              n={step++}
              title="Apple logo"
              note="Leave the logo showing, or cover it over."
            />
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Choice
                selected={logoCutout}
                onClick={() => setLogoCutout(true)}
                title="Logo cutout"
                body="The skin is cut around the logo."
              />
              <Choice
                selected={!logoCutout}
                onClick={() => setLogoCutout(false)}
                title="Cover it"
                body="One unbroken piece, logo hidden."
              />
            </div>
          </section>
        )}
      </div>

      {/* ---------------- buy box ---------------- */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[var(--r-md)] border border-hairline bg-surface-1 p-6">
          <p className="text-[12px] uppercase tracking-[0.1em] text-text-low">
            {model.brand} · {model.categoryLabel}
          </p>
          <h2 className="mt-1.5 text-[22px] font-bold leading-snug text-text-hi">
            {model.name}
          </h2>

          <dl className="mt-5 space-y-2 border-t border-hairline pt-5 text-[14px]">
            <Row label={model.optionLabel} value={chosen?.label ?? "—"} />
            {model.logoCutout && (
              <Row
                label="Apple logo"
                value={logoCutout ? "Cutout" : "Covered"}
              />
            )}
          </dl>

          <p className="mt-5 flex items-baseline justify-between border-t border-hairline pt-5">
            <span className="text-[14px] text-text-mid">Total</span>
            <span className="text-[24px] font-bold tabular-nums text-text-hi">
              {chosen && !chosen.pending
                ? formatPaise(chosen.priceInPaise)
                : "—"}
            </span>
          </p>

          <button
            type="button"
            disabled={!canBuy}
            onClick={() => setAdded((n) => n + 1)}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
          >
            {canBuy
              ? "Add to cart"
              : model.options.length === 0
                ? "Not available yet"
                : `Choose a ${model.optionLabel.toLowerCase()}`}
          </button>

          {added > 0 && (
            <p className="mt-3 text-center text-[13px] text-text-mid">
              Added {added}× — the cart is not switched on yet, so nothing is
              held.
            </p>
          )}

          <p className="mt-5 border-t border-hairline pt-5 text-[12px] leading-relaxed text-text-low">
            Cut to the millimetre for the {model.name}. Wrong model? Go back
            and pick again — a skin cut for another device will not fit.
          </p>
        </div>
      </aside>
    </div>
  );
}

function StepHeading({
  n,
  title,
  note,
}: {
  n: number;
  title: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-bold text-accent-ink">
        {n}
      </span>
      <div className="min-w-0">
        <h2 className="text-[18px] font-bold text-text-hi">{title}</h2>
        <p className="mt-1 text-[13px] text-text-mid">{note}</p>
      </div>
    </div>
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
      className={`min-w-[190px] flex-1 rounded-[var(--r-sm)] border px-5 py-4 text-left transition-colors ${
        selected
          ? "border-accent bg-accent-soft/40"
          : "border-hairline bg-surface-1 hover:border-hairline-strong"
      }`}
    >
      <span className="block text-[15px] font-bold text-text-hi">{title}</span>
      <span className="mt-1 block text-[13px] text-text-mid">{body}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-text-mid">{label}</dt>
      <dd className="truncate text-right font-medium text-text-hi">{value}</dd>
    </div>
  );
}

function Unavailable({ model }: { model: string }) {
  return (
    <div className="mt-4 rounded-[var(--r-sm)] border border-hairline bg-surface-1 p-6">
      <p className="text-[14px] leading-relaxed text-text-mid">
        We cut skins for the {model}, but it is not priced on the site yet.
        Ask us and we will quote it.
      </p>
      <Link
        href="/request-model"
        className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-6 text-[14px] font-bold text-accent-ink"
      >
        Ask for a price
      </Link>
    </div>
  );
}
