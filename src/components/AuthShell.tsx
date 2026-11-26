import Image from "next/image";

/**
 * Shared frame for /login, /register and /forgot-password.
 *
 * A single card floating on a tinted field, split in two: artwork on
 * the left, the form on the right. The card is the whole page - there
 * is no second screenful under it to scroll to, which is what was
 * wrong with both of the versions before this one.
 *
 * The artwork is drawn, not photographed. Four blurred columns of
 * the brand green rising out of the bottom of a black panel: it
 * costs nothing to load, it cannot go stale the way a product photo
 * does, and it carries the colour that makes the page ours. The
 * headline on it is the only argument made anywhere here, and it is
 * about the product rather than about signing up.
 *
 * On anything narrower than lg the panel is dropped rather than
 * stacked. It is decoration, and decoration above a password field
 * on a phone is just something to scroll past.
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
    <div className="relative flex justify-center px-4 py-10 sm:px-6 md:py-16">
      {/* the field the card sits on - brand green, almost black */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(0,164,79,0.16) 0%, rgba(0,164,79,0.04) 45%, transparent 75%)",
        }}
      />

      <div className="relative w-full max-w-[980px] overflow-hidden rounded-[28px] border border-hairline bg-surface-1 p-3 shadow-[var(--shadow-pop)] sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
          {/* ---------------- artwork ---------------- */}
          <aside
            aria-hidden
            className="relative hidden overflow-hidden rounded-[22px] bg-black lg:block"
          >
            {/* light leaks: four columns of green, blurred, rising */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]">
              <span
                className="absolute bottom-0 left-[6%] h-full w-[16%] rounded-t-full opacity-90 blur-[26px]"
                style={{
                  background:
                    "linear-gradient(to top, #ffffff 0%, #35e58a 28%, #00a44f 62%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[26%] h-[78%] w-[13%] rounded-t-full opacity-80 blur-[22px]"
                style={{
                  background:
                    "linear-gradient(to top, #d9ffe9 0%, #00c763 45%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[44%] h-[92%] w-[18%] rounded-t-full opacity-70 blur-[30px]"
                style={{
                  background:
                    "linear-gradient(to top, #ffffff 0%, #00a44f 50%, transparent 100%)",
                }}
              />
              <span
                className="absolute bottom-0 left-[66%] h-[58%] w-[11%] rounded-t-full opacity-60 blur-[24px]"
                style={{
                  background:
                    "linear-gradient(to top, #8bf5bd 0%, #00a44f 55%, transparent 100%)",
                }}
              />
            </span>

            {/* a fine weave, so the black is a material and not a hole */}
            <span
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 3px)",
              }}
            />

            <div className="relative flex h-full min-h-[380px] flex-col p-8">
              <p className="max-w-[14ch] text-[30px] font-bold leading-[1.1] tracking-tight text-white xl:text-[34px]">
                Cut to the millimetre.
              </p>
              <p className="mt-3 max-w-[26ch] text-[13px] leading-relaxed text-white/55">
                Plotted to order for your exact device.
              </p>
            </div>
          </aside>

          {/* ---------------- form ---------------- */}
          <main className="flex flex-col justify-center px-2 py-8 sm:px-6 lg:px-8 lg:py-10">
            <Image
              src="/brand/Epro_gadgets_Favicon_image.png"
              alt=""
              width={44}
              height={44}
              className="h-10 w-10 rounded-[10px]"
              aria-hidden
            />

            <h1 className="mt-6 text-[30px] font-bold leading-[1.1] tracking-tight text-text-hi">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-mid">
                {subtitle}
              </p>
            )}

            <div className="mt-7 border-t border-hairline pt-7">{children}</div>

            <div className="mt-7 text-center text-[13px] leading-relaxed text-text-mid">
              {footer}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
