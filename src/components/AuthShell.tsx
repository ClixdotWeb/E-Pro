import Link from "next/link";
import Image from "next/image";

/**
 * Shared frame for /login, /register and /forgot-password.
 *
 * One card, the size of the window less a small margin on all four
 * sides. There is no header and no footer behind it: the page is the
 * card, and the only way out of it is the one link back to the shop,
 * which is the only way out anybody here wants.
 *
 * Inside, the usual split - artwork left, form right. The artwork is
 * drawn rather than photographed: columns of the brand green rising
 * out of a black panel, over a fine weave so the black reads as a
 * material and not a hole. Nothing to load, nothing that goes stale
 * the way a product photo does, and it needs no second asset for the
 * light theme.
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
    <div className="flex min-h-svh bg-surface-0 p-2.5 sm:p-4">
      <div className="flex w-full overflow-hidden rounded-[24px] border border-hairline bg-surface-1 p-2.5 sm:p-3">
        <div className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* ---------------- artwork ---------------- */}
          <aside className="relative hidden overflow-hidden rounded-[18px] bg-black lg:flex lg:flex-col lg:justify-between lg:p-10">
            {/* light leaks: columns of green, blurred, rising */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
            >
              <span
                className="absolute bottom-0 left-[8%] h-full w-[15%] rounded-t-full opacity-90 blur-[34px]"
                style={{
                  background:
                    "linear-gradient(to top, #ffffff 0%, #35e58a 26%, #00a44f 60%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[27%] h-[76%] w-[12%] rounded-t-full opacity-80 blur-[28px]"
                style={{
                  background:
                    "linear-gradient(to top, #d9ffe9 0%, #00c763 45%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[44%] h-[94%] w-[18%] rounded-t-full opacity-70 blur-[40px]"
                style={{
                  background:
                    "linear-gradient(to top, #ffffff 0%, #00a44f 48%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[68%] h-[60%] w-[11%] rounded-t-full opacity-55 blur-[30px]"
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
                className="h-[30px] w-auto"
                priority
              />
            </Link>

            <div className="relative">
              <p className="max-w-[13ch] text-[36px] font-bold leading-[1.05] tracking-tight text-white xl:text-[46px]">
                Cut to the millimetre.
              </p>
              <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-white/60">
                Plotted to order for your exact device. Nothing sits on a
                shelf.
              </p>
            </div>
          </aside>

          {/* ---------------- form ---------------- */}
          <section className="relative flex flex-col px-2 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="flex items-center justify-between gap-4">
              {/* the wordmark lives on the panel, which a phone does
                  not get - so the mark comes back here instead */}
              <Link href="/" aria-label="Epro Gadgets, home" className="lg:hidden">
                <Image
                  src="/brand/Epro_LOGO_LIGHT-01.png"
                  alt="Epro Gadgets"
                  width={2833}
                  height={942}
                  className="h-[26px] w-auto"
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

            <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-10">
              <h1 className="text-[30px] font-bold leading-[1.1] tracking-tight text-text-hi">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-mid">
                  {subtitle}
                </p>
              )}

              <div className="mt-7 border-t border-hairline pt-7">
                {children}
              </div>

              <div className="mt-7 text-center text-[13px] leading-relaxed text-text-mid">
                {footer}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
