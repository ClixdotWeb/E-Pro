import crypto from "node:crypto";
import type {
  ClientIntent,
  ClientResult,
  CreateIntentInput,
  ParsedWebhook,
  PaymentEventKind,
  PaymentProvider,
  RefundResult,
  VerifiedPayment,
} from "./provider";
import { PaymentNotConfiguredError } from "./provider";

/**
 * Razorpay adapter. One of several candidates - the gateway is not
 * chosen yet, so this file is swappable and nothing outside this folder
 * imports it directly.
 *
 * Razorpay works in paise natively, so no conversion is needed.
 */

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const missing: string[] = [];
  if (!keyId) missing.push("RAZORPAY_KEY_ID");
  if (!keySecret) missing.push("RAZORPAY_KEY_SECRET");
  if (!webhookSecret) missing.push("RAZORPAY_WEBHOOK_SECRET");

  if (missing.length > 0) throw new PaymentNotConfiguredError("razorpay", missing);

  return { keyId: keyId!, keySecret: keySecret!, webhookSecret: webhookSecret! };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const EVENT_KIND: Record<string, PaymentEventKind> = {
  "payment.captured": "payment.captured",
  "payment.failed": "payment.failed",
  "refund.processed": "refund.processed",
};

export const razorpayProvider: PaymentProvider = {
  id: "razorpay",
  displayName: "Razorpay",

  get configured() {
    return Boolean(
      process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        process.env.RAZORPAY_WEBHOOK_SECRET,
    );
  },

  async createIntent(input: CreateIntentInput): Promise<ClientIntent> {
    const { keyId, keySecret } = credentials();

    // Imported lazily so the SDK is not pulled in when another gateway
    // is selected.
    const { default: Razorpay } = await import("razorpay");
    const client = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await client.orders.create({
      // Razorpay amounts are already in the smallest unit.
      amount: input.amountInPaise,
      currency: "INR",
      receipt: input.orderNumber,
      notes: { orderId: input.orderId },
    });

    return {
      provider: "razorpay",
      providerOrderId: order.id,
      amountInPaise: input.amountInPaise,
      currency: "INR",
      publicKey: keyId,
    };
  },

  async verifyClientResult(result: ClientResult): Promise<VerifiedPayment> {
    const { keySecret } = credentials();

    const orderId = result.razorpay_order_id;
    const paymentId = result.razorpay_payment_id;
    const signature = result.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return {
        ok: false,
        providerPaymentId: null,
        providerOrderId: orderId ?? null,
        reason: "missing fields",
      };
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (!timingSafeEqualHex(expected, signature)) {
      return {
        ok: false,
        providerPaymentId: null,
        providerOrderId: orderId,
        reason: "bad signature",
      };
    }

    return { ok: true, providerPaymentId: paymentId, providerOrderId: orderId };
  },

  /** Must receive the RAW body - re-stringified JSON breaks the HMAC. */
  verifyWebhook(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    const { webhookSecret } = credentials();
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    return timingSafeEqualHex(expected, signature);
  },

  parseWebhook(rawBody: string): ParsedWebhook {
    const body = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            amount?: number;
          };
        };
      };
    };

    const entity = body.payload?.payment?.entity;

    return {
      // Razorpay sends x-razorpay-event-id as a header; the route passes
      // it through when present, otherwise the payment id is stable
      // enough per event type to deduplicate on.
      eventId: `${body.event ?? "unknown"}:${entity?.id ?? "none"}`,
      kind: EVENT_KIND[body.event ?? ""] ?? "unknown",
      providerOrderId: entity?.order_id ?? null,
      providerPaymentId: entity?.id ?? null,
      amountInPaise: entity?.amount ?? null,
    };
  },

  async refund(input): Promise<RefundResult> {
    const { keyId, keySecret } = credentials();
    const { default: Razorpay } = await import("razorpay");
    const client = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const refund = await client.payments.refund(input.providerPaymentId, {
      amount: input.amountInPaise,
      notes: input.reason ? { reason: input.reason } : undefined,
    });

    return {
      providerRefundId: refund.id,
      amountInPaise: Number(refund.amount),
    };
  },
};
