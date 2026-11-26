import Link from "next/link";
import Image from "next/image";

/**
 * Shared frame for /login, /register and /forgot-password.
 *
 * One card, centred, on a field washed with the brand green. It
 * filled the window a moment ago and that was too much of it - a
 * form with five controls stretched to 1600px reads as a page that
 * has lost its contents. Capped at 960 and centred, the same card
 * reads as an object someone placed there.
 *
 * Inside, the usual split: artwork left, form right. The artwork is
 * drawn rather than photographed - columns of the brand green
 * rising out of a black panel, over a fine weave so the black reads
 * as a material and not a hole. Nothing to load, nothing that goes
 * stale the way a product photo does, and no second asset needed
 * for the light theme.
 *
 * There is no header and no footer behind this. The page is the
 * card, and the one way out is the link back to the shop, which is
 * the only way out anybody here wants.
 *
 * Under lg the panel is dropped rather than stacked. It is
 * decoration, and decoration above a password field on a phone is
 * something to scroll past.
 */

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-surface-0 px-4 py-10 sm:px-6">
      {/* the field the card sits on */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 50% 0%, rgba(0,164,79,0.15) 0%, rgba(0,164,79,0.035) 48%, transparent 76%)",
        }}
      />

      <div className="relative w-full max-w-[960px] overflow-hidden rounded-[24px] border border-hairline bg-surface-1 p-2.5 shadow-[var(--shadow-pop)] sm:p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
          {/* ---------------- artwork ---------------- */}
          <aside className="relative hidden overflow-hidden rounded-[18px] bg-black lg:flex lg:min-h-[480px] lg:flex-col lg:justify-between lg:p-8">
            {/* light leaks: columns of green, blurred, rising */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%]"
            >
              <span
                className="absolute bottom-0 left-[8%] h-full w-[16%] rounded-t-full opacity-90 blur-[28px]"
                style={{
                  background:
                    "linear-gradient(to top, #ffffff 0%, #35e58a 26%, #00a44f 60%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[28%] h-[76%] w-[12%] rounded-t-full opacity-80 blur-[24px]"
                style={{
                  background:
                    "linear-gradient(to top, #d9ffe9 0%, #00c763 45%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[45%] h-[94%] w-[18%] rounded-t-full opacity-70 blur-[34px]"
                style={{
                  background:
                    "linear-gradient(to top, #ffffff 0%, #00a44f 48%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[69%] h-[58%] w-[11%] rounded-t-full opacity-55 blur-[26px]"
                style={{
                  background:
                    "linear-gradient(to top, #8bf5bd 0%, #00a44f 55%, transparent 100%)",
                }}
              />
            </span>

            {/* a fine weave, so the black is a material and not a hole */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 3px)",
              }}
            />

            <Link
              href="/"
              aria-label="Epro Gadgets, home"
              className="relative w-fit"
            >
              <Image
                src="/brand/Epro_LOGO_LIGHT-01.png"
                alt="Epro Gadgets"
                width={2833}
                height={942}
                className="h-[26px] w-auto"
                priority
              />
            </Link>

            <div className="relative">
              <p className="max-w-[13ch] text-[32px] font-bold leading-[1.06] tracking-tight text-white">
                Cut to the millimetre.
              </p>
              <p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-white/60">
                Plotted to order for your exact device. Nothing sits on a
                shelf.
              </p>
            </div>
          </aside>

          {/* ---------------- form ---------------- */}
          <section className="flex flex-col px-3 py-6 sm:px-7 lg:px-8 lg:py-7">
            <div className="flex items-center justify-between gap-4">
              {/* the wordmark lives on the panel, which a phone does
                  not get - so it comes back here instead */}
              <Link
                href="/"
                aria-label="Epro Gadgets, home"
                className="lg:hidden"
              >
                <Image
                  src="/brand/Epro_LOGO_LIGHT-01.png"
                  alt="Epro Gadgets"
                  width={2833}
                  height={942}
                  className="h-[24px] w-auto"
                  priority
                />
              </Link>

              <Link
                href="/"
                className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-text-low transition-colors hover:text-text-hi"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                Back to the shop
              </Link>
            </div>

            <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-8">
              <h1 className="text-[27px] font-bold leading-[1.12] tracking-tight text-text-hi">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-[13px] leading-relaxed text-text-mid">
                  {subtitle}
                </p>
              )}

              <div className="mt-6 border-t border-hairline pt-6">
                {children}
              </div>

              <div className="mt-6 text-center text-[13px] leading-relaxed text-text-mid">
                {footer}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
