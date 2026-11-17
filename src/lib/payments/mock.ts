import crypto from "node:crypto";
import type {
  ClientIntent,
  ClientResult,
  CreateIntentInput,
  ParsedWebhook,
  PaymentProvider,
  RefundResult,
  VerifiedPayment,
} from "./provider";

/**
 * A provider that needs no gateway account.
 *
 * The real gateway is undecided, and waiting on that decision would block
 * everything downstream of it: the cart, the order lifecycle, invoices,
 * the admin's order list. This provider lets all of that be built and
 * tested end to end now, against a real database, and then be swapped
 * for the real thing by changing one env var.
 *
 * It signs its handshake with a local secret, so the verification path -
 * the part most likely to hide a security bug - is exercised for real
 * rather than stubbed out to `return true`.
 *
 * Refuses to load when NODE_ENV === "production".
 */

const DEV_SECRET =
  process.env.MOCK_PAYMENT_SECRET ?? "mock-gateway-secret-not-for-production";

function sign(payload: string): string {
  return crypto.createHmac("sha256", DEV_SECRET).update(payload).digest("hex");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export const mockProvider: PaymentProvider = {
  id: "mock",
  displayName: "Test gateway (no account needed)",
  configured: process.env.NODE_ENV !== "production",

  async createIntent(input: CreateIntentInput): Promise<ClientIntent> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The mock payment provider must never run in production");
    }

    return {
      provider: "mock",
      providerOrderId: `mock_order_${input.orderNumber}_${crypto.randomUUID().slice(0, 8)}`,
      amountInPaise: input.amountInPaise,
      currency: "INR",
      publicKey: "mock_public_key",
    };
  },

  async verifyClientResult(result: ClientResult): Promise<VerifiedPayment> {
    const orderId = result.providerOrderId;
    const paymentId = result.providerPaymentId;
    const signature = result.signature;

    if (!orderId || !paymentId || !signature) {
      return { ok: false, providerPaymentId: null, reason: "missing fields" };
    }

    const expected = sign(`${orderId}|${paymentId}`);
    if (!timingSafeEqualHex(expected, signature)) {
      return { ok: false, providerPaymentId: null, reason: "bad signature" };
    }

    return { ok: true, providerPaymentId: paymentId };
  },

  verifyWebhook(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    return timingSafeEqualHex(sign(rawBody), signature);
  },

  parseWebhook(rawBody: string): ParsedWebhook {
    const body = JSON.parse(rawBody) as {
      id?: string;
      event?: string;
      orderId?: string;
      paymentId?: string;
      amountInPaise?: number;
    };

    return {
      eventId: body.id ?? crypto.randomUUID(),
      kind:
        body.event === "payment.captured" || body.event === "payment.failed"
          ? body.event
          : "unknown",
      providerOrderId: body.orderId ?? null,
      providerPaymentId: body.paymentId ?? null,
      amountInPaise: body.amountInPaise ?? null,
    };
  },

  async refund(input): Promise<RefundResult> {
    return {
      providerRefundId: `mock_refund_${crypto.randomUUID().slice(0, 8)}`,
      amountInPaise: input.amountInPaise,
    };
  },
};

/**
 * Helper the dev-only "pretend to pay" button calls to produce a valid
 * handshake. Server-side only - exported so a test or a dev route can
 * simulate a successful payment without a gateway.
 */
export function mockSignHandshake(orderId: string, paymentId: string): string {
  return sign(`${orderId}|${paymentId}`);
}
