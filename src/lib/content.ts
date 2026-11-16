import type { ContentDoc } from "@/components/ContentPage";

/**
 * Static page copy lives here so legal/marketing text can be reviewed
 * in one place. Replace with a CMS or DB table only if the store starts
 * editing these weekly.
 */

export const CONTENT: Record<string, ContentDoc> = {
  about: {
    kicker: "Since 2013",
    title: "Every day is an evolution.",
    lede:
      "We started cutting skins because the cases on sale all did the same thing: hid the device. Twelve years later we are still cutting film, still refusing to add bulk, and still templating whatever new hardware turns up.",
    blocks: [
      { kind: "h2", text: "What we actually make" },
      {
        kind: "p",
        text:
          "A 0.2 mm vinyl film, cut on a plotter to the exact die of one device model, with a removable automotive-grade adhesive behind it. No bezels, no lips, no 4 mm of silicone between you and the thing you paid for.",
      },
      {
        kind: "p",
        text:
          "That constraint decides everything else. A skin cannot absorb a drop, so we do not claim it does. What it does do is take the scratches, scuffs and desk rash that actually happen, and come off clean on the day you sell the device.",
      },
      { kind: "h2", text: "How we pick what to cut" },
      {
        kind: "ul",
        items: [
          "Every model in the catalogue was templated off a real device, not a spec sheet drawing.",
          "Requests drive the roadmap — if three people ask for a model, it gets cut.",
          "We retire a design when a batch no longer matches the sample we approved.",
        ],
      },
      { kind: "h2", text: "Where we are" },
      {
        kind: "p",
        text:
          "Cutting, packing and support all happen from one workshop in Kerala. Orders go out in 1–2 business days, and the person who answers your WhatsApp message is usually the person who cut the skin.",
      },
    ],
    cta: { label: "Browse the catalogue", href: "/collections/phone" },
  },

  material: {
    kicker: "Material",
    title: "What the film is made of.",
    lede:
      "One substrate, five finishes. Here is exactly what you are putting on your device, and what it will and will not do.",
    blocks: [
      {
        kind: "table",
        rows: [
          ["Substrate", "Cast automotive vinyl, 0.2 mm total stack height"],
          ["Adhesive", "Removable acrylic, air-release channels for bubble-free application"],
          ["Finishes", "Printed Designs, Design Patterns, Solid Pattern, Texture, Embossed"],
          ["Top coat", "UV-stable laminate; matte finishes add an anti-fingerprint layer"],
          ["Temperature range", "−20°C to 80°C once applied"],
          ["Expected life", "2–3 years of daily use before edges need attention"],
          ["Residue on removal", "None, at any point in that window"],
        ],
      },
      { kind: "h2", text: "What it protects against" },
      {
        kind: "ul",
        items: [
          "Scratches, scuffs and desk rash on the back and sides.",
          "Key and sand abrasion in pockets and bags.",
          "Minor chemical marks from sunscreen, sanitiser and sweat.",
        ],
      },
      { kind: "h2", text: "What it does not" },
      {
        kind: "ul",
        items: [
          "Drops and impact. A skin is film, not padding — pair it with a case if you drop things.",
          "Water ingress. It is not a seal.",
          "Screens. We do not cut display film.",
        ],
      },
      {
        kind: "note",
        text:
          "Embossed finishes are the one exception to the 0.2 mm figure — the relief takes them to roughly 0.35 mm at the high points, which you can feel but will not notice in a pocket.",
      },
    ],
    cta: { label: "See the finishes", href: "/collections/laptop" },
  },

  "how-to-apply": {
    kicker: "About five minutes",
    title: "How to apply a skin.",
    lede:
      "Every skin is precision-cut for one model, so there is nothing to measure or trim. Read this once before you peel anything.",
    blocks: [
      { kind: "h2", text: "Before you start" },
      {
        kind: "ul",
        items: [
          "Work on a clean, well-lit surface — not a bed or a carpet.",
          "Wash and dry your hands. Skin oil on the adhesive causes lifting later.",
          "Have the included alcohol pad and squeegee card out and ready.",
          "Optional but worth it: a hairdryer on its lowest heat setting.",
        ],
      },
      { kind: "h2", text: "The steps" },
      {
        kind: "ol",
        items: [
          {
            title: "Clean the device properly",
            body:
              "Wipe the whole surface with the alcohol pad, then let it air-dry for a minute. Any dust left behind will show as a permanent bump — this step is the one people rush and regret.",
          },
          {
            title: "Dry-fit without peeling",
            body:
              "Hold the skin over the device and check the cutouts line up with the camera, ports and buttons. If anything is off by more than a hair, stop and message us before you peel.",
          },
          {
            title: "Peel back one edge only",
            body:
              "Expose about a third of the adhesive. Anchor that edge against a cutout or corner — not the middle of a flat panel — so the rest has a reference.",
          },
          {
            title: "Lay it down in one slow pass",
            body:
              "Pull the backing away as you go and press forward with the squeegee card. Slow is smooth. If a bubble forms, lift back past it and continue.",
          },
          {
            title: "Heat the curves",
            body:
              "Warm the corners, camera rings and any wrap-around edges with the hairdryer on low, then press them down. Heat lets the film relax instead of pulling back later.",
          },
          {
            title: "Leave it alone for an hour",
            body:
              "The adhesive keeps setting after application. No pockets, no cases, no charging pads for the first hour.",
          },
        ],
      },
      { kind: "h2", text: "If something goes wrong" },
      {
        kind: "ul",
        items: [
          "Bubble: lift the nearest edge back past it and re-lay. Do not push it toward the middle.",
          "Dust trapped underneath: lift that section, lift the speck off with a corner of tape, re-lay.",
          "Edge lifting after a few days: warm it for ten seconds and press it back. If it keeps lifting, that is a defect — tell us.",
          "Misaligned beyond saving: stop. Message us a photo and we will replace it.",
        ],
      },
      {
        kind: "note",
        text:
          "Lifting within 30 days of delivery is covered. Send a photo on WhatsApp and we ship a replacement free, no return needed.",
      },
    ],
    cta: { label: "Contact support", href: "/contact" },
  },

  "policies/shipping": {
    kicker: "Policy",
    title: "Shipping.",
    lede:
      "Where we ship, how long it takes, and what it costs.",
    updated: "16 November 2026",
    blocks: [
      {
        kind: "table",
        rows: [
          ["Processing time", "1–2 business days from order confirmation"],
          ["Metro delivery", "2–4 business days after dispatch"],
          ["Rest of India", "4–7 business days after dispatch"],
          ["Shipping charge", "₹49 flat, free on orders over ₹499"],
          ["Tracking", "Emailed and sent on WhatsApp at dispatch"],
          ["Serviceable area", "All India PIN codes; international not yet available"],
        ],
      },
      { kind: "h2", text: "Custom and requested models" },
      {
        kind: "p",
        text:
          "A skin cut to request is quoted with its own timeline, usually about a week before dispatch. We confirm the date in writing before taking payment.",
      },
      { kind: "h2", text: "Delays outside our control" },
      {
        kind: "p",
        text:
          "Courier strikes, weather and festival-season backlogs add days we cannot predict. If a parcel has not moved in 72 hours we chase the courier on your behalf; if it is lost, we re-ship at our cost.",
      },
      { kind: "h2", text: "Wrong or incomplete address" },
      {
        kind: "p",
        text:
          "We ship to the address as entered. If a parcel returns to us undelivered because of an incorrect address, we re-ship once you confirm the correct one and cover the second shipping charge.",
      },
    ],
  },

  "policies/returns": {
    kicker: "Policy",
    title: "Returns and exchanges.",
    lede:
      "Skins are cut to a specific device, so this policy is narrower than a generic store's — here is exactly what is and is not covered.",
    updated: "16 November 2026",
    blocks: [
      { kind: "h2", text: "Covered" },
      {
        kind: "ul",
        items: [
          "Unopened skins returned within 7 days of delivery, for any reason.",
          "A miscut or mis-labelled skin — replaced free, no return needed, just send a photo.",
          "Edges lifting within 30 days of delivery — replaced free.",
          "Anything damaged in transit.",
          "Wrong item shipped.",
        ],
      },
      { kind: "h2", text: "Not covered" },
      {
        kind: "ul",
        items: [
          "A skin already applied to a device, unless it is defective.",
          "Ordering the wrong model — we cut what you selected, and the cut is not reusable.",
          "Damage from application error, such as tearing it during removal.",
          "Normal wear after 30 days.",
        ],
      },
      { kind: "h2", text: "How to start one" },
      {
        kind: "ol",
        items: [
          {
            title: "Message us within the window",
            body:
              "WhatsApp or email with your order number and a photo of the issue. A photo resolves most cases immediately.",
          },
          {
            title: "We confirm the outcome",
            body:
              "Replacement, refund or return instructions, in writing, usually the same business day.",
          },
          {
            title: "Refunds go back to source",
            body:
              "Razorpay returns the money to the original payment method in 5–7 business days. We cannot redirect it elsewhere.",
          },
        ],
      },
      {
        kind: "note",
        text:
          "Picked the wrong model? Tell us before we cut it — if the order has not entered production we will switch it at no charge.",
      },
    ],
  },

  "policies/privacy": {
    kicker: "Policy",
    title: "Privacy.",
    lede:
      "What we collect, why, and who else sees it. Short version: order data only, and we do not sell it.",
    updated: "16 November 2026",
    blocks: [
      { kind: "h2", text: "What we collect" },
      {
        kind: "table",
        rows: [
          ["Account", "Name, email, phone, hashed password"],
          ["Orders", "Shipping address, items, order history"],
          ["Payments", "Razorpay transaction ids and status only — never card numbers"],
          ["Support", "Messages you send us and our replies"],
          ["Analytics", "Aggregate page views; no cross-site advertising trackers"],
        ],
      },
      { kind: "h2", text: "Why" },
      {
        kind: "ul",
        items: [
          "To cut, pack and deliver the order you placed.",
          "To take payment and handle refunds.",
          "To answer support messages and honour the replacement policy.",
          "To meet GST invoicing and record-keeping obligations.",
        ],
      },
      { kind: "h2", text: "Who else sees it" },
      {
        kind: "p",
        text:
          "Razorpay processes payments and receives the amount, your contact details and the order reference. A courier receives the shipping address. Nobody else, and we do not sell or rent your data to anyone.",
      },
      { kind: "h2", text: "Card details" },
      {
        kind: "p",
        text:
          "Card and UPI credentials are entered on Razorpay's PCI-DSS environment and never reach our servers. We store only the transaction reference and its status.",
      },
      { kind: "h2", text: "Your choices" },
      {
        kind: "ul",
        items: [
          "Ask for a copy of your data, or for it to be corrected, at any time.",
          "Ask for your account to be deleted — we keep only the invoice records tax law requires.",
          "Unsubscribe from marketing email with one click; order emails continue regardless.",
        ],
      },
    ],
    cta: { label: "Ask us about your data", href: "/contact" },
  },

  "policies/terms": {
    kicker: "Policy",
    title: "Terms of service.",
    lede:
      "The agreement between you and Epro Gadgets when you order from this site.",
    updated: "16 November 2026",
    blocks: [
      { kind: "h2", text: "Orders" },
      {
        kind: "p",
        text:
          "An order is an offer to buy. It becomes a contract when we confirm it by email. If a listing shows a wrong price or a model we cannot actually cut, we may cancel and refund in full before dispatch — we will tell you why.",
      },
      { kind: "h2", text: "Prices and tax" },
      {
        kind: "p",
        text:
          "All prices are in Indian rupees and inclusive of GST. The tax component is shown at checkout and itemised on your invoice. Shipping is added separately where it applies.",
      },
      { kind: "h2", text: "Fit and suitability" },
      {
        kind: "p",
        text:
          "You are responsible for selecting the correct device model. We cut to the model you choose, and a cut skin cannot be reused for another device. Check the model before paying.",
      },
      { kind: "h2", text: "Protection claims" },
      {
        kind: "p",
        text:
          "A skin is a 0.2 mm film. It resists scratches and scuffs. It is not drop protection, not waterproofing, and we make no claim that it prevents damage from impact or liquid.",
      },
      { kind: "h2", text: "Intellectual property" },
      {
        kind: "p",
        text:
          "Our designs, photographs and site content are ours. Device brand names appear only to identify which model a skin fits; we are not affiliated with, endorsed by or sponsored by those manufacturers.",
      },
      { kind: "h2", text: "Liability" },
      {
        kind: "p",
        text:
          "Our liability for any order is limited to the amount you paid for it. We are not liable for damage to a device caused by incorrect application contrary to the instructions we supply.",
      },
      { kind: "h2", text: "Governing law" },
      {
        kind: "p",
        text:
          "These terms are governed by the laws of India, and disputes fall to the courts of Kerala.",
      },
    ],
  },
};

export function getContent(key: string): ContentDoc {
  const doc = CONTENT[key];
  if (!doc) throw new Error(`Missing content doc: ${key}`);
  return doc;
}
