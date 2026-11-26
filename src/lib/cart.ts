import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";

/**
 * The cart.
 *
 * Identified by a random token in an httpOnly cookie, not by a user,
 * because a shop that demands a sign-in before it will hold a skin
 * loses the sale. When sign-in lands, the cart is claimed by setting
 * userId on the row the cookie already points at, and nothing the
 * customer chose is lost.
 *
 * Prices are read live from the variant rather than frozen into the
 * line. A cart is a wish, not a contract - what gets frozen is the
 * OrderItem at checkout. The one thing the line does carry is the
 * design, in customData, because a design can be deleted from the
 * dashboard and the cart must still be able to say what was chosen.
 */

const COOKIE = "epro_cart";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days
const MAX_QTY = 10;

export type CartCustom = {
  designId?: string;
  designName?: string;
  designImageUrl?: string | null;
  designPriceInPaise?: number;
  logoCutout?: boolean;
};

export type CartLine = {
  id: string;
  variantId: string;
  productSlug: string;
  productTitle: string;
  /** the device, e.g. "iPhone 11" */
  deviceName: string;
  design: string | null;
  logoCutout: boolean | null;
  imageUrl: string | null;
  unitInPaise: number;
  quantity: number;
  /** what can still be sold; 0 means it went out of stock in the cart */
  available: number;
};

export type CartSummary = {
  id: string;
  lines: CartLine[];
  count: number;
  subtotalInPaise: number;
};

/** The token in the cookie, or null. Never writes. */
export async function cartToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

/**
 * The token, creating the cookie if there is none.
 *
 * Only callable from a Server Action or a Route Handler - a page
 * render may not set cookies - which is why reading and creating are
 * two functions rather than one with a flag.
 */
export async function ensureCartToken(): Promise<string> {
  const jar = await cookies();
  const found = jar.get(COOKIE)?.value;
  if (found) return found;

  const token = crypto.randomUUID();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return token;
}

export async function getOrCreateCart(): Promise<string> {
  const token = await ensureCartToken();

  const existing = await db.cart.findUnique({
    where: { token },
    select: { id: true },
  });
  if (existing) return existing.id;

  const made = await db.cart.create({
    data: { token },
    select: { id: true },
  });
  return made.id;
}

function custom(value: unknown): CartCustom {
  return value && typeof value === "object" ? (value as CartCustom) : {};
}

/** What the cart page and the header badge read. Null when empty. */
export async function getCart(): Promise<CartSummary | null> {
  const token = await cartToken();
  if (!token) return null;

  const cart = await db.cart.findUnique({
    where: { token },
    select: {
      id: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          customData: true,
          variant: {
            select: {
              id: true,
              stock: true,
              active: true,
              priceInPaise: true,
              deviceModel: { select: { name: true } },
              product: {
                select: {
                  slug: true,
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

  if (!cart) return null;

  const lines: CartLine[] = cart.items.map((item) => {
    const c = custom(item.customData);
    const v = item.variant;
    const live = v.active && v.product.status === "ACTIVE";

    return {
      id: item.id,
      variantId: v.id,
      productSlug: v.product.slug,
      productTitle: v.product.title,
      deviceName: v.deviceModel.name,
      design: c.designName ?? null,
      logoCutout: typeof c.logoCutout === "boolean" ? c.logoCutout : null,
      imageUrl: c.designImageUrl ?? v.product.images[0]?.url ?? null,
      unitInPaise: v.priceInPaise + (c.designPriceInPaise ?? 0),
      quantity: item.quantity,
      available: live ? v.stock : 0,
    };
  });

  return {
    id: cart.id,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalInPaise: lines.reduce((n, l) => n + l.unitInPaise * l.quantity, 0),
  };
}

/** Just the badge. One count, not the whole cart. */
export async function getCartCount(): Promise<number> {
  const token = await cartToken();
  if (!token) return 0;

  const rows = await db.cartItem.aggregate({
    where: { cart: { token } },
    _sum: { quantity: true },
  });
  return rows._sum.quantity ?? 0;
}

export const CART_MAX_QTY = MAX_QTY;
