"use client";

import Link from "next/link";
import { useState } from "react";
import { CatalogMedia } from "./CatalogMedia";
import { formatPaise } from "@/lib/money";
import { sumPaise } from "@/lib/money";

/**
 * Cart, rebuilt from the live /cart page's own markup.
 *
 *   h1.h2.ta-center          "Your cart (N)"
 *   empty state              "Your cart is empty" + a primary
 *                            "Continue shopping" to /collections/all
 *   form .rw                 items --w-md 8, summary --w-md 4
 *   .cart-amount             corner-radius-s, p-20, p-sticky top-0
 *     "Total" h5  +  amount h5 right
 *     primary "Check out", then a link "Continue shopping"
 *     small: "Tax included. Shipping calculated at checkout."
 *
 * Everything I had added on top of that is gone: the free-shipping
 * progress bar, the discount code field and the GST line are not on
 * the real cart. It shows a total and nothing else, because Shopify
 * works the rest out at checkout.
 *
 * The line-item row could not be observed - the live cart is empty and
 * filling it would have meant adding an item to their real store - so
 * the row below is the theme's standard arrangement (media, title,
 * variant, quantity, line total, remove). Worth a second look once
 * there is a real cart to compare against.
 *
 * State is local until the database is connected; nothing here
 * survives a reload yet.
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

export function CartView({ initialLines }: { initialLines: CartLine[] }) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);

  const total = sumPaise(lines.map((l) => l.unitInPaise * l.quantity));

  function setQuantity(id: string, next: number) {
    setLines((prev) =>
      next <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) =>
            l.id === id ? { ...l, quantity: Math.min(10, next) } : l,
          ),
    );
  }

  return (
    <>
      <h1 className="text-center text-[28px] font-bold tracking-tight text-text-hi md:text-[36px]">
        Your cart ({lines.reduce((n, l) => n + l.quantity, 0)})
      </h1>

      {lines.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="mb-6 text-[15px] text-text-mid">Your cart is empty</p>
          <Link
            href="/collections"
            className="inline-flex h-12 items-center rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-5">
          {/* items - 8/12 */}
          <div className="md:col-span-2">
            <ul className="divide-y divide-hairline border-y border-hairline">
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
                      className="h-20 w-20 rounded-[12px] sm:h-24 sm:w-24"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="text-sm font-bold text-text-hi hover:text-accent"
                    >
                      {line.productTitle}
                    </Link>
                    <p className="mt-1 text-[12px] text-text-low">
                      {line.variantTitle}
                    </p>
                    <p className="mt-1.5 text-[12px] text-text-mid">
                      {formatPaise(line.unitInPaise)}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-[6px] border border-hairline">
                        <QtyButton
                          label={`Decrease quantity of ${line.productTitle}`}
                          onClick={() => setQuantity(line.id, line.quantity - 1)}
                        >
                          −
                        </QtyButton>
                        <span className="w-9 text-center text-[13px] text-text-hi">
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
                        className="text-[12px] text-text-low underline transition-colors hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-text-hi">
                    {formatPaise(line.unitInPaise * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* summary - 4/12 */}
          <aside className="md:sticky md:top-[calc(var(--header-h)+16px)] md:self-start">
            <div className="rounded-[12px] bg-surface-1 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-text-hi">Total</h2>
                <p className="text-[17px] font-bold text-text-hi">
                  {formatPaise(total)}
                </p>
              </div>

              <Link
                href="/checkout"
                className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-black transition-colors hover:bg-accent-hover"
              >
                Check out
              </Link>

              <p className="mt-3 text-center">
                <Link
                  href="/collections"
                  className="text-[13px] text-text-mid hover:text-text-hi"
                >
                  Continue shopping
                </Link>
              </p>

              <small className="mt-5 block text-center text-[12px] leading-relaxed text-text-low">
                Tax included.{" "}
                <Link
                  href="/policies/shipping"
                  className="underline hover:text-text-hi"
                >
                  Shipping
                </Link>{" "}
                calculated at checkout.
              </small>
            </div>
          </aside>
        </div>
      )}
    </>
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
      className="grid h-9 w-9 place-items-center text-[15px] text-text-mid transition-colors hover:text-text-hi disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
