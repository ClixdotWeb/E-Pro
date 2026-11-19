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
  action,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** drop the body padding, for tables that run edge to edge */
  flush?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[14px] border border-hairline bg-surface-1 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 120px)",
      }}
    >
      {title && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-6 py-5">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-text-hi">
              {title}
            </h2>
            {hint && (
              <p className="mt-1 text-[12px] leading-relaxed text-text-mid">
                {hint}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={flush ? "" : "p-6"}>{children}</div>
    </section>
  );
}

/* ---------------- stat ---------------- */

/**
 * A single number, with the icon kept quiet in the corner so the
 * figure is the first thing read. The accent tint on a warning tile
 * is what makes "needs attention" findable at a glance without a
 * colour-coded legend to learn.
 */
export function Stat({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "default" | "warning" | "accent";
}) {
  const ring =
    tone === "warning"
      ? "border-warning/30"
      : tone === "accent"
        ? "border-accent/30"
        : "border-hairline";

  const wash =
    tone === "warning"
      ? "radial-gradient(120% 130% at 100% 0%, rgba(227,140,9,0.12) 0%, transparent 60%)"
      : tone === "accent"
        ? "radial-gradient(120% 130% at 100% 0%, rgba(0,164,79,0.12) 0%, transparent 60%)"
        : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 90px)";

  const figure =
    tone === "warning"
      ? "text-warning"
      : tone === "accent"
        ? "text-accent"
        : "text-text-hi";

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border bg-surface-1 p-5 ${ring}`}
      style={{ backgroundImage: wash }}
    >
      {icon && (
        <span
          aria-hidden
          className={`absolute right-4 top-4 ${
            tone === "default" ? "text-text-low" : figure
          } opacity-50`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </span>
      )}

      <p className="text-[12px] font-medium text-text-mid">{label}</p>
      <p
        className={`mt-2.5 text-[30px] font-bold leading-none tracking-tight tabular-nums ${figure}`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-2.5 text-[12px] leading-relaxed text-text-low">
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * Initials in a circle. Cheap, consistent, and it gives a row of names
 * something to anchor on when scanning. The hue is derived from the
 * name so the same person is always the same colour.
 */
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hue = h % 360;

  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold"
      style={{
        background: `hsl(${hue} 42% 22%)`,
        color: `hsl(${hue} 70% 72%)`,
      }}
    >
      {initials}
    </span>
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

/* ---------------- switch ---------------- */

/**
 * On/off in one control.
 *
 * A pill saying "On" beside a button saying "Turn off" is two things
 * that contradict each other at a glance, and the button's label had
 * to change length every time it was pressed - which is what made it
 * wrap onto two lines. A switch states the condition and changes it,
 * at a fixed size.
 *
 * It is a real <button role="switch"> so the keyboard and screen
 * readers get it for free.
 */
export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
}) {
  // Track 44, knob 18, 3px of breathing room each side. The knob is
  // positioned with an explicit `left`, not a utility translate - an
  // absolutely positioned child with no left/right falls back to its
  // static position, which is what put the knob outside the track.
  const KNOB = 18;
  const TRACK = 44;
  const PAD = 3;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="group inline-flex shrink-0 items-center gap-2.5"
    >
      <span
        aria-hidden
        className={`relative block rounded-full transition-colors ${
          on ? "bg-accent" : "bg-surface-3"
        }`}
        style={{ width: TRACK, height: KNOB + PAD * 2 }}
      >
        <span
          className="absolute rounded-full bg-white shadow transition-[left] duration-200"
          style={{
            width: KNOB,
            height: KNOB,
            top: PAD,
            left: on ? TRACK - KNOB - PAD : PAD,
          }}
        />
      </span>

      {/* The word, because a switch alone is a guess. */}
      <span
        aria-hidden
        className={`w-7 text-left text-[12px] font-bold ${
          on ? "text-accent" : "text-text-low"
        }`}
      >
        {on ? "On" : "Off"}
      </span>
    </button>
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
