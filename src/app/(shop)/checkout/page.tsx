import type { Metadata } from "next";
import { CheckoutView } from "@/components/CheckoutView";
import type { CartLine } from "@/components/CartView";
import { paymentStatus } from "@/lib/payments";
import { optionLabelFor } from "@/lib/catalog-shared";
import { getOffers, getProductBySlug } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Shipping details and payment.",
  robots: { index: false, follow: false },
};

/**
 * Checkout shell.
 *
 * Reads which payment gateway is configured on the server and passes
 * down only a display name and a boolean. The gateway is undecided, so
 * no SDK and no key is referenced anywhere in the rendered tree — the
 * page works the same whether the answer turns out to be Razorpay,
 * Cashfree, PhonePe or something else.
 */
async function demoLines(): Promise<CartLine[]> {
  const offers = await getOffers();
  const picks = offers.filter((o) => o.available && o.imageUrl).slice(0, 2);

  return Promise.all(
    picks.map(async (o, i) => {
      const product = await getProductBySlug(o.productSlug);

      return {
        id: o.id,
        productSlug: o.productSlug,
        productTitle: o.productTitle,
        variantTitle: o.variantTitle,
        optionLabel: product ? optionLabelFor(product) : "Option",
        unitInPaise: o.priceInPaise,
        imageUrl: o.imageUrl,
        quantity: i === 0 ? 1 : 2,
      };
    }),
  );
}

export default async function CheckoutPage() {
  const status = paymentStatus();

  return (
    <div className="page py-8 md:py-10">
      <header className="border-b border-hairline pb-6">
        <p className="kicker">Step 2 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">
          Checkout
        </h1>
      </header>

      <div className="mt-8">
        <CheckoutView
          lines={await demoLines()}
          payment={{ displayName: status.displayName, live: status.live }}
        />
      </div>
    </div>
  );
}
