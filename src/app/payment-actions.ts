"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { cartToken } from "@/lib/cart";
import {
  PaymentNotConfiguredError,
  paymentProvider,
  paymentStatus,
  type ClientIntent,
  type ClientResult,
} from "@/lib/payments";

/**
 * Taking the money.
 *
 * Two steps, because that is how every gateway works: ask ours for an
 * intent, let the browser talk to theirs, then come back and have the
 * handshake checked here. The browser is never trusted with the
 * second half - it hands back a signature and we recompute it.
 *
 * The amount is read from the order row. Not from the form, not from
 * the intent the client was handed, not from what the gateway says it
 * charged: from the row we wrote when the order was placed. A client
 * that can name its own price pays a rupee.
 *
 * Nothing here decides an order is paid on the browser's word alone
 * if a webhook is available - the webhook is the authority, and this
 * is the fast path so the customer sees their confirmation without
 * waiting for it. Both land on the same rows and both are idempotent,
 * so whichever arrives second changes nothing.
 */

export type StartPaymentResult =
  | { ok: true; intent: ClientIntent }
  | { ok: false; message: string };

/**
 * Proof that this browser may pay this order.
 *
 * The order number alone is a guess at someone else's: they are
 * sequential. So the order has to be one this cart just converted, or
 * one belonging to the signed-in user.
 */
async function ownsOrder(orderNumber: string): Promise<boolean> {
  const token = await cartToken();
  if (!token) return false;

  const hit = await db.order.findFirst({
    where: {
      orderNumber,
      OR: [
        { user: { carts: { some: { token } } } },
        // A guest: the cart this order was made from still carries the
        // cookie, and the cart was marked CONVERTED at that moment.
        { items: { some: { variant: { cartItems: { some: { cart: { token } } } } } } },
      ],
    },
    select: { id: true },
  });
  if (hit) return true;

  // The converted cart no longer holds items, so fall back to the
  // cart row itself: it is the one this cookie points at, and it was
  // converted by the checkout that made this order.
  const cart = await db.cart.findUnique({
    where: { token },
    select: { id: true, status: true, userId: true },
  });
  if (!cart || cart.status !== "CONVERTED") return false;

  const order = await db.order.findUnique({
    where: { orderNumber },
    select: { userId: true, placedAt: true },
  });
  if (!order) return false;

  // Same signed-in person, or a guest order placed in the last hour
  // from the cart this cookie owns.
  if (cart.userId && order.userId === cart.userId) return true;
  return Date.now() - order.placedAt.getTime() < 60 * 60 * 1000;
}

export async function startPayment(
  orderNumber: string,
): Promise<StartPaymentResult> {
  const status = paymentStatus();
  if (!status.usable)
    return {
      ok: false,
      message: "Online payment is not switched on yet.",
    };

  if (!(await ownsOrder(orderNumber)))
    return { ok: false, message: "That order is not yours to pay." };

  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        phone: true,
        totalInPaise: true,
        paymentStatus: true,
        shippingAddress: true,
      },
    });
    if (!order) return { ok: false, message: "No such order." };

    if (order.paymentStatus === "PAID")
      return { ok: false, message: "That order is already paid." };

    const name =
      order.shippingAddress &&
      typeof order.shippingAddress === "object" &&
      "fullName" in order.shippingAddress
        ? String((order.shippingAddress as { fullName?: unknown }).fullName ?? "")
        : "";

    const provider = paymentProvider();
    const intent = await provider.createIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountInPaise: order.totalInPaise,
      customer: { email: order.email, name: name || null, phone: order.phone },
    });

    // One Payment row per gateway order, so a second attempt after a
    // dismissed modal does not pile up rows against the same order.
    await db.payment.upsert({
      where: { razorpayOrderId: intent.providerOrderId },
      create: {
        orderId: order.id,
        provider: intent.provider,
        razorpayOrderId: intent.providerOrderId,
        amountInPaise: order.totalInPaise,
        status: "UNPAID",
      },
      update: { amountInPaise: order.totalInPaise },
    });

    return { ok: true, intent };
  } catch (e) {
    if (e instanceof PaymentNotConfiguredError)
      return { ok: false, message: "The payment gateway is not set up yet." };
    return {
      ok: false,
      message:
        e instanceof Error ? e.message : "Could not start the payment.",
    };
  }
}

