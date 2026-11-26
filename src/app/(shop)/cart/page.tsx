import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { getCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your skins before checkout.",
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="page py-10 md:py-14">
      <CartView initialLines={cart?.lines ?? []} />
    </div>
  );
}
