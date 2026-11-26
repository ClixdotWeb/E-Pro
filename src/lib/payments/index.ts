import { mockProvider } from "./mock";
import { razorpayProvider } from "./razorpay";
import type { PaymentProvider, PaymentProviderId } from "./provider";

export type {
  ClientIntent,
  ClientResult,
  CreateIntentInput,
  ParsedWebhook,
  PaymentEventKind,
  PaymentProvider,
  PaymentProviderId,
  RefundResult,
  VerifiedPayment,
} from "./provider";
export { PaymentNotConfiguredError } from "./provider";

/**
 * Provider registry.
 *
 * Pick one with PAYMENT_PROVIDER in the environment. Defaults to "mock"
 * so the store runs locally with no gateway account; production refuses
 * to start on "mock".
 *
 * Adding a gateway: write the adapter in this folder, add it here, add
 * its id to PaymentProviderId. Nothing else changes.
 */

const REGISTRY: Partial<Record<PaymentProviderId, PaymentProvider>> = {
  razorpay: razorpayProvider,
  mock: mockProvider,
  // cashfree: cashfreeProvider,  <- add when chosen
  // phonepe:  phonepeProvider,
  // stripe:   stripeProvider,
};

/** Gateways we have an adapter for today. */
export const AVAILABLE_PROVIDERS = Object.values(REGISTRY) as PaymentProvider[];

let cached: PaymentProvider | null = null;

export function paymentProvider(): PaymentProvider {
  if (cached) return cached;

  const requested = (process.env.PAYMENT_PROVIDER ?? "mock") as PaymentProviderId;
  const provider = REGISTRY[requested];

  if (!provider) {
    throw new Error(
      `Unknown PAYMENT_PROVIDER "${requested}". ` +
        `Available: ${Object.keys(REGISTRY).join(", ")}`,
    );
  }

  if (process.env.NODE_ENV === "production" && provider.id === "mock") {
    throw new Error(
      "PAYMENT_PROVIDER is \"mock\" in production. Set a real gateway before taking orders.",
    );
  }

  cached = provider;
  return provider;
}

/**
 * Safe for a page or the admin to read: says whether real payments can
 * be taken, without touching any secret.
 */
export function paymentStatus(): {
  id: PaymentProviderId;
  displayName: string;
  /** real money can move - what the shop is allowed to claim */
  live: boolean;
  /** a gateway flow can run at all, test gateway included */
  usable: boolean;
} {
  const requested = (process.env.PAYMENT_PROVIDER ?? "mock") as PaymentProviderId;
  const provider = REGISTRY[requested];

  if (!provider) {
    return {
      id: "mock",
      displayName: "Not configured",
      live: false,
      usable: false,
    };
  }

  // Two different questions, and conflating them meant the test
  // gateway could never be exercised: "live" is what the checkout
  // page is allowed to say about taking money, "usable" is whether
  // there is a gateway to open at all. The mock is usable in
  // development and nowhere else - it throws in production anyway.
  const real = provider.id !== "mock";

  return {
    id: provider.id,
    displayName: provider.displayName,
    live: real && provider.configured,
    usable:
      provider.configured &&
      (real || process.env.NODE_ENV !== "production"),
  };
}
