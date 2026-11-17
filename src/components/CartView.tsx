"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogMedia } from "./CatalogMedia";
import { formatPaise } from "@/lib/money";
import {
  FLAT_SHIPPING_PAISE,
  FREE_SHIPPING_THRESHOLD_PAISE,
  calculateTotals,
  type AppliedDiscount,
} from "@/lib/pricing";

/**
 * Cart in the live theme's layout: line items left, a sticky summary on
 * the right.
 *
 * State is local for now. There is no database connected, so quantities
 * and the cart itself do not survive a reload — the page is wired so
 * that swapping `useState` for the server cart is the only change.
 *
 * The totals shown here are computed by the same `calculateTotals` the
 * server will use, so the number a customer reads is derived the same
 * way the charge will be. The authoritative figure is still the one the
 * server recomputes from database prices at checkout: a client that can
 * name its own total can pay ₹1.
 */

export type CartLine = {
  id: string;
  productSlug: string;
  productTitle: string;
  variantTitle: string;
  optionLabel: string;
  unitInPaise: number;
  imageUrl: string | null;
  quantity: number;
};

/** Demo codes until the Discount table is live. */
const DEMO_DISCOUNTS: Record<string, AppliedDiscount> = {
  EPRO10: { code: "EPRO10", type: "PERCENT", value: 10, minOrderInPaise: 0 },
  FREESHIP: {
    code: "FREESHIP",
    type: "FREE_SHIPPING",
    value: 0,
    minOrderInPaise: 29900,
  },
};

