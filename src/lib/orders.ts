import "server-only";
import { db } from "./db";

/**
 * Orders.
 *
 * Nothing here invents a row. Until a checkout places one, every
 * screen that reads these functions shows its empty state - which is
 * what a new shop looks like, and is more use to the owner than three
 * fictional customers that cannot be clicked.
 */

export type OrderSummary = {
  orderNumber: string;
  placedAt: Date;
  status: string;
  paymentStatus: string;
  email: string;
  customerName: string;
  itemCount: number;
  totalInPaise: number;
  trackingNumber: string | null;
};

export type OrderLine = {
  id: string;
  productTitle: string;
  deviceName: string;
  design: string | null;
  sku: string;
  unitInPaise: number;
  quantity: number;
  totalInPaise: number;
  imageUrl: string | null;
};

export type OrderDetail = OrderSummary & {
  id: string;
  phone: string | null;
  subtotalInPaise: number;
  discountInPaise: number;
  shippingInPaise: number;
  taxInPaise: number;
  courier: string | null;
  shippingAddress: unknown;
  lines: OrderLine[];
  events: { type: string; message: string; createdAt: Date }[];
};

function nameFrom(address: unknown, fallback: string): string {
  if (address && typeof address === "object" && "fullName" in address) {
    const n = (address as { fullName?: unknown }).fullName;
    if (typeof n === "string" && n.trim()) return n;
  }
  return fallback;
}

function designFrom(custom: unknown): string | null {
  if (custom && typeof custom === "object" && "designName" in custom) {
    const n = (custom as { designName?: unknown }).designName;
    if (typeof n === "string" && n) return n;
  }
  return null;
}

const SUMMARY = {
  orderNumber: true,
  placedAt: true,
  status: true,
  paymentStatus: true,
  email: true,
  totalInPaise: true,
  trackingNumber: true,
  shippingAddress: true,
  _count: { select: { items: true } },
} as const;

type SummaryRow = {
  orderNumber: string;
  placedAt: Date;
  status: string;
  paymentStatus: string;
  email: string;
  totalInPaise: number;
  trackingNumber: string | null;
  shippingAddress: unknown;
  _count: { items: number };
};

function toSummary(o: SummaryRow): OrderSummary {
  return {
    orderNumber: o.orderNumber,
    placedAt: o.placedAt,
    status: o.status,
    paymentStatus: o.paymentStatus,
    email: o.email,
    customerName: nameFrom(o.shippingAddress, o.email),
    itemCount: o._count.items,
    totalInPaise: o.totalInPaise,
    trackingNumber: o.trackingNumber,
  };
}

/** The dashboard's list. */
export async function getOrders(limit = 50): Promise<OrderSummary[]> {
  const rows = await db.order.findMany({
    orderBy: { placedAt: "desc" },
    take: limit,
    select: SUMMARY,
  });
  return rows.map(toSummary);
}

/** One customer's own orders. */
export async function getOrdersForUser(
  userId: string,
): Promise<OrderSummary[]> {
  const rows = await db.order.findMany({
    where: { userId },
    orderBy: { placedAt: "desc" },
    select: SUMMARY,
  });
  return rows.map(toSummary);
}

export async function getOrder(
  orderNumber: string,
): Promise<OrderDetail | null> {
  const o = await db.order.findUnique({
    where: { orderNumber },
    select: {
      ...SUMMARY,
      id: true,
      phone: true,
      subtotalInPaise: true,
      discountInPaise: true,
      shippingInPaise: true,
      taxInPaise: true,
      courier: true,
      items: {
        select: {
          id: true,
          productTitle: true,
          deviceName: true,
          sku: true,
          unitInPaise: true,
          quantity: true,
          totalInPaise: true,
          imageUrl: true,
          customData: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        select: { type: true, message: true, createdAt: true },
      },
    },
  });

  if (!o) return null;

  return {
    ...toSummary(o),
    id: o.id,
    phone: o.phone,
    subtotalInPaise: o.subtotalInPaise,
    discountInPaise: o.discountInPaise,
    shippingInPaise: o.shippingInPaise,
    taxInPaise: o.taxInPaise,
    courier: o.courier,
    shippingAddress: o.shippingAddress,
    lines: o.items.map((i) => ({
      id: i.id,
      productTitle: i.productTitle,
      deviceName: i.deviceName,
      design: designFrom(i.customData),
      sku: i.sku,
      unitInPaise: i.unitInPaise,
      quantity: i.quantity,
      totalInPaise: i.totalInPaise,
      imageUrl: i.imageUrl,
    })),
    events: o.events,
  };
}

export async function getOrderStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [total, today, unfulfilled, revenue] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { placedAt: { gte: startOfDay } } }),
    db.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
    }),
    db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalInPaise: true },
    }),
  ]);

  return {
    total,
    today,
    unfulfilled,
    paidInPaise: revenue._sum.totalInPaise ?? 0,
  };
}
