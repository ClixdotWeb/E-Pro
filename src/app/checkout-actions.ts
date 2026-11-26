"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { cartToken } from "@/lib/cart";
import { calculateTotals } from "@/lib/pricing";

/**
 * Placing an order.
 *
 * SECURITY, and it is the whole reason this is long: the browser
 * sends an address and nothing else. Every price, every quantity and
 * every total is read from the database here. A checkout that
 * believes a total posted to it is a checkout that sells skins for a
 * rupee.
 *
 * What the order freezes is deliberate. The cart reads prices live,
 * because a cart is a wish; an OrderItem copies the title, the
 * device, the design and the price as they were at the moment of
 * sale, because a receipt that recalculates is not a receipt. A
 * design deleted next month must not change what someone paid for.
 *
 * Stock comes off inside the same transaction, conditionally - the
 * update is written as "decrement where stock >= quantity" so two
 * people buying the last one cannot both succeed. One of them gets
 * the sale and the other gets told, rather than both getting a
 * confirmation and one getting a phone call.
 *
 * No money changes hands. The gateway is not chosen yet, so the
 * order lands UNPAID and PENDING, which is exactly where a
 * pay-on-delivery order would sit too. When the gateway arrives it
 * goes between the totals and the commit, and nothing else here
 * changes.
 */

export type PlaceOrderResult = { ok: false; message: string };

const PIN = /^[1-9][0-9]{5}$/;
const PHONE = /^[6-9][0-9]{9}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

/** EPRO-1001, EPRO-1002 - one at a time, inside the transaction. */
async function nextOrderNumber(
  tx: Pick<typeof db, "counter">,
): Promise<string> {
  const counter = await tx.counter.upsert({
    where: { name: "order" },
    create: { name: "order", value: 1001 },
    update: { value: { increment: 1 } },
    select: { value: true },
  });
  return `EPRO-${counter.value}`;
}

export async function placeOrder(
  _prev: PlaceOrderResult | null,
  form: FormData,
): Promise<PlaceOrderResult | null> {
  const email = field(form, "email").toLowerCase();
  const phone = field(form, "phone").replace(/\s+/g, "");
  const fullName = [field(form, "firstName"), field(form, "lastName")]
    .filter(Boolean)
    .join(" ");
  const line1 = field(form, "line1");
  const line2 = field(form, "line2");
  const city = field(form, "city");
  const state = field(form, "state");
  const pincode = field(form, "pincode").replace(/\s+/g, "");

  if (!EMAIL.test(email))
    return { ok: false, message: "That does not look like an email address." };
  if (!PHONE.test(phone))
    return { ok: false, message: "Enter a 10-digit mobile number." };
  if (!fullName) return { ok: false, message: "We need a name for the parcel." };
  if (!line1 || !city || !state)
    return { ok: false, message: "The address is not complete." };
  if (!PIN.test(pincode))
    return { ok: false, message: "That PIN code is not a real one." };

  const token = await cartToken();
  if (!token) return { ok: false, message: "Your cart has expired." };

  let orderNumber: string;

  try {
    const cart = await db.cart.findUnique({
      where: { token },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            quantity: true,
            customData: true,
            variant: {
              select: {
                id: true,
                sku: true,
                stock: true,
                active: true,
                priceInPaise: true,
                deviceModel: { select: { name: true } },
                product: {
                  select: {
                    title: true,
                    status: true,
                    images: {
                      orderBy: { position: "asc" },
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0)
      return { ok: false, message: "There is nothing in your cart." };

    // Everything is checked before a single row is written, so a cart
    // with one dead line does not leave a half-made order behind.
    const lines = cart.items.map((item) => {
      const v = item.variant;
      const c =
        item.customData && typeof item.customData === "object"
          ? (item.customData as {
              designName?: string;
              designImageUrl?: string | null;
              designPriceInPaise?: number;
              logoCutout?: boolean;
            })
          : {};

      return {
        item,
        variant: v,
        custom: c,
        unitInPaise: v.priceInPaise + (c.designPriceInPaise ?? 0),
      };
    });

    for (const l of lines) {
      const v = l.variant;
      if (!v.active || v.product.status !== "ACTIVE")
        return {
          ok: false,
          message: `${v.product.title} for the ${v.deviceModel.name} is no longer for sale. Remove it from your cart.`,
        };
      if (v.priceInPaise <= 0)
        return {
          ok: false,
          message: `${v.product.title} has no price. Remove it from your cart.`,
        };
      if (v.stock < l.item.quantity)
        return {
          ok: false,
          message:
            v.stock === 0
              ? `${v.deviceModel.name} in ${v.product.title} sold out while you were shopping.`
              : `Only ${v.stock} left of ${v.deviceModel.name} in ${v.product.title}.`,
        };
    }

    const totals = calculateTotals(
      lines.map((l) => ({
        variantId: l.variant.id,
        quantity: l.item.quantity,
        unitInPaise: l.unitInPaise,
      })),
    );

    const session = await auth();

    orderNumber = await db.$transaction(async (tx) => {
      // Conditional decrements. updateMany with a stock guard in the
      // WHERE means the row only moves if it still has the stock, so
      // two people buying the last one cannot both win.
      for (const l of lines) {
        const { count } = await tx.variant.updateMany({
          where: { id: l.variant.id, stock: { gte: l.item.quantity } },
          data: { stock: { decrement: l.item.quantity } },
        });
        if (count !== 1)
          throw new Error(
            `${l.variant.deviceModel.name} in ${l.variant.product.title} sold out while you were checking out.`,
          );
      }

      const number = await nextOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          orderNumber: number,
          userId: session?.user?.id ?? null,
          email,
          phone,
          subtotalInPaise: totals.subtotalInPaise,
          discountInPaise: totals.discountInPaise,
          shippingInPaise: totals.shippingInPaise,
          taxInPaise: totals.taxInPaise,
          totalInPaise: totals.totalInPaise,
          shippingAddress: {
            fullName,
            line1,
            line2: line2 || null,
            city,
            state,
            pincode,
            phone,
            country: "IN",
          },
          items: {
            create: lines.map((l) => ({
              variantId: l.variant.id,
              productTitle: l.variant.product.title,
              deviceName: l.variant.deviceModel.name,
              sku: l.variant.sku,
              unitInPaise: l.unitInPaise,
              quantity: l.item.quantity,
              totalInPaise: l.unitInPaise * l.item.quantity,
              imageUrl:
                l.custom.designImageUrl ??
                l.variant.product.images[0]?.url ??
                null,
              customData: l.item.customData ?? undefined,
            })),
          },
          events: {
            create: { type: "pending", message: "Order placed" },
          },
        },
        select: { id: true },
      });

      // The cart is emptied, not deleted: the cookie keeps pointing at
      // a row, so the next thing added works without a new cart.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "CONVERTED" },
      });

      return order.id ? number : number;
    });
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error ? e.message : "Could not place the order. Try again.",
    };
  }

  try {
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
  } catch {
    // The order is placed. A cache hint is not worth failing over.
  }

  redirect(`/order/${orderNumber}`);
}