export function CartView({ initialLines }: { initialLines: CartLine[] }) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const [codeInput, setCodeInput] = useState("");
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      calculateTotals(
        lines.map((l) => ({
          variantId: l.id,
          quantity: l.quantity,
          unitInPaise: l.unitInPaise,
        })),
        discount,
      ),
    [lines, discount],
  );

  function setQuantity(id: string, next: number) {
    setLines((prev) =>
      next <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) =>
            l.id === id ? { ...l, quantity: Math.min(10, next) } : l,
          ),
    );
  }

  function applyCode() {
    const key = codeInput.trim().toUpperCase();
    const found = DEMO_DISCOUNTS[key];

    if (!found) {
      setCodeError("That code is not valid.");
      return;
    }
    if (totals.subtotalInPaise < found.minOrderInPaise) {
      setCodeError(
        `Spend ${formatPaise(found.minOrderInPaise)} to use this code.`,
      );
      return;
    }

    setDiscount(found);
    setCodeError(null);
    setCodeInput("");
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-text-hi">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-mid">
          Type your device into the finder and the right skin is one tap away.
        </p>
        <Link
          href="/find"
          className="mt-6 inline-block rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Find my device
        </Link>
      </div>
    );
  }

  const toFreeShipping =
    FREE_SHIPPING_THRESHOLD_PAISE -
    (totals.subtotalInPaise - totals.discountInPaise);
  const progress = Math.min(
    100,
    ((totals.subtotalInPaise - totals.discountInPaise) /
      FREE_SHIPPING_THRESHOLD_PAISE) *
      100,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-12">
      {/* ---- lines ---- */}
      <div>
        {/* free shipping progress */}
        <div className="rounded-[var(--r-md)] border border-hairline bg-surface-1 px-4 py-3.5">
          <p className="text-[12px] text-text-mid">
            {toFreeShipping > 0 ? (
              <>
                Add{" "}
                <span className="font-semibold text-text-hi tabular-nums">
                  {formatPaise(toFreeShipping)}
                </span>{" "}
                for free shipping
              </>
            ) : (
              <span className="font-medium text-accent">
                Free shipping unlocked
              </span>
            )}
          </p>
          <div
            className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-3"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress to free shipping"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-4 py-5">
              <Link
                href={`/products/${line.productSlug}`}
                className="shrink-0"
                aria-label={line.productTitle}
              >
                <CatalogMedia
                  src={line.imageUrl}
                  seed={line.productSlug}
                  alt={line.productTitle}
                  sizes="96px"
                  className="h-20 w-20 rounded-[var(--r-md)] border border-hairline sm:h-24 sm:w-24"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${line.productSlug}`}
                  className="text-sm font-medium text-text-hi hover:text-accent"
                >
                  {line.productTitle}
                </Link>
                <p className="mt-0.5 text-[12px] text-text-low">
                  {line.optionLabel}: {line.variantTitle}
                </p>
                <p className="mt-1.5 text-[12px] text-text-mid tabular-nums">
                  {formatPaise(line.unitInPaise)} each
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-[var(--r-sm)] border border-hairline">
                    <QtyButton
                      label={`Decrease quantity of ${line.productTitle}`}
                      onClick={() => setQuantity(line.id, line.quantity - 1)}
                    >
                      −
                    </QtyButton>
                    <span className="w-9 text-center text-[13px] tabular-nums text-text-hi">
                      {line.quantity}
                    </span>
                    <QtyButton
                      label={`Increase quantity of ${line.productTitle}`}
                      disabled={line.quantity >= 10}
                      onClick={() => setQuantity(line.id, line.quantity + 1)}
                    >
                      +
                    </QtyButton>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, 0)}
                    className="text-[12px] text-text-low transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-sm font-semibold tabular-nums text-text-hi">
                {formatPaise(line.unitInPaise * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href="/find"
          className="mt-5 inline-block text-[13px] font-medium text-accent hover:underline"
        >
          ← Add another skin
        </Link>
      </div>

      {/* ---- summary ---- */}
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-text-hi">Order summary</h2>

          <dl className="mt-4 space-y-2.5 text-[13px]">
            <Row label="Subtotal" value={formatPaise(totals.subtotalInPaise)} />

            {totals.discountInPaise > 0 && discount && (
              <Row
                label={`Discount (${discount.code})`}
                value={`− ${formatPaise(totals.discountInPaise)}`}
                tone="accent"
              />
            )}

            <Row
              label="Shipping"
              value={
                totals.shippingInPaise === 0
                  ? "Free"
                  : formatPaise(totals.shippingInPaise)
              }
            />

            <Row
              label="GST (18%, included)"
              value={formatPaise(totals.taxInPaise)}
              muted
            />
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="text-sm font-semibold text-text-hi">Total</span>
            <span className="text-lg font-semibold tabular-nums text-text-hi">
              {formatPaise(totals.totalInPaise)}
            </span>
          </div>

          {/* discount code */}
          {discount ? (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-[var(--r-sm)] bg-accent-soft px-3 py-2">
              <span className="text-[12px] font-medium text-accent">
                {discount.code} applied
              </span>
              <button
                type="button"
                onClick={() => setDiscount(null)}
                className="text-[11px] text-text-mid hover:text-text-hi"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <label
                htmlFor="discount-code"
                className="block text-[12px] text-text-low"
              >
                Discount code
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="discount-code"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setCodeError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCode();
                    }
                  }}
                  placeholder="EPRO10"
                  autoComplete="off"
                  aria-invalid={codeError ? true : undefined}
                  aria-describedby={codeError ? "discount-error" : undefined}
                  className="min-w-0 flex-1 rounded-[var(--r-sm)] border border-hairline bg-surface-0 px-3 py-2 text-[13px] uppercase text-text-hi placeholder:normal-case placeholder:text-text-low focus:border-accent"
                />
                <button
                  type="button"
                  onClick={applyCode}
                  className="shrink-0 rounded-[var(--r-sm)] border border-hairline px-3.5 py-2 text-[12px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
                >
                  Apply
                </button>
              </div>
              {codeError && (
                <p id="discount-error" className="mt-1.5 text-[11px] text-danger">
                  {codeError}
                </p>
              )}
            </div>
          )}

          <Link
            href="/checkout"
            className="mt-5 block rounded-[var(--r-md)] bg-accent px-5 py-3.5 text-center text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Checkout
          </Link>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-text-low">
            Shipping {formatPaise(FLAT_SHIPPING_PAISE)}, free over{" "}
            {formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)}. Prices include GST.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  muted = false,
}: {
  label: string;
  value: string;
  tone?: "accent";
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-text-low" : "text-text-mid"}>{label}</dt>
      <dd
        className={`tabular-nums ${
          tone === "accent"
            ? "text-accent"
            : muted
              ? "text-text-low"
              : "text-text-hi"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function QtyButton({
  children,
  label,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-8 w-8 place-items-center text-[15px] text-text-mid transition-colors hover:text-text-hi disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
