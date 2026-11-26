"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CART_MAX_QTY, cartToken, getOrCreateCart } from "@/lib/cart";

/**
 * What the shop writes to a cart.
 *
 * Unlike the dashboard's actions these are meant to be reachable by
 * anyone - that is the point of a shop - so each one proves the line
 * it is about belongs to the cart in this browser's cookie before it
 * touches anything. A line id on its own is a guess at someone else's
 * cart otherwise.
 *
 * Quantity is clamped to what is actually on the shelf. The shop
 * should not let someone carry ten of a thing it has two of all the
 * way to a payment page before saying so.
 */

export type CartResult =
  | { ok: true; message: string; count: number }
  | { ok: false; message: string };

function refresh() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // Called outside a request. The write stands.
  }
}

async function countFor(cartId: string): Promise<number> {
  const sum = await db.cartItem.aggregate({
    where: { cartId },
    _sum: { quantity: true },
  });
  return sum._sum.quantity ?? 0;
}

export type AddInput = {
  variantId: string;
  quantity?: number;
  designId?: string;
  logoCutout?: boolean;
};

export async function addToCart(input: AddInput): Promise<CartResult> {
  const want = Math.max(1, Math.min(CART_MAX_QTY, Math.round(input.quantity ?? 1)));

  try {
    const variant = await db.variant.findUnique({
      where: { id: input.variantId },
      select: {
        id: true,
        stock: true,
        active: true,
        priceInPaise: true,
        deviceModel: { select: { name: true } },
        product: { select: { title: true, status: true } },
      },
    });

    if (!variant || !variant.active || variant.product.status !== "ACTIVE")
      return { ok: false, message: "That skin is not for sale." };

    if (variant.priceInPaise <= 0)
      return { ok: false, message: "That skin has no price yet." };

    if (variant.stock <= 0)
      return { ok: false, message: "That one is out of stock." };

    // A design that was hidden or deleted between the page render and
    // the click must not ride along into the cart.
    let design = null;
    if (input.designId) {
      design = await db.design.findFirst({
        where: { id: input.designId, active: true },
        select: { id: true, name: true, imageUrl: true, priceInPaise: true },
      });
      if (!design)
        return { ok: false, message: "That design is no longer available." };
    }

    const cartId = await getOrCreateCart();

    const customData = {
      ...(design
        ? {
            designId: design.id,
            designName: design.name,
            designImageUrl: design.imageUrl,
            designPriceInPaise: design.priceInPaise,
          }
        : {}),
      ...(typeof input.logoCutout === "boolean"
        ? { logoCutout: input.logoCutout }
        : {}),
    };

    // The same skin in the same design is one line with a bigger
    // number, not two identical rows the customer has to reconcile.
    const twin = await db.cartItem.findFirst({
      where: {
        cartId,
        variantId: variant.id,
        customData: { equals: customData },
      },
      select: { id: true, quantity: true },
    });

    if (twin) {
      const next = Math.min(CART_MAX_QTY, variant.stock, twin.quantity + want);
      await db.cartItem.update({
        where: { id: twin.id },
        data: { quantity: next },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId,
          variantId: variant.id,
          quantity: Math.min(want, variant.stock),
          customData,
        },
      });
    }

    refresh();

    return {
      ok: true,
      message: `${variant.product.title} for ${variant.deviceModel.name} is in your cart.`,
      count: await countFor(cartId),
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not add that.",
    };
  }
}

/** Set a line's quantity. Zero removes it. */
export async function setLineQuantity(
  lineId: string,
  quantity: number,
): Promise<CartResult> {
  try {
    const token = await cartToken();
    if (!token) return { ok: false, message: "Your cart has expired." };

    const line = await db.cartItem.findFirst({
      where: { id: lineId, cart: { token } },
      select: {
        id: true,
        cartId: true,
        variant: { select: { stock: true } },
      },
    });
    if (!line) return { ok: false, message: "That line is not in your cart." };

    const want = Math.round(quantity);

    if (want <= 0) {
      await db.cartItem.delete({ where: { id: line.id } });
      refresh();
      return {
        ok: true,
        message: "Removed.",
        count: await countFor(line.cartId),
      };
    }

    const next = Math.min(CART_MAX_QTY, line.variant.stock, want);
    await db.cartItem.update({
      where: { id: line.id },
      data: { quantity: next },
    });
    refresh();

    return {
      ok: true,
      message:
        next < want
          ? `Only ${next} of that are in stock.`
          : "Cart updated.",
      count: await countFor(line.cartId),
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update the cart.",
    };
  }
}

export async function clearCart(): Promise<CartResult> {
  try {
    const token = await cartToken();
    if (!token) return { ok: true, message: "Already empty.", count: 0 };

    const cart = await db.cart.findUnique({
      where: { token },
      select: { id: true },
    });
    if (!cart) return { ok: true, message: "Already empty.", count: 0 };

    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    refresh();

    return { ok: true, message: "Cart emptied.", count: 0 };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not empty the cart.",
    };
  }
}
