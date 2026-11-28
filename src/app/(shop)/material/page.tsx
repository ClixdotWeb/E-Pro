import Link from "next/link";
import type { Metadata } from "next";
import { whatsappGeneral } from "@/lib/whatsapp";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Material",
  description:
    "We manufacture exclusively with authentic 3M automotive-grade cast vinyl. Micro-textured tactile surfaces, zero-residue air-release adhesive, and millimeter-precise device wraps.",
};

/**
 * Material page, rebuilt from the live page at /pages/request-a-skin
 * (which is what the "Material" nav item points to on the real site -
 * not /pages/material, which 404s).
 *
 * Section order and every string are the store's own:
 *
 *   hero          badge, two-line h1, lede, two buttons, a 4-up stat bar
 *   3M difference badge + one large centred paragraph
 *   finishes      badge, h2, sub, six cards in three columns
 *   why 3M vinyl  badge, h2, sub, three cards
 *   commitment    two columns - copy, tick list and a WhatsApp button
 *                 on the left, a five-item accordion on the right
 *
 * The finish cards link to the store's own filtered collection URLs
 * (?filter.p.m.custom.finish=...). Those are Shopify metafield filters
 * our catalogue does not carry. They pointed at /collections/<finish>
 * instead, and every one of those was a 404 - no product is sold as
 * "Embossed" or "Texture", here or on the live store. Until the
 * designs exist there is nothing to filter, so each card sends the
 * reader to pick a device, which is the question that has to be
 * answered before any of these finishes can be cut.
 *
 * This replaces a page that used the generic ContentPage template with
 * copy I had written.
 */

/* ---------------- hero ---------------- */

const STATS: { value: string; unit: string; label: string }[] = [
  { value: "0.22", unit: "mm", label: "Ultra-Thin Profile" },
  { value: "100", unit: "%", label: "Genuine 3M Vinyl" },
  { value: "0", unit: "Residue", label: "Clean Removal" },
  { value: "0.1", unit: "mm", label: "Laser Tolerance" },
];

/* ---------------- finishes ---------------- */

type Finish = {
  tag: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
};

const FINISHES: Finish[] = [
  {
    tag: "Tactile 3D",
    kicker: "Premium",
    title: "Embossed 3D Series",
    body: "Deep physical grooves and topographical patterns with unmistakable depth you can feel with every touch.",
    cta: "Explore Embossed",
    href: "/skins/phone",
    icon: (
      <path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
    ),
  },
  {
    tag: "Carbon Weave",
    kicker: "High Grip",
    title: "Forged & Carbon Fiber",
    body: "Hyper-realistic woven twill pattern with light-shifting carbon fibers and outstanding abrasion defense.",
    cta: "Explore Carbon",
    href: "/skins/phone",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    tag: "Anti-Fingerprint",
    kicker: "Minimalist",
    title: "Premium Matte Series",
    body: "Ultra-soft, non-reflective finish that completely eliminates smudges, fingerprints, and glare.",
    cta: "Explore Matte",
    href: "/skins/phone",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
      </>
    ),
  },
  {
    tag: "Leather Grain",
    kicker: "Luxury",
    title: "Artisan Leather Series",
    body: "Authentic natural pebble texture providing premium handheld ergonomics and elegant executive style.",
    cta: "Explore Leather",
    href: "/skins/phone",
    icon: <path d="M12 2.5l8 3.2v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6l8-3.2z" />,
  },
  {
    tag: "Monochrome",
    kicker: "Clean",
    title: "Solid Colors & Pastels",
    body: "Deep, rich, uniform color saturation designed for those who appreciate clean, distraction-free aesthetics.",
    cta: "Explore Solid",
    href: "/skins/phone",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),
  },
  {
    tag: "High Definition",
    kicker: "Vibrant",
    title: "Graphic & Pattern Series",
    body: "Custom cyber-grid, camouflage, and abstract illustrations sealed under scratch-proof UV protective laminate.",
    cta: "Explore Patterns",
    href: "/skins/phone",
    icon: (
      <path d="M12 2.5l2.2 5.9 5.9 2.2-5.9 2.2L12 18.7l-2.2-5.9L3.9 10.6l5.9-2.2L12 2.5z" />
    ),
  },
];

/* ---------------- why 3M ---------------- */

