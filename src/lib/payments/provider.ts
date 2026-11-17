import type { Paise } from "../money";

/**
 * Gateway-agnostic payment contract.
 *
 * The gateway is not chosen yet, so nothing outside `src/lib/payments/`
 * is allowed to know which one we use. Routes, pages and the admin talk
 * to this interface only; swapping Razorpay for Cashfree, PhonePe or
 * Stripe means adding one file in this folder and changing one env var.
 *
 * Rules that hold for every provider:
 *
 *  - Amounts are integer paise. Never a float, never rupees.
 *  - The amount charged is read from our own order row, never from the
 *    browser. A client that can name its own price can pay ₹1.
 *  - Webhook signatures are verified against the RAW request body.
 *    JSON.parse + JSON.stringify changes bytes and breaks the HMAC.
 *  - Webhook delivery is at-least-once, so `eventId` is the idempotency
 *    key and goes in the WebhookEvent table before anything is applied.
 */

/** What the browser needs to open the gateway's checkout UI. */
export type ClientIntent = {
  /** which provider produced this, so the client loads the right SDK */
  provider: PaymentProviderId;
  /** the gateway's own order/session id */
  providerOrderId: string;
  amountInPaise: Paise;
  currency: "INR";
  /** publishable key or equivalent - safe to expose */
  publicKey?: string;
  /** hosted-page providers return a URL to redirect to instead */
  redirectUrl?: string;
};

export type CreateIntentInput = {
  /** our order id, used as the gateway's receipt/reference */
  orderId: string;
  orderNumber: string;
  amountInPaise: Paise;
  customer: {
    email: string;
    name?: string | null;
    phone?: string | null;
  };
};

/** Result the browser hands back after the gateway's UI closes. */
export type ClientResult = Record<string, string>;

export type VerifiedPayment = {
  ok: boolean;
  providerPaymentId: string | null;
  /** present when ok === false */
  reason?: string;
};

export type PaymentEventKind =
  | "payment.captured"
  | "payment.failed"
  | "refund.processed"
  | "unknown";

export type ParsedWebhook = {
  /** provider's unique event id - the idempotency key */
  eventId: string;
  kind: PaymentEventKind;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  amountInPaise: Paise | null;
};

export type RefundResult = {
  providerRefundId: string;
  amountInPaise: Paise;
};

export type PaymentProviderId =
  | "razorpay"
  | "cashfree"
  | "phonepe"
  | "stripe"
  | "mock";

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  readonly displayName: string;
  /** false when the provider needs credentials we do not have yet */
  readonly configured: boolean;

  createIntent(input: CreateIntentInput): Promise<ClientIntent>;

  /** verify the signed handshake the browser returns */
  verifyClientResult(result: ClientResult): Promise<VerifiedPayment>;

  /** verify a webhook against the raw body bytes */
  verifyWebhook(rawBody: string, signature: string | null): boolean;

  parseWebhook(rawBody: string): ParsedWebhook;

  refund(input: {
    providerPaymentId: string;
    amountInPaise: Paise;
    reason?: string;
  }): Promise<RefundResult>;
}

/** Thrown when an operation is attempted on a provider with no credentials. */
export class PaymentNotConfiguredError extends Error {
  constructor(provider: string, missing: string[]) {
    super(
      `Payment provider "${provider}" is not configured. Missing: ${missing.join(", ")}`,
    );
    this.name = "PaymentNotConfiguredError";
  }
}
