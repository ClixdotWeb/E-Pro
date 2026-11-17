/**
 * Newsletter, from the live `newsletter` section.
 *
 *   .ctnr style="--overlay: 0"
 *     .bs-card.ecx-mask.corner-radius-m          24px corners
 *       .s-header__content  top-xs center-xs ta-start
 *         span.s-header__subheading.fw-700   "EXCLUSIVE COMMUNITY"
 *         h2                                  "Newsletter"
 *         p                                   description
 *         form -> input[email] + .btn.btn-primary.btn-large "Subscribe"
 *
 * It was previously a plain strip inside the footer with my own
 * heading ("New drops, first.") and copy. It is its own banner card on
 * the real page, with the store's words, and it sits between the FAQ
 * and the icon row.
 *
 * The form posts nowhere yet - there is no list to add anyone to. It is
 * marked up so that pointing `action` at a Server Action is the only
 * change needed.
 */
export function Newsletter() {
  return (
    <section className="page py-10 md:py-20">
      <div
        className="relative overflow-hidden rounded-[24px] bg-surface-1 px-6 py-16 text-center md:py-24"
        style={{
          // The card carries a soft green wash rather than a flat fill.
          backgroundImage:
            "radial-gradient(120% 90% at 50% 0%, rgba(0,164,79,0.16) 0%, rgba(0,164,79,0.04) 45%, transparent 75%)",
        }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/45 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          Exclusive Community
        </span>

        <h2 className="mt-5 text-4xl font-bold tracking-tight text-text-hi md:text-5xl">
          Newsletter
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-mid">
          Be the first to know about new arrivals, sales, and promotions by
          subscribing to our newsletter today!
        </p>

        <form className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <label htmlFor="newsletter-email" className="sr-only">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Enter your email address"
            className="min-w-0 flex-1 rounded-full border border-hairline bg-surface-2 px-6 py-3.5 text-sm text-text-hi placeholder:text-text-low focus:border-accent"
          />
          <button
            type="submit"
            className="inline-flex h-[52px] shrink-0 items-center justify-center gap-3 rounded-full bg-accent pl-7 pr-2 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
          >
            Subscribe
            <span className="grid h-9 w-9 place-items-center rounded-full bg-black/15">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}
