import Link from "next/link";

/**
 * FAQ, rebuilt from the live `collapsible_content` section.
 *
 * Structure, from the markup:
 *
 *   .ctnr.d-flex.fd-column.fd-row-md.c-gap-4x      two columns at md
 *     left  (--w-md: 6)  h2, description, .btn.btn-primary.btn-large
 *     right <ecx-accordion> (--w-md: 6) .gap-2x
 *       .accordion__item.corner-radius-s.bs-card   padding --card-item-gap
 *         button > h3.fw-700  +  span.btn.btn-large.btn-icon (chevron)
 *
 * Resolved values (html is font-size: 62.5%, so 1rem = 10px):
 *   --card-item-gap        2.4rem = 24px   (item padding)
 *   corner-radius-s        16px * .75 = 12px
 *   .gap-2x                2 * --gutter-base
 *   .c-gap-4x              4 * --gutter-base
 *   .btn-icon              width: --form-field-lg = 44px
 *   --button-border-radius 8px
 *
 * Differences from what was here before: it was one bordered list, not
 * separate cards; it had five invented questions instead of the store's
 * four; the first item was closed rather than open; and the toggle was
 * a small plus rather than a 44px chevron box that turns accent green
 * while open. `data-properties='{"multiple": false}'` means only one
 * answer is open at a time, which the shared `name` below reproduces
 * natively.
 *
 * All four questions and answers are the store's own words.
 */

const FAQS = [
  {
    q: "How long does your shipping take?",
    a: ["Once your order is placed, we strive to process and dispatch it within 1-2 business days. The estimated delivery time may vary depending on your location and the shipping method selected at checkout."],
  },
  {
    q: "Are the skins easy to apply?",
    a: [
      "Yes! Our skins are precision-cut for each specific device model, ensuring accurate fit around buttons, edges, and other details. They’re designed for easy application, with carefully engineered cuts that make alignment simple and provide a clean, professional finish.",
      "(For the best results, apply a small amount of heat using a hairdryer or heat gun to help the skin adhere properly, especially around the edges and curved areas.)",
    ],
  },
  {
    q: "Will the skin damage my device or leave any sticky residue behind?",
    a: ["Our products have specially Formulated adhesive that does not damage your device nor leave any glue residues. It can be easily removed and replaced at any time to match your new style."],
  },
  {
    q: "Still Have Questions?",
    a: ["Have a question? Simply visit our Contact Us page and get in touch with our team. We’re always happy to help!"],
  },
];

export function Faq() {
  return (
    <section className="page py-10 md:py-20">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-20">
        {/* ---- left column ---- */}
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-text-hi md:text-5xl">
            Got questions? We&apos;ve got answers!
          </h2>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-text-mid">
            If you can&apos;t find the answer you&apos;re looking for,
            don&apos;t hesitate to reach out to our friendly customer support
            team. We&apos;re here to assist you and ensure you have the best
            experience with our products and services.
          </p>

          <Link
            href="/contact"
            className="mt-10 inline-flex h-11 items-center gap-3 rounded-full bg-accent pl-6 pr-1.5 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
          >
            Contact us
            <span className="grid h-8 w-8 place-items-center rounded-full bg-black/15">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </Link>
        </div>

        {/* ---- accordion ---- */}
        <div className="flex flex-col gap-4 md:w-1/2 md:gap-5">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              /* one open at a time, as the theme's
                 {"multiple": false} does */
              name="homepage-faq"
              open={i === 0}
              className="group rounded-xl bg-surface-2 p-6"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 marker:content-none">
                <h3 className="flex-1 text-[17px] font-bold leading-snug text-text-hi">
                  {f.q}
                </h3>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-3 text-text-mid transition-colors group-open:bg-accent group-open:text-accent-ink">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                    className="transition-transform group-open:rotate-180"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.7071 9.00421L18.2929 7.59L12 13.8829L5.70712 7.59L4.29291 9.00421L12 16.7113L19.7071 9.00421Z"
                    />
                  </svg>
                </span>
              </summary>

              <div className="mt-5 space-y-3 border-t border-hairline pt-5">
                {f.a.map((p) => (
                  <p key={p} className="text-[14px] leading-relaxed text-text-mid">
                    {p}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
