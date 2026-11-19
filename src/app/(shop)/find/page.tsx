import Link from "next/link";
import type { Metadata } from "next";
import { SkinFinder } from "@/components/SkinFinder";
import { getOffers, getNavCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Find your skin",
  description:
    "Type your device and add the right skin to your cart on one screen. No category browsing.",
};

export default async function FindPage({
  searchParams,
}: PageProps<"/find">) {
  const sp = await searchParams;
  const [offers, navCategories] = await Promise.all([
    getOffers(),
    getNavCategories(),
  ]);
  const categories = navCategories.filter((c) => c.count > 0);
  const device = typeof sp.device === "string" ? sp.device : undefined;

  return (
    <div className="page grid gap-10 py-12 lg:grid-cols-[1fr_minmax(0,620px)]">
      <div>
        <p className="kicker">One screen, no browsing</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-text-hi">
          Find your skin
          <br />
          <span className="text-accent">in one step.</span>
        </h1>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-mid">
          Type any part of your device — a focal length, a brand, a model
          number — and add it straight to the cart. {offers.length}{" "}
          options across {categories.length} device types.
        </p>

        <div className="mt-8">
          <p className="kicker">Try</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {["24-70", "Sony", "70-200", "Canon", "hp", "Sigma"].map((t) => (
              <li
                key={t}
                className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[12px] text-text-mid"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 border-t border-hairline pt-6">
          <p className="text-[13px] leading-relaxed text-text-mid">
            Model not listed? We template new devices every week.
          </p>
          <Link
            href="/request-model"
            className="mt-3 inline-block text-[13px] font-medium text-accent hover:underline"
          >
            Request a model →
          </Link>
        </div>
      </div>

      <div>
        <SkinFinder
          offers={offers}
          categories={categories}
          initialCategory={device}
        />
      </div>
    </div>
  );
}
