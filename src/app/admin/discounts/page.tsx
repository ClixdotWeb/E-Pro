import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { DiscountManager } from "@/components/admin/DiscountManager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Discounts" };

/**
 * Discount codes.
 *
 * The two example codes that used to fill this list are gone - they
 * were not in the database, so creating a third made the first two
 * vanish on the next reload. It reads the Discount table now.
 *
 * The three types and their guards already exist in calculateTotals:
 * percent off, a fixed amount capped at the cart total so it can
 * never go negative, and free shipping.
 */
export default async function AdminDiscountsPage() {
  const rows = await db.discount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      minOrderInPaise: true,
      maxUses: true,
      usedCount: true,
      active: true,
    },
  });

  return (
    <>
      <PageHeader
        title="Discounts"
        description="Codes a customer types to get money off. Three kinds: a percentage, a fixed amount, or free shipping."
      />

      {/* The honest gap, said once, where it is relevant. */}
      <p className="mb-6 rounded-[8px] border border-hairline bg-surface-1 px-4 py-3 text-[13px] leading-relaxed text-text-mid">
        There is nowhere on the shop to type a code yet. A box has to be
        added to{" "}
        <Link href="/checkout" className="text-accent hover:underline">
          our checkout
        </Link>{" "}
        before any of these can be used.
      </p>

      <DiscountManager initial={rows} />
    </>
  );
}
