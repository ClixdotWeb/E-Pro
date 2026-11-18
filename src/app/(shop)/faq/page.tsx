import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Application, durability, shipping, returns and sizing — answered.",
};

/**
 * Full FAQ.
 *
 * The homepage carries five questions; this is the rest, grouped so
 * someone can scan to their section. Rendered as <details> so it works
 * without JavaScript and is searchable by the browser's own find.
 *
 * The answers are deliberately specific — "2–4 days to metros" rather
 * than "fast shipping" — because vague answers generate the support
 * messages an FAQ exists to prevent.
 */

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Applying your skin",
    items: [
      {
        q: "Is it hard to apply?",
        a: "No. Every skin is precision-cut for one specific model, so there is nothing to trim and nothing to measure. Clean the device with the supplied wipe, line up one edge, and lay the rest down slowly. Warming the film with a hairdryer on low helps it settle into curves — that is the only trick worth knowing.",
      },
      {
        q: "What if I get a bubble?",
        a: "Lift that corner and lay it down again. The adhesive is designed to be repositioned several times while you are applying it, so a bubble is not a ruined skin. Push stubborn ones towards the nearest edge with a thumb.",
      },
      {
        q: "How long does it take?",
        a: "Five to ten minutes for a phone or lens, a bit longer for a laptop lid. Do it on a clean table, not on a bed — dust is the only real enemy.",
      },
      {
        q: "Can I take it off and put it back on?",
        a: "Within the first few days, yes. After that the adhesive has fully keyed to the surface and a removed skin will not go back down flat. Plan to apply it once.",
      },
    ],
  },
  {
    title: "Durability and your device",
    items: [
      {
        q: "Will it damage my device or leave residue?",
        a: "The adhesive is a removable automotive-grade layer. It peels off clean even after a couple of years and leaves no residue, which is exactly why resale value holds up.",
      },
      {
        q: "How long does a skin last?",
        a: "Two to three years of daily use before the finish starts to look tired. Corners and the areas your fingers rest on go first, as you would expect.",
      },
      {
        q: "Is it waterproof?",
        a: "The film itself is. It is not a seal though — it does not make a device water-resistant, and it does not cover ports.",
      },
      {
        q: "Does it protect against drops?",
        a: "No, and we will not pretend otherwise. A 0.2 mm film cannot absorb impact. It takes scratches, scuffs and desk rash, which is what actually happens to most devices. If you drop your gear regularly, use a case.",
      },
      {
        q: "Will it interfere with wireless charging?",
        a: "No. The film is thin enough that Qi charging works normally through it.",
      },
    ],
  },
  {
    title: "Choosing the right one",
    items: [
      {
        q: "What if my device model isn't listed?",
        a: "Use Request Model. Tell us the exact model and we template and cut it, usually within a week. There is no extra charge for a first cut, and once cut it joins the catalogue for everyone.",
      },
      {
        q: "Does storage size or colour matter?",
        a: "Storage size almost never does. Camera layout does, so a Pro and a non-Pro of the same generation are different cuts. If you are unsure, send us a photo of the back of the device.",
      },
      {
        q: "I ordered the wrong model. Can I swap it?",
        a: "If it is unopened, yes — within 7 days. Once the backing is off, a skin cut for the wrong model is scrap and cannot be resold, so we cannot take it back.",
      },
    ],
  },
  {
    title: "Shipping and returns",
    items: [
      {
        q: "How long does shipping take?",
        a: "Orders are processed within 1–2 business days. Metro deliveries usually land in 2–4 days after dispatch, and the rest of India in 4–7. You get a tracking link by email and WhatsApp the moment it ships.",
      },
      {
        q: "Do you ship outside India?",
        a: "Not yet. Everything ships from one workshop in Kerala and we only have domestic rates that make sense right now.",
      },
      {
        q: "Can I return a skin?",
        a: "Unopened skins can be returned within 7 days of delivery. If a skin arrives miscut or lifts within 30 days, we replace it free — just send a photo.",
      },
      {
        q: "Do you give GST invoices?",
        a: "Yes. Every order gets a GST-compliant invoice, and you can download it from your account at any time. Prices shown on the site already include GST.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="page max-w-3xl py-12">
      <p className="kicker">Got questions?</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-text-hi">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-text-mid">
        If the answer is not here, message us on WhatsApp between 10am and
        7pm IST — the person who replies is usually the person who cut the
        skin.
      </p>

      <nav aria-label="Sections" className="mt-7 flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <a
            key={g.title}
            href={`#${slug(g.title)}`}
            className="rounded-full border border-hairline px-3.5 py-1.5 text-[12px] text-text-mid transition-colors hover:border-accent hover:text-accent"
          >
            {g.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-12">
        {GROUPS.map((g) => (
          <section key={g.title} id={slug(g.title)} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight text-text-hi">
              {g.title}
            </h2>

            <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
              {g.items.map((f) => (
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
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-8 text-center">
        <h2 className="text-lg font-semibold text-text-hi">
          Still not answered?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-text-mid">
          Send us the device model and what you are trying to do. We answer
          between 10am and 7pm IST.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Contact us
          </Link>
          <Link
            href="/how-to-apply"
            className="rounded-[var(--r-md)] border border-hairline px-5 py-2.5 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
          >
            Application guide
          </Link>
        </div>
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
