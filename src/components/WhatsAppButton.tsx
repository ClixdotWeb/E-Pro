import { whatsappGeneral, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

/**
 * The floating WhatsApp button.
 *
 * Every enquiry on this shop ends up on WhatsApp - there is no
 * inbox behind the contact form and no phone line being answered -
 * so it is worth one fixed button rather than making people find
 * the contact page first.
 *
 * Bottom-right, above the cart on a phone, and it never covers the
 * sticky buy box: that box sits in the page flow on mobile, not
 * pinned, so there is nothing underneath to hide.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappGeneral()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message us on WhatsApp, ${WHATSAPP_DISPLAY}`}
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-black shadow-[0_8px_28px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 md:bottom-7 md:right-7"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.03L2 22.5l5.6-1.47A9.9 9.9 0 1 0 12.04 2zm0 1.84a8.06 8.06 0 1 1-4.1 14.99l-.29-.17-3.32.87.89-3.23-.19-.3A8.06 8.06 0 0 1 12.04 3.84zm-3.2 4.03c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.16 1.75 2.79 4.3 3.8 2.12.84 2.55.67 3.01.63.46-.04 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29-.25-.12-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.12-.17.25-.65.81-.8.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.39-1.72c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.36-.76-1.86-.2-.49-.4-.42-.55-.43h-.44z" />
      </svg>
    </a>
  );
}
