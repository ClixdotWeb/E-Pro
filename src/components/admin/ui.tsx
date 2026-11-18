import Link from "next/link";

/**
 * The dashboard's shared pieces.
 *
 * Deliberately small. Every screen is built from the same five things
 * so nothing has to be relearned from one page to the next, and so
 * there is exactly one way to show a heading, a card, a status or an
 * empty screen.
 */

/* ---------------- page header ---------------- */

/**
 * One title, one sentence saying what the screen is for, and at most
 * ONE primary action. If a screen seems to need two primary actions,
 * one of them belongs somewhere else.
 */
export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  back?: { label: string; href: string };
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="mb-4 inline-flex items-center gap-2 text-[13px] text-text-mid transition-colors hover:text-text-hi"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 5l-7 7 7 7" />
          </svg>
          {back.label}
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-text-hi md:text-[30px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-mid">
              {description}
            </p>
          )}
        </div>

        {action && (
          <Link
            href={action.href}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}

/* ---------------- card ---------------- */

export function Card({
  title,
  hint,
  children,
  className = "",
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[12px] border border-hairline bg-surface-1 ${className}`}
    >
      {title && (
        <header className="border-b border-hairline px-5 py-4">
          <h2 className="text-[15px] font-bold text-text-hi">{title}</h2>
          {hint && (
            <p className="mt-1 text-[12px] leading-relaxed text-text-mid">
              {hint}
            </p>
          )}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ---------------- stat ---------------- */

export function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-[12px] border border-hairline bg-surface-1 p-5">
      <p className="text-[12px] text-text-mid">{label}</p>
      <p
        className={`mt-2 text-[26px] font-bold leading-none ${
          tone === "warning" ? "text-warning" : "text-text-hi"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-[12px] text-text-low">{sub}</p>}
    </div>
  );
}

/* ---------------- status pill ---------------- */

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-surface-3 text-text-mid",
  accent: "bg-accent-soft text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------------- empty state ---------------- */

/**
 * An empty screen should say what is missing, why, and offer the one
 * thing that fixes it. Never just "No data".
 */
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-[12px] border border-hairline bg-surface-1 px-6 py-16 text-center">
      <h2 className="text-[17px] font-bold text-text-hi">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-text-mid">
        {body}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-7 inline-flex h-11 items-center rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ---------------- not-saving notice ---------------- */

/**
 * Shown on every screen that looks editable but is not yet. Being
 * explicit about this is the difference between a demo and a lie.
 */
export function NotSavingYet({ what }: { what: string }) {
  return (
    <p className="mb-6 rounded-[8px] border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] leading-relaxed text-warning">
      {what} is not saved yet — the database is not connected. Everything
      here works, but it resets when you reload.
    </p>
  );
}
