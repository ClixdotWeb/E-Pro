import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "WhatsApp, email or the form below. We answer between 10am and 7pm IST, within one business day.",
};

const CHANNELS = [
  {
    name: "WhatsApp",
    detail: "Fastest — usually within the hour",
    value: "+91 00000 00000",
    href: "https://wa.me/910000000000",
    icon: "chat",
  },
  {
    name: "Email",
    detail: "For order issues with photos attached",
    value: "support@eprogadgets.com",
    href: "mailto:support@eprogadgets.com",
    icon: "mail",
  },
  {
    name: "Instagram",
    detail: "Real customer photos and new drops",
    value: "@eprogadgets",
    href: "https://instagram.com",
    icon: "camera",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="page grid gap-12 py-12 lg:grid-cols-[1fr_minmax(0,440px)]">
      <div>
        <p className="kicker">10am – 7pm IST, Mon–Sat</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-text-hi">
          Talk to a human.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-mid">
          The person answering is usually the person who cut your skin. Have
          your order number ready and a photo if something is wrong — that
          resolves most cases in one message.
        </p>

        <ul className="mt-10 space-y-3">
          {CHANNELS.map((c) => (
            <li key={c.name}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer noopener"
                className="group flex items-center gap-4 rounded-[var(--r-lg)] border border-hairline bg-surface-1 p-4 transition-colors hover:border-accent"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-accent-soft text-accent">
                  <ChannelIcon name={c.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-hi">
                    {c.name}
                  </span>
                  <span className="block text-[12px] text-text-low">
                    {c.detail}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] text-text-mid transition-colors group-hover:text-accent">
                  {c.value}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 border-t border-hairline pt-6">
          <p className="kicker">Before you write</p>
          <ul className="mt-3 space-y-2">
            {[
              ["Where is my order?", "/track"],
              ["How do I apply a skin?", "/how-to-apply"],
              ["Can I return it?", "/policies/returns"],
              ["My device isn't listed", "/request-model"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[13px] text-accent hover:underline"
                >
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card h-fit p-6 lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        <h2 className="text-base font-semibold text-text-hi">Send a message</h2>

        <form className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
                Name <span className="text-danger">*</span>
              </span>
              <input
                name="name"
                required
                className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
                Email <span className="text-danger">*</span>
              </span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
              Order number
            </span>
            <input
              name="orderNumber"
              placeholder="EPRO-1234"
              className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi placeholder:text-text-low"
            />
            <span className="mt-1 block text-[11px] text-text-low">
              Optional, but it speeds things up
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
              Subject <span className="text-danger">*</span>
            </span>
            <select
              name="subject"
              required
              className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi"
            >
              <option value="">Select…</option>
              <option>Order status / tracking</option>
              <option>Damaged or miscut skin</option>
              <option>Return or exchange</option>
              <option>Application help</option>
              <option>Request a device model</option>
              <option>Wholesale / bulk</option>
              <option>Something else</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
              Message <span className="text-danger">*</span>
            </span>
            <textarea
              name="message"
              rows={5}
              required
              className="w-full resize-y rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi"
            />
          </label>

          <button
            type="button"
            className="w-full rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Send message
          </button>

          <p className="text-center text-[11px] text-text-low">
            We reply within one business day.
          </p>
        </form>
      </div>
    </div>
  );
}

function ChannelIcon({ name }: { name: "chat" | "mail" | "camera" }) {
  const d = {
    chat: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-2.8-.4L4 21l1.5-4.2A8.2 8.2 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z",
    mail: "M3 6h18v12H3zM3 7l9 6 9-6",
    camera: "M4 7h3l1.5-2.5h7L17 7h3v13H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  }[name];
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
