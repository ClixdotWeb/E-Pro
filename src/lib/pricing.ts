import { applyPercent, sumPaise, type Paise } from "./money";

/**
 * Mirrors the DiscountType enum in schema.prisma, declared here rather
 * than imported from the generated Prisma client so this module stays
 * usable from client components too. The string values must match the
 * schema exactly.
 */
export type DiscountType = "PERCENT" | "FIXED" | "FREE_SHIPPING";

/**
 * SECURITY: totals are computed here, on the server, from database prices.
 * Never trust a price, quantity subtotal or total sent by the browser.
 * The only thing the client gets to choose is variantId + quantity.
 */

/**
 * The defaults, and only the defaults.
 *
 * The live numbers live in the Setting table so the shop owner can
 * change them without a deploy; these are what a fresh install
 * starts with and what every caller falls back to. Callers that can
 * reach the database pass the real rules in - see getMoneyRules.
 */
export const FREE_SHIPPING_THRESHOLD_PAISE = 49900; // ₹499
export const FLAT_SHIPPING_PAISE = 4900; // ₹49
export const GST_RATE_BPS = 1800; // 18% in basis points

export type MoneyRules = {
  flatShippingInPaise: number;
  freeShippingOverPaise: number;
  gstBps: number;
};

export const DEFAULT_MONEY_RULES: MoneyRules = {
  flatShippingInPaise: FLAT_SHIPPING_PAISE,
  freeShippingOverPaise: FREE_SHIPPING_THRESHOLD_PAISE,
  gstBps: GST_RATE_BPS,
};

export type PriceableItem = {
  variantId: string;
  quantity: number;
  unitInPaise: Paise;
};

export type AppliedDiscount = {
  code: string;
  type: DiscountType;
  value: number;
  minOrderInPaise: Paise;
};

export type OrderTotals = {
  subtotalInPaise: Paise;
  discountInPaise: Paise;
  shippingInPaise: Paise;
  taxInPaise: Paise;
  totalInPaise: Paise;
};

export function lineTotal(item: PriceableItem): Paise {
  return item.unitInPaise * item.quantity;
}

export function calculateTotals(
  items: PriceableItem[],
  discount?: AppliedDiscount | null,
  rules: MoneyRules = DEFAULT_MONEY_RULES,
): OrderTotals {
  const subtotalInPaise = sumPaise(items.map(lineTotal));

  let discountInPaise = 0;
  let freeShipping = false;

  if (discount && subtotalInPaise >= discount.minOrderInPaise) {
    switch (discount.type) {
      case "PERCENT":
        discountInPaise = applyPercent(subtotalInPaise, discount.value);
        break;
      case "FIXED":
        // Never let a discount exceed the cart, or totals go negative.
        discountInPaise = Math.min(discount.value, subtotalInPaise);
        break;
      case "FREE_SHIPPING":
        freeShipping = true;
        break;
    }
  }

  const discountedSubtotal = subtotalInPaise - discountInPaise;

  let shippingInPaise = 0;
  if (!freeShipping && discountedSubtotal > 0) {
    shippingInPaise =
      discountedSubtotal >= rules.freeShippingOverPaise
        ? 0
        : rules.flatShippingInPaise;
  }

  // Prices shown on site are GST-inclusive, so tax is back-calculated
  // for the invoice rather than added on top.
  const taxableBase = discountedSubtotal + shippingInPaise;
  const taxInPaise = Math.round(
    (taxableBase * rules.gstBps) / (10000 + rules.gstBps),
  );

  const totalInPaise = discountedSubtotal + shippingInPaise;

  return {
    subtotalInPaise,
    discountInPaise,
    shippingInPaise,
    taxInPaise,
    totalInPaise,
  };
}
