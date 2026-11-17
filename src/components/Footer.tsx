import Link from "next/link";
import Image from "next/image";
import { IconWithText } from "./IconWithText";

/**
 * Footer, from the live `footer` section.
 *
 * It is three columns, not the four link columns that were here:
 *
 *   left   logo, the store's tagline, Instagram + YouTube
 *   middle "Help & Support" - the only link column on the real site
 *   right  "Stay in touch" - the email capture
 *
 * then the copyright, a rule, and a centred "Back to top".
 *
 * The four assurance cards sit ABOVE the footer as their own section
 * (`icon_with_text` is in the footer group but is a separate section),
 * and the newsletter banner is above that again, on the page itself.
 *
 * The social handles and policy URLs are the store's real ones, taken
 * from the markup rather than guessed.
 */

const HELP = [
  { label: "Return and exchange policy", href: "/policies/returns" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Service", href: "/policies/terms" },
  { label: "Contact us", href: "/contact" },
];

const INSTAGRAM = "http://instagram.com/eprogadgets";
const YOUTUBE = "https://www.youtube.com/@eprogadgets";

export function Footer() {
  return (
    <>
      <IconWithText />

      <footer className="bg-surface-0">
        {/* The footer columns are NOT three equal thirds stretched across
            the container - on the live site they sit narrow and packed
            to the left, with the right of the row left empty. And the
            gap above the footer is larger than the gap between ordinary
            sections. */}
        <div className="page grid gap-10 pb-14 pt-24 md:grid-cols-[minmax(0,400px)_minmax(0,200px)_minmax(0,320px)] md:gap-x-16 md:pt-36">
          {/* brand */}
          <div>
            <Image
              src="/brand/Epro_LOGO_LIGHT-01.png"
              alt="Epro Gadgets"
              width={2833}
              height={942}
              className="w-[140px]"
            />

            <p className="mt-6 max-w-xs text-[13px] leading-relaxed text-text-mid">
              Every day is an evolution. Since our launch in 2013, we&apos;ve
              explored and curated the tools for your continual
              transformation—on an emotional, physical, intellectual and
              spiritual level.
            </p>

            <div className="mt-6 flex gap-2.5">
              <Social href={INSTAGRAM} label="Instagram" name="instagram" />
              <Social href={YOUTUBE} label="YouTube" name="youtube" />
            </div>

            <p className="mt-8 text-[12px] text-text-low">
              © {process.env.NEXT_PUBLIC_BUILD_YEAR} Epro Gadgets. All rights
              reserved.
            </p>
          </div>

          {/* the one link column */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-low">
              Help &amp; Support
            </p>
            <ul className="mt-5 space-y-3.5">
              {HELP.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-text-mid transition-colors hover:text-text-hi"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* stay in touch */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-low">
              Stay in touch
            </p>

            <form className="mt-5 flex max-w-xs overflow-hidden rounded-[var(--r-md)] border border-hairline bg-surface-2">
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Enter your email address"
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-[13px] text-text-hi placeholder:text-text-low focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid w-12 shrink-0 place-items-center bg-accent text-accent-ink transition-colors hover:bg-accent-hover"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="page">
          <div className="border-t border-hairline py-7 text-center">
            <a
              href="#main"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border border-hairline px-4 py-2 text-[13px] text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 15l-6-6-6 6" />
              </svg>
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function Social({
  href,
  label,
  name,
}: {
  href: string;
  label: string;
  name: "instagram" | "youtube";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-[var(--r-md)] bg-surface-2 text-text-mid transition-colors hover:text-text-hi"
    >
      {name === "instagram" ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
        </svg>
      )}
    </a>
  );
}
