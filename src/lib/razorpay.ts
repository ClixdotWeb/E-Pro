import crypto from "node:crypto";
import Razorpay from "razorpay";
import { serverEnv } from "./env";

let client: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (client) return client;
  const env = serverEnv();
  client = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  return client;
}

/**
 * Verifies the handshake the browser sends back after Checkout closes.
 * This proves the payment ids came from Razorpay and not from a user
 * editing JS in devtools. Timing-safe to avoid byte-by-byte probing.
 */
export function verifyCheckoutSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const { RAZORPAY_KEY_SECRET } = serverEnv();
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  return timingSafeEqualHex(expected, params.signature);
}

/**
 * Verifies a webhook POST. Must be run against the RAW request body —
 * JSON.parse + re-stringify changes bytes and breaks the HMAC.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const { RAZORPAY_WEBHOOK_SECRET } = serverEnv();
  const expected = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
