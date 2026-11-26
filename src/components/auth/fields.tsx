/**
 * The inputs shared by /login and /register.
 *
 * They live apart from AuthShell because AuthShell reads the
 * database for the counts on its left panel, and these are imported
 * by client components - pulling the shell in beside them dragged
 * Prisma and the Postgres driver into the browser bundle.
 */

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
      <label
        htmlFor={id}
        className="block text-[12.5px] font-medium text-text-mid"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi transition-colors placeholder:text-text-low focus:border-accent focus:bg-surface-0 focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)]"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[11.5px] text-text-low">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * The OAuth buttons. Rendered disabled until Auth.js providers are
 * configured, rather than hidden, so the layout that ships is the
 * layout that goes live - and labelled with why, so it does not read
 * as a broken button.
 */
export function SocialAuthButtons({ verb }: { verb: string }) {
  return (
    <div className="mt-7">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[11px] uppercase tracking-[0.1em] text-text-low">
          or
        </span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <button
        type="button"
        disabled
        title="Google sign-in is not switched on yet"
        className="mt-5 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-full border border-hairline text-[13.5px] font-bold text-text-mid opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.7 3-4.3 3-7.5z" />
          <path fill="currentColor" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
          <path fill="currentColor" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
          <path fill="currentColor" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
        </svg>
        {verb} with Google
      </button>

      <p className="mt-3 text-center text-[11.5px] text-text-low">
        Social sign-in is not switched on yet.
      </p>
    </div>
  );
}
