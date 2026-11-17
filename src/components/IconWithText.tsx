/**
 * The four assurance cards, from the live `icon_with_text` section.
 *
 * Each column is `--w-md: 3.0` (a quarter) with
 * `--color-highlight-icon: #00A44F`, and the icons are the theme's own
 * 24-viewBox paths rendered at 36px, copied verbatim below so the
 * shapes are the store's and not lookalikes I drew.
 *
 * The copy is theirs too. It was paraphrased before - "Dispatched in
 * 1-2 business days from Kerala" instead of "Fully Managed by Our
 * Dedicated Team" - and it was a borderless strip inside the footer
 * rather than four cards above it.
 */

type Item = {
  title: string;
  body: string;
  /** verbatim path data from the theme's SVG sprite */
  paths: string[];
};

const ITEMS: Item[] = [
  {
    title: "Processing & Shipping",
    body: "Fully Managed by Our Dedicated Team",
    paths: [
      "M1.92017 7H22.0799L20.9261 22H3.07401L1.92017 7ZM4.07992 9L4.92607 20H19.074L19.9202 9H4.07992Z",
      "M12 4C10.067 4 8.5 5.567 8.5 7.5H6.5C6.5 4.46243 8.96243 2 12 2C15.0376 2 17.5 4.46243 17.5 7.5H15.5C15.5 5.567 13.933 4 12 4Z",
      "M6.5 11L6.5 8L8.5 8L8.5 11L6.5 11Z",
      "M15.5 11L15.5 8L17.5 8L17.5 11L15.5 11Z",
    ],
  },
  {
    title: "Customer Support",
    body: "Available during business hours to assist you",
    paths: [
      "M5.07089 10C5.55612 6.60771 8.47353 4 12 4C15.5265 4 18.4439 6.60771 18.9291 10H18V17H18.7876C18.5414 17.5218 18.0889 17.9282 17.4717 18.2509C16.5252 18.7457 15.2879 18.9749 14.191 18.9981V18.25H12.191V21.75H14.191V20.9984C15.5018 20.9757 17.0851 20.7097 18.3982 20.0233C19.5571 19.4174 20.5686 18.438 20.8921 17H22V10H20.9451C20.4476 5.50005 16.6326 2 12 2C7.36745 2 3.55237 5.50005 3.05493 10H2V17H6V10H5.07089Z",
    ],
  },
  {
    title: "Quality Guarantee",
    body: "Carefully inspected & quality-checked before shipment",
    paths: [
      "M12.3714 1.07153L12 0.922974L11.6286 1.07153L1.62861 5.07153L1 5.32297V6.00001V18V18.677L1.62861 18.9285L11.6286 22.9285L12 23.077L12.3714 22.9285L22.3714 18.9285L23 18.677V18V6.00001V5.32297L22.3714 5.07153L12.3714 1.07153ZM4.69258 6.00001L12 3.07704L19.3074 6.00001L12 8.92297L4.69258 6.00001ZM11 10.677V20.523L3 17.323V7.47704L11 10.677Z",
    ],
  },
  {
    title: "Secure Payment",
    body: "All payments are processed securely & encrypted",
    paths: [
      "M4 7.33333H20V8.5H4V7.33333ZM4 10.5V16.6667H20V10.5H4ZM2 19V5H22V19H2ZM12 13.75L5 13.75L5 12.25L12 12.25V13.75ZM13 13.75H16V12.25L13 12.25V13.75Z",
    ],
  },
];

export function IconWithText() {
  return (
    <section className="page py-10 md:py-20">
      <ul role="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-center rounded-xl border border-hairline bg-surface-1 px-6 py-9 text-center"
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-xl border border-accent/35 text-accent"
              style={{ boxShadow: "0 0 22px rgba(0,164,79,0.28)" }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                {item.paths.map((d) => (
                  <path key={d} fillRule="evenodd" clipRule="evenodd" d={d} />
                ))}
              </svg>
            </span>

            <h3 className="mt-6 text-[15px] font-bold text-text-hi">
              {item.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-mid">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
