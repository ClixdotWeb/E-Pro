import type { ClientIntent } from "@/lib/payments/provider";
import { simulateTestPayment } from "@/app/payment-actions";

/**
 * Opening the gateway's own checkout, in the browser.
 *
 * The one piece that has to know which gateway it is talking to,
 * because each ships its own script. It is kept to this file and
 * driven off `intent.provider`, so the rest of checkout stays as
 * ignorant as the server side is.
 *
 * Hosted-page gateways return a URL instead of a script; those just
 * navigate. Razorpay opens a modal over our page and hands back a
 * signed result, which goes straight to the server to be checked -
 * nothing here decides a payment succeeded.
 */

type GatewayOutcome =
  | { status: "paid"; result: Record<string, string> }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (r: Record<string, string>) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, cb: (e: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPTS: Partial<Record<ClientIntent["provider"], string>> = {
  razorpay: "https://checkout.razorpay.com/v1/checkout.js",
};

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      resolve(true);
      return;
    }

    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

export async function openGateway(
  intent: ClientIntent,
  customer: { name?: string; email?: string; phone?: string },
): Promise<GatewayOutcome> {
  // A gateway that hosts its own page: nothing to load, just go.
  if (intent.redirectUrl) {
    window.location.href = intent.redirectUrl;
    return { status: "dismissed" };
  }

  // The test gateway has no UI. It asks, then has the server sign a
  // handshake, so everything downstream of this - verification,
  // marking paid, the event trail - runs exactly as it will with a
  // real gateway.
  if (intent.provider === "mock") {
    const go = window.confirm(
      `Test gateway: pay ₹${(intent.amountInPaise / 100).toLocaleString("en-IN")}?

No money moves. Cancel to leave the order unpaid.`,
    );
    if (!go) return { status: "dismissed" };

    const result = await simulateTestPayment(intent.providerOrderId);
    if (!result)
      return { status: "failed", message: "The test gateway refused." };

    return { status: "paid", result };
  }

  const src = SCRIPTS[intent.provider];
  if (!src)
    return {
      status: "failed",
      message: "This payment method is not supported in the browser yet.",
    };

  const loaded = await loadScript(src);
  if (!loaded || !window.Razorpay)
    return {
      status: "failed",
      message:
        "Could not reach the payment gateway. Check your connection and try again.",
    };

  return new Promise<GatewayOutcome>((resolve) => {
    let settled = false;
    const once = (outcome: GatewayOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const checkout = new window.Razorpay!({
      key: intent.publicKey ?? "",
      amount: intent.amountInPaise,
      currency: intent.currency,
      order_id: intent.providerOrderId,
      name: "Epro Gadgets",
      description: "Precision-cut device skins",
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: "#00a44f" },
      handler: (result) => once({ status: "paid", result }),
      modal: { ondismiss: () => once({ status: "dismissed" }) },
    });

    checkout.on("payment.failed", (e) => {
      const description =
        e &&
        typeof e === "object" &&
        "error" in e &&
        e.error &&
        typeof e.error === "object" &&
        "description" in e.error
          ? String((e.error as { description?: unknown }).description ?? "")
          : "";
      once({
        status: "failed",
        message: description || "The payment did not go through.",
      });
    });

    checkout.open();
  });
}
