import Link from "next/link";
import { VideoHero } from "@/components/home/VideoHero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { RealCustomers } from "@/components/home/RealCustomers";
import { BeforeAfter } from "@/components/home/BeforeAfter";

/**
 * Homepage.
 *
 * Section order and content are taken from the live Shopify page's own
 * markup, section by section:
 *
 *   video_banner            -> VideoHero   (70vh rounded video, no text)
 *   custom_liquid           -> CategoryGrid (10 photo tiles, 5 columns)
 *   moving_image_banner     -> RealCustomers
 *   image_comparison        -> BeforeAfter
 *   collapsible_content     -> Faq
 *   newsletter + icon_with_text -> in <Footer>
 *
 * Nothing is added. The finder band that used to sit between the video
 * and the categories is gone: the live page goes straight from one to
 * the other, and a section that is not there is a difference you can
 * see at a glance. The finder itself still lives at /find, linked from
 * the footer, so the shortcut survives without changing this page.
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

/* ---------------- faq ---------------- */

/** Copy lifted from the live `collapsible_content` section. */
const FAQS = [
  {
    q: "How long does your shipping take?",
    a: "Once your order is placed, we strive to process and dispatch it within 1-2 business days. The estimated delivery time may vary depending on your location and the shipping method selected at checkout.",
  },
  {
    q: "Are the skins easy to apply?",
    a: "Yes! Our skins are precision-cut for each specific device model, so there is nothing to trim and nothing to measure. Warming the film with a hairdryer on low helps it settle into curves — that is the only trick worth knowing.",
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
    <section className="page py-16 md:py-20">
      <div className="grid gap-10 md:grid-cols-[minmax(0,340px)_1fr]">
        <header>
          <h2 className="text-2xl font-bold tracking-tight text-text-hi md:text-[28px]">
            Got questions? We&apos;ve got answers!
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">
            If you can&apos;t find the answer you&apos;re looking for,
            don&apos;t hesitate to reach out to our friendly customer support
            team. We&apos;re here to assist you and ensure you have the best
            experience with our products and services.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Contact us
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

      <p className="mt-8 text-center text-[13px] text-text-mid">
        More questions?{" "}
        <Link href="/faq" className="text-accent hover:underline">
          Read the full FAQ
        </Link>
      </p>
    </section>
  );
}
