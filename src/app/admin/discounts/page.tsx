import Link from "next/link";
import { NotSavingYet, PageHeader } from "@/components/admin/ui";
import {
  DiscountManager,
  type DiscountRow,
} from "@/components/admin/DiscountManager";

export const metadata = { title: "Discounts" };

/**
 * Discount codes.
 *
 * This was an empty screen with a sentence explaining what it would
 * one day do, which is a worse thing to put in a dashboard than
 * nothing at all. It is the real form now; only saving is missing.
 *
 * The three types and their guards already exist in
 * calculateTotals - percent off, a fixed amount capped at the cart
 * total so it can never go negative, and free shipping - and the
 * Discount model in the schema already has code, value, minimum order,
 * use limits and dates. So this screen is the last piece of the
 * feature rather than a sketch of it.
 *
 * Two examples are shown so the list is not empty on a first visit.
 */
const EXAMPLES: DiscountRow[] = [
  {
    id: "d1",
    code: "EPRO10",
    type: "PERCENT",
    value: 10,
    minOrderInPaise: 0,
    maxUses: null,
    usedCount: 0,
    active: true,
  },
  {
    id: "d2",
    code: "FREESHIP",
    type: "FREE_SHIPPING",
    value: 0,
    minOrderInPaise: 29900,
    maxUses: 100,
    usedCount: 0,
    active: true,
  },
];

export default function AdminDiscountsPage() {
  return (
    <>
      <PageHeader
        title="Discounts"
        description="Codes a customer types to get money off. Three kinds: a percentage, a fixed amount, or free shipping."
      />

      <NotSavingYet what="Discount codes" />

      {/* The honest gap, said once, where it is relevant. */}
      <p className="mb-6 rounded-[8px] border border-hairline bg-surface-1 px-4 py-3 text-[13px] leading-relaxed text-text-mid">
        There is nowhere on the shop to type a code yet. Shopify asks for
        it inside its own checkout, which we do not have, so a box has to
        be added to{" "}
        <Link href="/checkout" className="text-accent hover:underline">
          our checkout
        </Link>{" "}
        before any of these can be used.
      </p>

      <DiscountManager initial={EXAMPLES} />
    </>
  );
}
