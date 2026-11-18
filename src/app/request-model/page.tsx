import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Device Model",
  description:
    "Unable to find your device model? Send us a request and we'll work on adding it to our list.",
};

/**
 * Request a Device Model, rebuilt from the live page
 * (/pages/request-a-skin-1) rather than designed here.
 *
 * Structure, from its markup:
 *
 *   section 1  .ctnr.corner-radius-m > [--w-md: 10] > h1.h2.tt-cap
 *              "Request a Device Model", centred
 *   section 2  .ctnr grid of 12 > content at --gc-md: 3 / 11
 *              h2.h3  "Unable to find your device model? ..."
 *              form .rw.r-gap-24
 *                Your name    --w-md 6   (not required)
 *                Your email   --w-md 6   required *
 *                Product Type --w-md 12  (not required, its * is d-none)
 *                Brand        --w-md 6   required *
 *                Model        --w-md 6   required *
 *                Your message 12, textarea rows=5, required *
 *                button .btn-primary.btn-large  "Send message"
 *
 * Resolved sizes (html font-size: 62.5%, so 1rem = 10px):
 *   --h2 36px (the page title), --h3 28px (the card heading)
 *   .field__text  height --form-field-lg 44px, padding 0 1.6rem,
 *                 border 1px, radius --corner-radius-xs 6px
 *   textarea      min-height 10rem, padding-top 10px
 *   .r-gap-24     row-gap 24px
 *   .color-error  #eb544a  (the asterisks)
 *
 * Every placeholder and label is the store's own text.
 *
 * The form posts nowhere yet. It is marked up so that pointing
 * `action` at a Server Action is the only change needed.
 */

export default function RequestModelPage() {
  return (
    <>
      {/* page title */}
      <section className="page pt-10 md:pt-16">
        <h1 className="text-center text-[28px] font-bold capitalize tracking-tight text-text-hi md:text-[36px]">
          Request a Device Model
        </h1>
      </section>

      {/* form card */}
      <section className="page py-10 md:py-20">
        <div className="mx-auto w-full max-w-[680px] rounded-[24px] bg-surface-1 px-6 py-10 md:px-12 md:py-14">
          <h2 className="text-center text-[20px] font-bold leading-snug text-text-hi md:text-[28px]">
            Unable to find your device model? Send us a request and we&rsquo;ll
            work on adding it to our list.
          </h2>

          <form className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            <Field
              id="name"
              label="Your name"
              autoComplete="name"
              placeholder="Enter your name"
            />
            <Field
              id="email"
              label="Your email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />

            <Field
              id="productType"
              label="Product Type"
              placeholder="e.g. Camera, Lens, Smartphone, Drone..."
              className="md:col-span-2"
            />

            <Field
              id="brand"
              label="Brand"
              placeholder="e.g. Sony, Canon, Apple, DJI..."
              required
            />
            <Field
              id="model"
              label="Model"
              placeholder="e.g. A7 IV, 24-70mm GM II, iPhone 16 Pro..."
              required
            />

            <div className="md:col-span-2">
              <Label htmlFor="message" required>
                Your message
              </Label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Enter your message"
                className="min-h-[100px] w-full resize-y rounded-[6px] border border-hairline bg-surface-2 px-4 pt-2.5 text-[14px] leading-relaxed text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
              />
            </div>

            <div className="mt-2 flex justify-center md:col-span-2 md:mt-6">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2.5 rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
              >
                Send message
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
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
      className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-text-mid"
    >
      {children}
      {/* .color-error is #eb544a in the theme */}
      {required && <sup className="ml-1 text-danger">*</sup>}
    </label>
  );
}

function Field({
  id,
  label,
  required = false,
  className = "",
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="h-11 w-full rounded-[6px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        {...rest}
      />
    </div>
  );
}
