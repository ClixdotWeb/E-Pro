/**
 * WhatsApp, which is where enquiries actually go.
 *
 * A wa.me link, not the Business API. The API needs a Meta app, a
 * verified business, approved message templates and a 24-hour
 * window, and it buys nothing here: every enquiry on this site is
 * started by the customer, in the open, on their own phone. A deep
 * link opens their WhatsApp with the message already typed, they
 * read it before they send it, and it works on the day it ships.
 *
 * The number lives in one place. It was copy-pasted into four pages
 * with a different hand-encoded message each time, which is three
 * places to forget when it changes.
 *
 * No "use server" and no imports: the number is public - it is
 * printed on the contact page - so client components build these
 * links themselves rather than asking the server for one.
 */

/** The shop's WhatsApp, in international form, digits only. */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
  "919562470470";

/** How a human reads it back. */
export const WHATSAPP_DISPLAY = "+91 95624 70470";

/**
 * A wa.me link with the message pre-typed.
 *
 * Lines are joined with a real newline; WhatsApp keeps them, and an
 * enquiry that arrives as one run-on sentence is an enquiry someone
 * has to decode before they can answer it.
 */
export function whatsappLink(
  lines: string | (string | null | undefined)[],
): string {
  // Only null and undefined are dropped. An empty string is a blank
  // line someone asked for, and filtering it out ran the greeting
  // straight into the details.
  const text = Array.isArray(lines)
    ? lines.filter((l) => l !== null && l !== undefined).join("\n")
    : lines;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** The plain "I have a question" link, for a header or a footer. */
export function whatsappGeneral(about?: string): string {
  return whatsappLink(
    about
      ? `Hello Epro! I have a question about ${about}.`
      : "Hello Epro! I have a question.",
  );
}

/**
 * An enquiry about one device, with everything already chosen filled
 * in. The whole point: the shop owner should not have to ask "which
 * phone?" and "which skin?" before they can answer.
 */
export function whatsappAboutDevice(opts: {
  device: string;
  category?: string;
  design?: string | null;
  coverage?: string | null;
  logoCutout?: boolean | null;
  url?: string;
}): string {
  return whatsappLink([
    `Hello Epro! I would like a skin for my ${opts.device}.`,
    "",
    opts.category ? `Device: ${opts.device} (${opts.category})` : null,
    opts.design ? `Design: ${opts.design}` : null,
    opts.coverage ? `Skin: ${opts.coverage}` : null,
    opts.logoCutout === null || opts.logoCutout === undefined
      ? null
      : `Apple logo: ${opts.logoCutout ? "cutout" : "covered"}`,
    opts.url ? `Page: ${opts.url}` : null,
  ]);
}

/** "We do not cut this yet - can you?" */
export function whatsappRequestModel(opts: {
  productType?: string;
  brand?: string;
  model?: string;
  name?: string;
  message?: string;
}): string {
  return whatsappLink([
    "Hello Epro! Please add this device to your list.",
    "",
    opts.name ? `Name: ${opts.name}` : null,
    opts.productType ? `Type: ${opts.productType}` : null,
    opts.brand ? `Brand: ${opts.brand}` : null,
    opts.model ? `Model: ${opts.model}` : null,
    opts.message ? `\n${opts.message}` : null,
  ]);
}

/** An enquiry about an order that has already been placed. */
export function whatsappAboutOrder(orderNumber: string): string {
  return whatsappLink([
    `Hello Epro! I have a question about my order ${orderNumber}.`,
  ]);
}
