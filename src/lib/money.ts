/**
 * Money rules for this codebase:
 *   - Store and compute in integer PAISE. Always.
 *   - Convert to rupees only when rendering to a human.
 *   - Never use Number arithmetic on rupee floats (0.1 + 0.2 problems
 *     turn into real refund disputes).
 */

export type Paise = number;

export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isFinite(rupees)) throw new Error("rupeesToPaise: not a number");
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: Paise): number {
  return paise / 100;
}

/**
 * The live store renders prices as "Rs. 949.00 INR" - its Shopify
 * money_format is "Rs. {{amount}}" with the currency code shown, and
 * {{amount}} is the Indian-grouped figure with two decimals always.
 *
 * This was "₹949" here, which is shorter and arguably reads better,
 * but it is not what the store shows, so it is matched exactly.
 */
const amountFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 94900 -> "Rs. 949.00 INR" */
export function formatPaise(paise: Paise): string {
  return `Rs. ${amountFormatter.format(paise / 100)} INR`;
}

/** Percentage off, rounded down so we never over-discount. */
export function applyPercent(paise: Paise, percent: number): Paise {
  if (percent <= 0) return 0;
  const capped = Math.min(percent, 100);
  return Math.floor((paise * capped) / 100);
}

export function clampPaise(value: Paise, min: Paise, max: Paise): Paise {
  return Math.max(min, Math.min(max, value));
}

export function sumPaise(values: Paise[]): Paise {
  return values.reduce((acc, v) => acc + v, 0);
}
