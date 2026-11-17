import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/realCatalog";

const HELP = [
  { label: "Return and exchange policy", href: "/policies/returns" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Service", href: "/policies/terms" },
  { label: "Contact us", href: "/contact" },
];

const COMPANY = [
  { label: "About us", href: "/about" },
  { label: "Material", href: "/material" },
  { label: "How to apply", href: "/how-to-apply" },
  { label: "Request a model", href: "/request-model" },
  { label: "Track order", href: "/track" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-surface-1">
      {/* trust strip */}
      <div className="border-b border-hairline">
        <ul className="page grid grid-cols-2 gap-x-6 gap-y-7 py-10 md:grid-cols-4">
          {[
            {
              icon: "truck",
              title: "Processing & Shipping",
              body: "Dispatched in 1–2 business days from Kerala.",
            },
            {
              icon: "headset",
              title: "Customer Support",
              body: "Real humans on WhatsApp, 10am–7pm IST.",
            },
            {
              icon: "shield",
              title: "Quality Guarantee",
              body: "Residue-free adhesive or we replace it free.",
            },
            {
              icon: "lock",
              title: "Secure Payment",
              body: "UPI, cards and netbanking via Razorpay.",
            },
          ].map((f) => (
            <li key={f.title} className="flex gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--r-md)] bg-accent-soft text-accent">
                <TrustIcon name={f.icon as TrustName} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-text-hi">
                  {f.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-text-mid">
                  {f.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* newsletter */}
      <div className="border-b border-hairline">
        <div className="page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="kicker">Exclusive community</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-hi">
              New drops, first.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-mid">
              Be the first to know about new arrivals, sales and promotions.
            </p>
          </div>

          <form className="flex w-full max-w-sm gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi placeholder:text-text-low"
            />
            <button
              type="submit"
              className="shrink-0 rounded-[var(--r-md)] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* link columns */}
      <div className="page grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="text-[13px] font-semibold text-text-hi">Epro Gadgets</p>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-text-mid">
            Precision-cut protective skins for the gear you actually use.
            Making them since 2013. Every day is an evolution.
          </p>
          <div className="mt-5 flex gap-2">
            <Social href="https://instagram.com" label="Instagram" name="instagram" />
            <Social href="https://youtube.com" label="YouTube" name="youtube" />
          </div>
        </div>

        <FooterCol
          title="Shop"
          links={NAV_CATEGORIES.slice(0, 6).map((c) => ({
            label: c.name,
            href: `/collections/${c.slug}`,
          }))}
        />
        <FooterCol title="Help & Support" links={HELP} />
        <FooterCol title="Company" links={COMPANY} />
      </div>

      <div className="border-t border-hairline">
        <div className="page flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-[12px] text-text-low">
            © {process.env.NEXT_PUBLIC_BUILD_YEAR} Epro Gadgets. All rights
            reserved.
          </p>
          <p className="text-[12px] text-text-low">
            GST compliant invoicing · Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-text-hi">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[13px] text-text-mid transition-colors hover:text-text-hi"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
      className="grid h-9 w-9 place-items-center rounded-[var(--r-md)] border border-hairline text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
    >
      {name === "instagram" ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.25.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.42 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.25.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.45 2.21 8.84 2.2 12 2.2zm0 1.8c-3.14 0-3.5.01-4.73.07-.95.04-1.42.2-1.75.33-.36.14-.6.3-.86.56-.26.26-.42.5-.56.86-.13.33-.29.8-.33 1.75C3.71 8.8 3.7 9.16 3.7 12s.01 3.2.07 4.43c.04.95.2 1.42.33 1.75.14.36.3.6.56.86.26.26.5.42.86.56.33.13.8.29 1.75.33 1.23.06 1.59.07 4.73.07s3.5-.01 4.73-.07c.95-.04 1.42-.2 1.75-.33.36-.14.6-.3.86-.56.26-.26.42-.5.56-.86.13-.33.29-.8.33-1.75.06-1.23.07-1.59.07-4.43s-.01-3.2-.07-4.43c-.04-.95-.2-1.42-.33-1.75a2.3 2.3 0 0 0-.56-.86 2.3 2.3 0 0 0-.86-.56c-.33-.13-.8-.29-1.75-.33C15.5 4.01 15.14 4 12 4zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.2a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z" />
        </svg>
      )}
    </a>
  );
}

type TrustName = "truck" | "headset" | "shield" | "lock";

function TrustIcon({ name }: { name: TrustName }) {
  const d: Record<TrustName, string> = {
    truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    headset: "M4 13a8 8 0 0 1 16 0M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zM20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z",
    shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
    lock: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d[name]} />
    </svg>
  );
}
