import type { Metadata } from "next";
import { CartView, type CartLine } from "@/components/CartView";
import { BUYABLE_OFFERS, getProductBySlug, optionLabelFor } from "@/lib/realCatalog";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your skins before checkout.",
};

/**
 * Cart shell.
 *
 * Until the database is connected there is no persisted cart, so the
 * page seeds itself with two real, buyable offers from the imported
 * catalog. That keeps the layout honest — real titles, real prices, real
 * photos where Shopify has them — without pretending an order exists.
 *
 * When the cart table lands, this function reads the session's cart
 * instead and nothing in CartView changes.
 */
function demoLines(): CartLine[] {
  const picks = BUYABLE_OFFERS.filter((o) => o.available && o.imageUrl).slice(
    0,
    2,
  );

  return picks.map((o, i) => {
    const product = getProductBySlug(o.productSlug);

    return {
      id: o.id,
      productSlug: o.productSlug,
      productTitle: o.productTitle,
      variantTitle: o.variantTitle,
      optionLabel: product ? optionLabelFor(product) : "Option",
      unitInPaise: o.priceInPaise,
      imageUrl: o.imageUrl,
      quantity: i === 0 ? 1 : 2,
    };
  });
}

export default function CartPage() {
  const lines = demoLines();

  // The live cart page has no kicker and no rule under the title - the
  // heading is centred and the content starts straight after it.
  return (
    <div className="page py-10 md:py-20">
      <CartView initialLines={lines} />
    </div>
  );
}
