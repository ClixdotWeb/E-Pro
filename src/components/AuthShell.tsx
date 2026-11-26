import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

/**
 * Shared frame for /login and /register.
 *
 * Rebuilt. The old one was a narrow form in the top-left corner of a
 * page that then ran out of content, with a photograph on the right
 * so dark it read as an empty rectangle and a list of four benefits
 * pushed to the very bottom of it. Three quarters of the screen was
 * black.
 *
 * Now it is a split that fills the viewport: the reason to make an
 * account on the left, the form on the right, both vertically
 * centred so neither leaves a hole under it. The left panel shows
 * the actual product - the skins we photographed - instead of a
 * stock composite at 45% opacity, and the numbers on it are counted
 * from the catalogue rather than typed in, so they cannot go stale
 * as devices are added.
 *
 * On a phone the panel collapses to a single strip above the form.
 * Nobody signing in on a phone needs to be sold the idea first, and
 * four photographs above the fold would push the password field off
 * the screen.
 */

const PANEL_DESIGNS = [
  { src: "/brand/designs/neon-dragon.jpg", alt: "Neon Dragon skin" },
  { src: "/brand/designs/forged-carbon.jpg", alt: "Forged Carbon skin" },
  { src: "/brand/designs/black-honeycomb-back.jpg", alt: "Black Honeycomb skin" },
  { src: "/brand/designs/black-leather.jpg", alt: "Black Leather skin" },
];

const BENEFITS: [string, string][] = [
  ["Reorder in one tap", "Your exact model is remembered."],
  ["Track every parcel", "Order history and AWB in one place."],
  ["GST invoices on demand", "Download them any time."],
  ["First dibs on new cuts", "We template new devices weekly."],
];

/** Counted, not claimed. One cheap indexed count each. */
async function catalogueSize() {
  try {
    const [models, categories] = await Promise.all([
      db.deviceModel.count({ where: { active: true } }),
      db.deviceCategory.count(),
    ]);
    return { models, categories: Math.max(0, categories - 1) };
  } catch {
    // The marketing numbers are not worth a 500 on the sign-in page.
    return null;
  }
}

export async function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const size = await catalogueSize();

  return (
    <div className="grid min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* ---------------- why bother ---------------- */}
      <aside className="relative order-1 overflow-hidden border-b border-hairline bg-surface-1 lg:order-none lg:border-b-0 lg:border-r">
        {/* a wash of colour behind the black, so the panel is not a void */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 top-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.22] blur-[120px]"
          style={{ background: "var(--accent)" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-28 bottom-[-15%] h-[460px] w-[460px] rounded-full opacity-[0.16] blur-[130px]"
          style={{ background: "#3b6ef5" }}
        />

        <div className="relative flex h-full flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16 xl:px-20">
          <h2 className="max-w-[12ch] text-[34px] font-bold leading-[1.05] tracking-tight text-text-hi sm:text-[42px] xl:text-[52px]">
            Cut to the millimetre.
          </h2>

          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-text-mid">
            {size
              ? `Skins plotted to order for ${size.models.toLocaleString("en-IN")} devices across ${size.categories} kinds of gadget. Nothing sits on a shelf.`
              : "Skins plotted to order for your exact device. Nothing sits on a shelf."}
          </p>

          {/* the product, actually visible */}
          <ul
            aria-hidden
            className="mt-9 hidden grid-cols-4 gap-2.5 sm:grid lg:gap-3"
          >
            {PANEL_DESIGNS.map((d, i) => (
              <li
                key={d.src}
                className={`relative aspect-[3/4] overflow-hidden rounded-[14px] border border-hairline ${
                  i % 2 === 0 ? "lg:translate-y-3" : "lg:-translate-y-1"
                }`}
              >
                <Image
                  src={d.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 12vw, 22vw"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"
                />
              </li>
            ))}
          </ul>

          <ul className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:mt-14">
            {BENEFITS.map(([t, b]) => (
              <li key={t} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-accent-soft text-accent"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold text-text-hi">
                    {t}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-mid">
                    {b}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-[48ch] border-t border-hairline pt-6 text-[12.5px] leading-relaxed text-text-low">
            An account is never a wall in front of a purchase — you can{" "}
            <Link href="/cart" className="text-accent hover:underline">
              check out as a guest
            </Link>{" "}
            and make one later.
          </p>
        </div>
      </aside>

      {/* ---------------- the form ---------------- */}
      <main className="order-2 flex items-center justify-center px-6 py-14 sm:px-10 lg:order-none lg:py-16">
        <div className="w-full max-w-[400px]">
          <Link
            href="/"
            aria-label="Epro Gadgets, home"
            className="mb-9 inline-block lg:mb-11"
          >
            <Image
              src="/brand/Epro_LOGO_LIGHT-01.png"
              alt="Epro Gadgets"
              width={132}
              height={34}
              className="h-[30px] w-auto"
              priority
            />
          </Link>

          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            {kicker}
          </p>
          <h1 className="mt-2.5 text-[28px] font-bold leading-[1.15] tracking-tight text-text-hi sm:text-[32px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 text-[14px] leading-relaxed text-text-mid">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t border-hairline pt-6 text-[13px] leading-relaxed text-text-mid">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
