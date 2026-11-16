import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track order",
  description: "Enter your order number or AWB to see where your parcel is.",
};

const TIMELINE = [
  { label: "Order confirmed", at: "12 Nov, 9:14 AM", done: true },
  { label: "Cut and packed", at: "13 Nov, 2:40 PM", done: true },
  { label: "Handed to courier", at: "13 Nov, 6:05 PM", done: true },
  { label: "In transit", at: "14 Nov, 7:22 AM", done: true, current: true },
  { label: "Out for delivery", at: "Expected 16 Nov", done: false },
  { label: "Delivered", at: "", done: false },
];

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const sp = await searchParams;
  const awb = typeof sp.awb === "string" ? sp.awb : "";

  return (
    <div className="page max-w-2xl py-12">
      <p className="kicker">Where is my order?</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-hi">
        Track your order
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
        Use the order number from your confirmation email (EPRO-0000) or the AWB
        number from the dispatch message.
      </p>

      <form action="/track" className="mt-7 flex gap-2">
        <label htmlFor="awb" className="sr-only">
          Order or AWB number
        </label>
        <input
          id="awb"
          name="awb"
          defaultValue={awb}
          placeholder="EPRO-1042 or DL1289347712"
          className="min-w-0 flex-1 rounded-[var(--r-md)] border border-hairline bg-surface-0 px-4 py-3 text-sm text-text-hi placeholder:text-text-low"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Track
        </button>
      </form>

      {awb && (
        <div className="card mt-8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-text-hi">
                {awb}
              </p>
              <p className="mt-1 text-[12px] text-text-low">
                Delhivery Surface · 3 items
              </p>
            </div>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
              In transit
            </span>
          </div>

          <ol className="mt-7 space-y-5 border-l border-hairline pl-6">
            {TIMELINE.map((t) => (
              <li key={t.label} className="relative">
                <span
                  className={`absolute -left-[31px] top-0.5 grid h-[22px] w-[22px] place-items-center rounded-full border bg-surface-0 ${
                    t.current
                      ? "border-accent text-accent"
                      : t.done
                        ? "border-success text-success"
                        : "border-hairline text-text-low"
                  }`}
                >
                  {t.done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <p
                  className={`text-sm ${
                    t.done || t.current
                      ? "font-medium text-text-hi"
                      : "text-text-low"
                  }`}
                >
                  {t.label}
                </p>
                {t.at && (
                  <p className="mt-0.5 text-[12px] text-text-low">{t.at}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
