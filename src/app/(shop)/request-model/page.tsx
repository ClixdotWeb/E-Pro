import type { Metadata } from "next";
import { RequestModelForm } from "@/components/RequestModelForm";

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
 * The form sends the request to WhatsApp. It posted nowhere at all
 * before, and the alternatives were a mail server nobody has set up
 * or a table someone would have to remember to look at - while
 * WhatsApp is already the phone these are answered on, and the
 * customer keeps a copy of what they asked for.
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

          <RequestModelForm />
        </div>
      </section>
    </>
  );
}

