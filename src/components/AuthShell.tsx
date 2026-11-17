import Link from "next/link";
import Image from "next/image";

/**
 * Shared frame for /login and /register.
 *
 * Two columns on desktop: the form on the left, and on the right the
 * reason to bother making an account at all. A store this size gives
 * people no reason to sign up unless it is spelled out, and guest
 * checkout stays available either way — an account is never a wall in
 * front of a purchase.
 */

export function AuthShell({
  kicker,
  title,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="page grid gap-12 py-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20 lg:py-20">
      <div className="w-full">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-text-hi">
          {title}
        </h1>

        <div className="mt-8">{children}</div>

        <div className="mt-8 border-t border-hairline pt-5 text-[13px] text-text-mid">
          {footer}
        </div>
      </div>

      {/* why bother */}
      <aside className="hidden lg:block">
        <div className="relative h-full min-h-[420px] overflow-hidden rounded-[var(--r-lg)] border border-hairline">
          <Image
            src="/brand/Untitled_design_3.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover opacity-45"
            aria-hidden
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%)",
            }}
          />

          <div className="relative flex h-full flex-col justify-end p-8">
            <p className="kicker text-white/50">With an account</p>
            <ul className="mt-4 space-y-3.5">
              {[
                ["Reorder in one tap", "Your exact model is remembered — no searching it out again."],
                ["Track every parcel", "Order history and AWB numbers in one place."],
                ["GST invoices on demand", "Download them any time, not just from the email."],
                ["First dibs on new cuts", "We template new devices weekly."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-white">
                      {t}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-white/55">
                      {b}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-7 border-t border-white/15 pt-5 text-[12px] leading-relaxed text-white/50">
              You can also{" "}
              <Link href="/checkout" className="text-accent hover:underline">
                check out as a guest
              </Link>
              . An account is never required to buy.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function AuthField({
  id,
  label,
  hint,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] text-text-low">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1.5 w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[11px] text-text-low">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Placeholder for the OAuth buttons. Rendered disabled until Auth.js
 * providers are configured, rather than hidden, so the layout that
 * ships is the layout that goes live.
 */
export function SocialAuthButtons({ verb }: { verb: string }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[11px] text-text-low">or</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          disabled
          title="Google sign-in is not configured yet"
          className="flex items-center justify-center gap-2.5 rounded-[var(--r-md)] border border-hairline px-4 py-2.5 text-[13px] font-medium text-text-mid opacity-55"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.7 3-4.3 3-7.5z" />
            <path fill="currentColor" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
            <path fill="currentColor" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
            <path fill="currentColor" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
          </svg>
          {verb} with Google
        </button>
      </div>

      <p className="mt-2.5 text-center text-[11px] text-text-low">
        Social sign-in is not switched on yet.
      </p>
    </div>
  );
}