const WHY: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: "0.22mm Ultra-Thin Profile",
    body: "Ultra-thin cast vinyl preserves your device's original pocket-friendly slimness and wireless charging capability with zero bulk.",
    icon: (
      <path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3L12 2.5zM3.5 7.3L12 12l8.5-4.7M12 12v9.5" />
    ),
  },
  {
    title: "Micro Air-Release Honeycomb",
    body: "Microscopic air channels integrated into the 3M adhesive layer let trapped air slide out effortlessly for 100% bubble-free installation.",
    icon: (
      <path d="M12 2.5l2.2 5.9 5.9 2.2-5.9 2.2L12 18.7l-2.2-5.9L3.9 10.6l5.9-2.2L12 2.5z" />
    ),
  },
  {
    title: "Residue-Free Clean Removal",
    body: "Patented pressure-sensitive adhesive holds firm through years of use, yet removes completely clean whenever you want to switch styles.",
    icon: (
      <>
        <path d="M12 2.5l8 3.2v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6l8-3.2z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

/* ---------------- commitment ---------------- */

const TICKS = [
  "100% Authentic 3M Cast Vinyl Exclusively",
  "Zero Sticky Residue When Removing",
  "Express Pan-India Safe Delivery",
];

const COMMITMENTS: { q: string; a: string }[] = [
  {
    q: "Authentic 3M Cast Vinyl (No Cheap Films)",
    a: "Unlike inexpensive calendered vinyl that shrinks, curls, and discolors under sunlight, authentic 3M cast vinyl is dimensionally stable and engineered specifically to endure friction, heat, and active device handling.",
  },
  {
    q: "Microscopic Honeycomb Air Release Channels",
    a: "Microscopic laser-cut air channels embedded directly into the adhesive layer allow trapped air bubbles to glide out with gentle thumb pressure during application, ensuring a smooth, seamless fit every time.",
  },
  {
    q: "Thermal Contouring for Curved Glass & Chamfers",
    a: "Heat-responsive polymer properties allow edges and 3D corners to soften slightly with a hair dryer, wrapping tightly around camera bezels, radius curves, and edges without lifting or peeling.",
  },
  {
    q: "Multi-Layer Scratch & Pocket-Wear Shield",
    a: "Engineered with a tough protective top layer that repels keys, coins, dust abrasions, and fingernail scratches while maintaining high-definition visual texture and rich contrast.",
  },
  {
    q: "100% Clean Peel Guarantee with Zero Residue",
    a: "Our pressure-sensitive adhesive bonds firmly to metal, glass, and matte polycarbonate surfaces, but releases cleanly anytime. Zero glue marks, zero sticky grime, and zero damage to original device finishes.",
  },
];

/* ================= page ================= */

export default async function MaterialPage() {
  const settings = await getSettings();
  const WHATSAPP = whatsappGeneral(
    "your materials",
    settings["contact.whatsapp"],
  );

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="page py-16 text-center md:py-24">
        <Badge>100% Genuine 3M Materials</Badge>

        <h1 className="mx-auto mt-7 max-w-4xl text-[34px] font-bold leading-[1.1] tracking-tight text-text-hi md:text-[56px]">
          Mastery in Every Micron.
          <br />
          Pure 3M Material Engineering.
        </h1>

        <p className="mx-auto mt-7 max-w-3xl text-[15px] leading-relaxed text-text-mid md:text-base">
          We manufacture exclusively with authentic 3M automotive-grade cast
          vinyl. Micro-textured tactile surfaces, zero-residue air-release
          adhesive, and millimeter-precise device wraps designed to outlast
          daily wear without adding bulk.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/collections"
            className="inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
            style={{ boxShadow: "0 0 28px rgba(0,164,79,0.4)" }}
          >
            Explore All Skins
            <Arrow />
          </Link>
          <Link
            href="/request-model"
            className="inline-flex h-12 items-center rounded-full bg-surface-2 px-7 text-sm font-bold text-text-hi transition-colors hover:bg-surface-3"
          >
            Request Custom Model
          </Link>
        </div>

        {/* stat bar */}
        <div className="mx-auto mt-12 w-full max-w-3xl rounded-2xl bg-surface-1 px-4 py-6">
          <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={
                  i > 0 ? "md:border-l md:border-hairline" : undefined
                }
              >
                <dt className="text-[26px] font-bold leading-none text-accent">
                  {s.value}
                  <span className="ml-0.5 text-[13px] font-semibold">
                    {s.unit}
                  </span>
                </dt>
                <dd className="mt-2 text-[12px] text-text-mid">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- the 3M difference ---------- */}
      <section className="page border-t border-hairline py-16 text-center md:py-24">
        <Badge>The 3M Difference</Badge>

        <p className="mx-auto mt-9 max-w-4xl text-[22px] font-medium leading-[1.5] tracking-tight text-text-hi md:text-[34px]">
          We believe a great skin should feel like an integral part of your{" "}
          <span className="text-accent">hardware,</span> not a cheap sticker.
          Every millimeter of our material is engineered for effortless
          bubble-free application, superior tactile grip, and 100%
          residue-free clean removal.
        </p>
      </section>

      {/* ---------- material finishes ---------- */}
      <section className="page py-16 text-center md:py-24">
        <Badge>Material Finishes</Badge>

        <h2 className="mt-7 text-[30px] font-bold tracking-tight text-text-hi md:text-[44px]">
          Curated Textures for Every Device
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-text-mid">
          Engineered with authentic micro-textures that resist fingerprints,
          enhance palm grip, and protect from scratches.
        </p>

        <ul className="mt-12 grid gap-5 text-left md:grid-cols-2 lg:grid-cols-3">
          {FINISHES.map((f) => (
            <li
              key={f.title}
              className="flex flex-col rounded-2xl border border-hairline bg-surface-1 p-6 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-accent/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-accent">
                  {f.tag}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-low">
                  {f.kicker}
                </span>
              </div>

              <IconBox>{f.icon}</IconBox>

              <h3 className="mt-5 text-[17px] font-bold text-text-hi">
                {f.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-text-mid">
                {f.body}
              </p>

              <Link
                href={f.href}
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-accent hover:underline"
              >
                {f.cta}
                <Arrow size={14} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- why 3M vinyl ---------- */}
      <section className="page py-16 text-center md:py-24">
        <Badge>Why 3M Vinyl</Badge>

        <h2 className="mx-auto mt-7 max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-text-hi md:text-[44px]">
          Built for Longevity &amp; Flawless Protection
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-text-mid">
          Engineered down to 0.1mm tolerances using premium materials for an
          exact fit and simple application.
        </p>

        <ul className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {WHY.map((w) => (
            <li
              key={w.title}
              className="rounded-2xl border border-hairline bg-surface-1 p-6"
            >
              <IconBox>{w.icon}</IconBox>
              <h3 className="mt-5 text-[17px] font-bold text-text-hi">
                {w.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-text-mid">
                {w.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- quality commitment ---------- */}
      <section className="page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Badge>Quality Commitment</Badge>

            <h2 className="mt-7 text-[30px] font-bold leading-tight tracking-tight text-text-hi md:text-[40px]">
              Tested on Real Hardware.
              <br />
              Backed by Epro Guarantee.
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-text-mid">
              We don&apos;t use 3D rendering guesses. Every wrap in our catalog
              is precision-mapped on actual retail devices. If you ever have a
              question about materials, textures, or installation, our
              Kerala-based team is just a WhatsApp message away.
            </p>

            <ul className="mt-8 space-y-3.5">
              {TICKS.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span aria-hidden className="shrink-0 text-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-semibold text-text-hi">
                    {t}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-9 inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
              style={{ boxShadow: "0 0 28px rgba(0,164,79,0.35)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.17c-.25.69-1.44 1.32-1.99 1.37-.53.05-.53.43-3.34-.86-2.81-1.29-4.52-4.3-4.65-4.5-.14-.2-1.11-1.53-1.11-2.92s.72-2.07.98-2.35c.25-.28.55-.35.73-.35h.53c.17 0 .4-.06.63.48.23.55.79 1.9.86 2.04.07.14.11.3.02.49-.09.19-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.89 1.04.93 1.92 1.21 2.2 1.35.28.14.44.12.6-.07.17-.19.69-.8.88-1.08.19-.28.37-.23.63-.14.25.09 1.6.76 1.88.9.27.14.45.21.52.32.07.12.07.67-.19 1.37z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* accordion */}
          <div className="flex flex-col gap-3.5">
            {COMMITMENTS.map((c, i) => (
              <details
                key={c.q}
                name="material-commitment"
                open={i === 0}
                className="group rounded-xl border border-hairline bg-surface-1 p-5 open:border-accent/45 open:bg-accent-soft/20"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3.5 marker:content-none">
                  <span
                    aria-hidden
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/20 text-accent"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>

                  <h3 className="flex-1 text-[14px] font-bold leading-snug text-text-hi">
                    {c.q}
                  </h3>

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                    className="shrink-0 text-text-low transition-transform group-open:rotate-180"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.7071 9.00421L18.2929 7.59L12 13.8829L5.70712 7.59L4.29291 9.00421L12 16.7113L19.7071 9.00421Z"
                    />
                  </svg>
                </summary>

                <p className="mt-4 pl-[42px] text-[13px] leading-relaxed text-text-mid">
                  {c.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- shared bits ---------------- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/45 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-6 grid h-12 w-12 place-items-center rounded-xl border border-accent/35 text-accent">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </span>
  );
}

function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
