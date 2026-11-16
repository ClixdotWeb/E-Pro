import Link from "next/link";
import { VideoHero } from "@/components/home/VideoHero";
import { RealCustomers } from "@/components/home/RealCustomers";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/realCatalog";

/**
 * Section order mirrors the live Shopify homepage:
 *
 *   video_banner -> custom_liquid (Categories) -> moving_image_banner
 *   ("Real Customers - Real Skins") -> image_comparison ->
 *   collapsible_content (FAQ) -> newsletter + icon_with_text (in Footer)
 *
 * The one addition is the device finder, carried inside the hero, which
 * replaces the old three-page path to a buyable item.
 */

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <CategoryGrid />
      <RealCustomers />
      <BeforeAfter />
      <Faq />
    </>
  );
}

/* ---------------- categories ---------------- */

/** The full device range the store sells, in the theme's tile order. */
const TILE_ORDER = [
  "phone",
  "camera",
  "lens",
  "laptop",
  "gimbal",
  "tablet",
  "gaming-consoles",
  "drone",
  "charger",
  "wireless-earbuds",
];

function CategoryGrid() {
  const liveCounts = new Map(CATEGORIES.map((c) => [c.slug, c.count]));

  return (
    <section className="page py-16 md:py-20">
      <header className="mb-7">
        <p className="kicker">Shop by device</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi md:text-3xl">
          Categories
        </h2>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TILE_ORDER.map((slug) => {
          const count = liveCounts.get(slug) ?? 0;
          const label = CATEGORY_LABEL[slug] ?? slug;

          return (
            <li key={slug}>
              <Link
                href={count > 0 ? `/find?device=${slug}` : "/request-model"}
                className="group flex h-full flex-col justify-between gap-6 rounded-[var(--r-lg)] border border-hairline bg-surface-1 p-4 transition-colors hover:border-accent hover:bg-surface-2"
              >
                <span className="text-text-low transition-colors group-hover:text-accent">
                  <CategoryIcon slug={slug} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-text-hi">
                    {label}
                  </span>
                  {/* Honest counts: most categories have nothing in them yet,
                      and saying "coming soon" beats showing an empty grid. */}
                  <span
                    className={`mt-0.5 block text-[11px] ${
                      count > 0 ? "text-text-low" : "text-accent"
                    }`}
                  >
                    {count > 0 ? `${count} options` : "Request a cut"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------- faq ---------------- */

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 1–2 business days. Metro deliveries usually land in 2–4 days after dispatch, and the rest of India in 4–7. You get a tracking link by email and WhatsApp the moment it ships.",
  },
  {
    q: "Is it hard to apply?",
    a: "No. Every skin is precision-cut for one specific model, so there is no trimming and nothing to measure. Warming the film with a hairdryer on low helps it settle into curves — that is the only trick worth knowing.",
  },
  {
    q: "Will it damage my device or leave residue?",
    a: "The adhesive is a removable automotive-grade layer. It peels off clean even after a couple of years and leaves no residue, which is exactly why resale value holds up.",
  },
  {
    q: "What if my device model isn't listed?",
    a: "Use Request Model. Tell us the exact model and we template and cut it, usually within a week. There is no extra charge for a first cut.",
  },
  {
    q: "Can I return a skin?",
    a: "Unopened skins can be returned within 7 days of delivery. If a skin arrives miscut or lifts within 30 days, we replace it free — just send a photo.",
  },
];

function Faq() {
  return (
    <section className="page pb-20">
      <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <header>
          <p className="kicker">Got questions?</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi md:text-3xl">
            We&apos;ve got answers
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">
            Still stuck? Reach us on WhatsApp — we answer between 10am and 7pm
            IST.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block text-[13px] font-medium text-accent hover:underline"
          >
            Contact us →
          </Link>
        </header>

        <ul className="divide-y divide-hairline border-y border-hairline">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-text-hi marker:content-none">
                  {f.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline text-text-low transition-transform group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-5 pr-10 text-[13px] leading-relaxed text-text-mid">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- icons ---------------- */

const CATEGORY_PATHS: Record<string, string> = {
  phone: "M7 2.5h10a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5zM10 19h4",
  laptop: "M4.5 5.5h15v10h-15zM2 18.5h20l-1.5-3H3.5z",
  camera: "M3 7.5h4L8.5 5h7L17 7.5h4v12H3zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  lens: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM19 6l-3 2",
  tablet: "M5 3h14v18H5zM11 18.5h2",
  gimbal: "M12 3v5M9 8h6v4H9zM12 12v4M7 20h10M12 16l-5 4M12 16l5 4",
  "gaming-consoles": "M7 9h10a5 5 0 0 1 0 10H7a5 5 0 0 1 0-10zM9 12v4M7 14h4M15.5 13.5h.01M17.5 15.5h.01M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3",
  drone: "M9 9h6v6H9zM9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4M5 5a2 2 0 1 0-.01-.01M19 5a2 2 0 1 0-.01-.01M5 19a2 2 0 1 0-.01-.01M19 19a2 2 0 1 0-.01-.01",
  "wireless-earbuds": "M8 4a4 4 0 0 1 4 4v6a3 3 0 0 1-6 0V9M16 4a4 4 0 0 0-4 4v6a3 3 0 0 0 6 0V9",
  charger: "M9 2v4M15 2v4M7 6h10v6a5 5 0 0 1-10 0zM12 17v5",
};

function CategoryIcon({ slug }: { slug: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={CATEGORY_PATHS[slug] ?? CATEGORY_PATHS.phone} />
    </svg>
  );
}
