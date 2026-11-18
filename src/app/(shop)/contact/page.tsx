import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Have questions about our skins, custom orders, or need support? Reach out and our team will be glad to assist you.",
};

/**
 * Contact, from the live /policies/contact-information.
 *
 * Two columns: copy and a "Need Quick Assistance?" WhatsApp card on the
 * left, the form card on the right, then a three-up strip with the
 * studio address, working hours and direct email.
 *
 * The heading is two lines with the second in accent green, the Inquiry
 * Topic options are the store's own six, and only Email address and
 * Message are required - Name and Phone Number are not, same as there.
 *
 * The form posts nowhere yet; pointing `action` at a Server Action is
 * the only change needed.
 */

const WHATSAPP =
  "https://wa.me/918891202497?text=Hello%20Epro!%20I%20have%20a%20question.";

const TOPICS = [
  "Custom Skin Request",
  "Order Status & Tracking",
  "Product & Material Question",
  "Bulk / Corporate Orders",
  "Feedback / Suggestions",
  "Other Inquiries",
];

const DETAILS: { title: string; body: string; href?: string; icon: React.ReactNode }[] = [
  {
    title: "Studio Address",
    body: "IMG Junction, Infopark Road, Kakkanad, Kochi, Kerala",
    icon: (
      <>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    ),
  },
  {
    title: "Working Hours",
    body: "Mon – Fri | 10:00 AM – 6:00 PM (IST)",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5.2l3.3 2" />
      </>
    ),
  },
  {
    title: "Direct Email",
    body: "eprogadgetsofficial@gmail.com",
    href: "mailto:eprogadgetsofficial@gmail.com",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3.6 6.6L12 12.8l8.4-6.2" />
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="page py-10 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ---- left ---- */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/45 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              We&apos;re Here For You
            </span>

            <h1 className="mt-7 text-[32px] font-bold leading-[1.15] tracking-tight text-text-hi md:text-[42px]">
              We&apos;re here for you
              <br />
              <span className="text-accent">Contact Us</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-mid">
              Have questions about our skins, custom orders, or need support?
              Reach out to us and our team will be glad to assist you.
            </p>

            {/* quick assistance */}
            <div
              className="mt-auto rounded-2xl border border-hairline bg-surface-1 p-7"
              style={{
                backgroundImage:
                  "radial-gradient(120% 120% at 0% 0%, rgba(0,164,79,0.12) 0%, transparent 60%)",
              }}
            >
              <h2 className="text-[16px] font-bold text-text-hi">
                Need Quick Assistance?
              </h2>
              <p className="mt-2.5 max-w-sm text-[13px] leading-relaxed text-text-mid">
                Direct 1-on-1 support for custom device skins, order tracking,
                and instant inquiries.
              </p>

              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
                style={{ boxShadow: "0 0 26px rgba(0,164,79,0.35)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.17c-.25.69-1.44 1.32-1.99 1.37-.53.05-.53.43-3.34-.86-2.81-1.29-4.52-4.3-4.65-4.5-.14-.2-1.11-1.53-1.11-2.92s.72-2.07.98-2.35c.25-.28.55-.35.73-.35h.53c.17 0 .4-.06.63.48.23.55.79 1.9.86 2.04.07.14.11.3.02.49-.09.19-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.89 1.04.93 1.92 1.21 2.2 1.35.28.14.44.12.6-.07.17-.19.69-.8.88-1.08.19-.28.37-.23.63-.14.25.09 1.6.76 1.88.9.27.14.45.21.52.32.07.12.07.67-.19 1.37z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* ---- form ---- */}
          <div className="rounded-2xl border border-hairline bg-surface-1 p-7 md:p-9">
            <form className="space-y-5">
              <Field id="name" label="Your name" placeholder="Your name" autoComplete="name" />
              <Field
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="Your phone number"
                autoComplete="tel"
                inputMode="numeric"
              />
              <Field
                id="email"
                label="Email address"
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                required
              />

              <div>
                <Label htmlFor="topic">Inquiry Topic</Label>
                <select
                  id="topic"
                  name="topic"
                  defaultValue=""
                  className="h-12 w-full rounded-full border border-hairline bg-surface-2 px-5 text-[14px] text-text-hi focus:border-accent focus:outline-none"
                >
                  <option value="" disabled>
                    Select a topic...
                  </option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="message" required>
                  Message
                </Label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Type something here..."
                  className="min-h-[130px] w-full resize-y rounded-2xl border border-hairline bg-surface-2 px-5 py-4 text-[14px] leading-relaxed text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-accent text-sm font-bold text-black transition-colors hover:bg-accent-hover"
              >
                Send a message
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ---- details ---- */}
      <section className="page pb-10 md:pb-20">
        <ul className="grid gap-5 md:grid-cols-3">
          {DETAILS.map((d) => (
            <li
              key={d.title}
              className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface-1 p-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/35 text-accent">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {d.icon}
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-text-hi">{d.title}</p>
                {d.href ? (
                  <a
                    href={d.href}
                    className="mt-1 block break-words text-[13px] leading-relaxed text-text-mid hover:text-accent"
                  >
                    {d.body}
                  </a>
                ) : (
                  <p className="mt-1 text-[13px] leading-relaxed text-text-mid">
                    {d.body}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Label({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[13px] font-bold text-text-hi"
    >
      {children}
      {required && <sup className="ml-1 text-accent">*</sup>}
    </label>
  );
}

function Field({
  id,
  label,
  required = false,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="h-12 w-full rounded-full border border-hairline bg-surface-2 px-5 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        {...rest}
      />
    </div>
  );
}
