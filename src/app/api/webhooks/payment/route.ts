import { db } from "@/lib/db";
import { paymentProvider, paymentStatus } from "@/lib/payments";
import { markPaid, markPaymentFailed } from "@/app/payment-actions";

/**
 * The gateway calling us back.
 *
 * This is the authority on whether money moved. The handshake the
 * browser returns at the end of checkout is the fast path - it lets
 * the customer see a confirmation immediately - but a browser that
 * closed, crashed or lost signal never sends it, and the money moved
 * anyway. This arrives regardless.
 *
 * Three rules, and each one is a way this breaks if ignored:
 *
 *  - The signature is checked against the RAW bytes. Parsing the JSON
 *    and re-stringifying it changes them, and the HMAC fails for every
 *    event forever.
 *  - Delivery is at-least-once. The event id goes into WebhookEvent
 *    first, and a duplicate key means we have already handled it.
 *  - Anything that is not a valid signature gets a 401 and no detail.
 *    A verbose error here is a hint about the secret.
 *
 * It always answers 200 once the event is stored, even when our own
 * follow-up work fails: a gateway that gets a 500 retries for hours,
 * and the retry will not fix a bug in our handler. The row is in the
 * table either way, so nothing is lost.
 *
 * One URL for whichever gateway is configured - the path says
 * "payment", not "razorpay", because nothing outside src/lib/payments
 * is allowed to know which one we use.
 */

export const dynamic = "force-dynamic";

/** Razorpay's own event id header, when the gateway sends one. */
const EVENT_ID_HEADERS = ["x-razorpay-event-id", "x-event-id"];
const SIGNATURE_HEADERS = [
  "x-razorpay-signature",
  "x-webhook-signature",
  "x-signature",
];

function pick(headers: Headers, names: string[]): string | null {
  for (const n of names) {
    const v = headers.get(n);
    if (v) return v;
  }
  return null;
}

export async function POST(request: Request) {
  const status = paymentStatus();
  if (!status.usable) {
    return Response.json({ error: "no gateway" }, { status: 503 });
  }

  // Raw, before anything touches it.
  const rawBody = await request.text();
  const signature = pick(request.headers, SIGNATURE_HEADERS);

  const provider = paymentProvider();
  if (!provider.verifyWebhook(rawBody, signature)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = provider.parseWebhook(rawBody);
  } catch {
    // Signed by us but unreadable: say 200 so it is not retried
    // forever, and leave it in the log.
    return Response.json({ ok: true, ignored: "unparseable" });
  }

  // The gateway's own event id when it sends one, since it is unique
  // per delivery; the adapter's composed id otherwise.
  const eventId = pick(request.headers, EVENT_ID_HEADERS) ?? parsed.eventId;

  try {
    await db.webhookEvent.create({
      data: {
        provider: provider.id,
        eventId,
        eventType: parsed.kind,
        payload: JSON.parse(rawBody),
      },
    });
  } catch {
    // Unique([provider, eventId]) - already handled.
    return Response.json({ ok: true, duplicate: true });
  }

  try {
    if (parsed.kind === "payment.captured" && parsed.providerPaymentId) {
      const payment = parsed.providerOrderId
        ? await db.payment.findUnique({
            where: { razorpayOrderId: parsed.providerOrderId },
            select: { order: { select: { orderNumber: true } } },
          })
        : null;

      if (payment) {
        await markPaid({
          orderNumber: payment.order.orderNumber,
          providerOrderId: parsed.providerOrderId,
          providerPaymentId: parsed.providerPaymentId,
          source: "webhook",
        });
      }
    }

    if (parsed.kind === "payment.failed") {
      await markPaymentFailed({
        providerOrderId: parsed.providerOrderId,
        providerPaymentId: parsed.providerPaymentId,
        reason: "reported failed by the gateway",
      });
    }
  } catch (e) {
    // The event is recorded. Retrying will not fix our bug, and a 500
    // makes the gateway hammer this URL for hours.
    console.error("webhook handling failed", eventId, e);
  }

  return Response.json({ ok: true });
}
