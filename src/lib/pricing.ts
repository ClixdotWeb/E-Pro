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

export const FREE_SHIPPING_THRESHOLD_PAISE = 49900; // ₹499
export const FLAT_SHIPPING_PAISE = 4900; // ₹49
export const GST_RATE_BPS = 1800; // 18% in basis points

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
      discountedSubtotal >= FREE_SHIPPING_THRESHOLD_PAISE
        ? 0
        : FLAT_SHIPPING_PAISE;
  }

  // Prices shown on site are GST-inclusive, so tax is back-calculated
  // for the invoice rather than added on top.
  const taxableBase = discountedSubtotal + shippingInPaise;
  const taxInPaise = Math.round(
    (taxableBase * GST_RATE_BPS) / (10000 + GST_RATE_BPS),
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