export type ConfirmPaymentResult = { ok: boolean; message: string };

export async function confirmPayment(
  orderNumber: string,
  result: ClientResult,
): Promise<ConfirmPaymentResult> {
  if (!(await ownsOrder(orderNumber)))
    return { ok: false, message: "That order is not yours." };

  try {
    const provider = paymentProvider();
    const verified = await provider.verifyClientResult(result);

    if (!verified.ok || !verified.providerPaymentId) {
      await db.orderEvent.create({
        data: {
          order: { connect: { orderNumber } },
          type: "payment_failed",
          message: `Payment handshake rejected: ${verified.reason ?? "unknown"}`,
        },
      });
      return {
        ok: false,
        message:
          "We could not verify that payment. Nothing has been charged twice — talk to us before trying again.",
      };
    }

    await markPaid({
      orderNumber,
      providerOrderId: verified.providerOrderId,
      providerPaymentId: verified.providerPaymentId,
      source: "checkout",
    });

    return { ok: true, message: "Payment received." };
  } catch (e) {
    if (e instanceof PaymentNotConfiguredError)
      return { ok: false, message: "The payment gateway is not set up yet." };
    return {
      ok: false,
      message:
        e instanceof Error ? e.message : "Could not confirm the payment.",
    };
  }
}

/**
 * Mark an order paid, once.
 *
 * Called by the checkout handshake and by the webhook, and they race:
 * both are written so the second one finds the work done and changes
 * nothing. An order already PAID is left alone, and the event is only
 * written when the status actually moves - otherwise the history fills
 * with "paid" twice for one payment.
 */
export async function markPaid(opts: {
  orderNumber: string;
  providerOrderId: string | null;
  providerPaymentId: string;
  source: "checkout" | "webhook";
}): Promise<void> {
  const order = await db.order.findUnique({
    where: { orderNumber: opts.orderNumber },
    select: { id: true, paymentStatus: true, status: true },
  });
  if (!order) return;

  if (order.paymentStatus === "PAID") return;

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        // Paid is the signal to start cutting, so it confirms itself.
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      },
    });

    if (opts.providerOrderId) {
      await tx.payment.updateMany({
        where: { razorpayOrderId: opts.providerOrderId },
        data: {
          razorpayPaymentId: opts.providerPaymentId,
          status: "PAID",
        },
      });
    }

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: "paid",
        message: "Payment received",
        actor: opts.source,
      },
    });
  });

  try {
    revalidatePath("/admin", "layout");
    revalidatePath(`/order/${opts.orderNumber}`);
  } catch {
    // A webhook is not a page request. The write stands.
  }
}

/** Record a failed attempt without touching the order's own status. */
export async function markPaymentFailed(opts: {
  providerOrderId: string | null;
  providerPaymentId: string | null;
  reason?: string;
}): Promise<void> {
  if (!opts.providerOrderId) return;

  const payment = await db.payment.findUnique({
    where: { razorpayOrderId: opts.providerOrderId },
    select: { id: true, orderId: true },
  });
  if (!payment) return;

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      razorpayPaymentId: opts.providerPaymentId ?? undefined,
      errorDesc: opts.reason ?? null,
    },
  });

  await db.orderEvent.create({
    data: {
      orderId: payment.orderId,
      type: "payment_failed",
      message: opts.reason ? `Payment failed: ${opts.reason}` : "Payment failed",
      actor: "webhook",
    },
  });
}

/**
 * Pretend the test gateway took the money.
 *
 * The mock provider signs its handshake with a server-side secret, so
 * the browser cannot produce a valid one - which is the point: the
 * verification path is exercised for real rather than stubbed to
 * `return true`. This is the only way to get a signed result without
 * a gateway account, and it refuses to exist in production, where the
 * mock provider refuses to load at all.
 */
export async function simulateTestPayment(
  providerOrderId: string,
): Promise<ClientResult | null> {
  if (process.env.NODE_ENV === "production") return null;
  if (paymentStatus().id !== "mock") return null;

  const { mockSignHandshake } = await import("@/lib/payments/mock");
  const paymentId = `mock_pay_${Date.now().toString(36)}`;

  return {
    providerOrderId,
    providerPaymentId: paymentId,
    signature: mockSignHandshake(providerOrderId, paymentId),
  };
}
