import "server-only";
import { db } from "./db";
import type { MoneyRules } from "./pricing";

/**
 * Everything the shop owner can change that is not a product.
 *
 * The money rules, the contact details and the homepage copy were
 * constants in half a dozen files, which meant "put the free
 * shipping threshold up to 699" was a code change and a deploy.
 * They live in one table now, one row per setting, so adding a
 * setting is a write rather than a migration.
 *
 * Every value is a string on the way in and out. A settings table
 * that tries to be typed ends up with a column per type and a
 * discriminator, and the typing belongs here anyway - the defaults
 * below are the schema, and a value that cannot be parsed falls back
 * to its default rather than taking the shop down.
 *
 * Read on the server only. Anything the browser needs is passed down
 * as a prop, which keeps the whole table - including the parts that
 * are nobody's business - out of the bundle.
 */

export const SETTING_DEFAULTS = {
  /* ---- money ---- */
  "shipping.flatPaise": "4900",
  "shipping.freeOverPaise": "49900",
  "tax.gstBps": "1800",

  /* ---- contact ---- */
  "contact.whatsapp": "919562470470",
  "contact.whatsappDisplay": "+91 95624 70470",
  "contact.email": "hello@eprogadgets.com",
  "contact.phone": "+91 95624 70470",
  "contact.instagram": "http://instagram.com/eprogadgets",
  "contact.youtube": "https://www.youtube.com/@eprogadgets",

  /* ---- what we cut ---- */
  // Brands whose logo a customer may choose to keep showing. Apple
  // is the only one today; the rule used to be hard-coded as
  // "phone and iPhone" in two files.
  "cut.logoCutoutBrands": "iphone,apple",

  /* ---- homepage ---- */
  "home.heroHeading": "Cut to the millimetre.",
  "home.heroBlurb": "Precision-cut skins for your exact device.",
  "home.videoDesktop": "/brand/video/hero-desktop.mp4",
  "home.videoMobile": "/brand/video/hero-mobile.mp4",
  "home.customersHeading": "Real Customers - Real Skins",
  "home.customersBlurb":
    "Want to see real photos and videos of our products?",
  "home.beforeImage": "/brand/Untitled_design_3.png",
  "home.afterImage": "/brand/Untitled_design_2.png",

  /* ---- footer ---- */
  "footer.blurb":
    "Every day is an evolution. Since our launch in 2013, we have explored and curated the tools for your continual transformation - on an emotional, physical, intellectual and spiritual level.",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export type Settings = Record<SettingKey, string>;

/** Every setting, with the defaults filled in for anything unset. */
export async function getSettings(): Promise<Settings> {
  const out = { ...SETTING_DEFAULTS } as Settings;

  try {
    const rows = await db.setting.findMany();
    for (const row of rows) {
      if (row.key in out) out[row.key as SettingKey] = row.value;
    }
  } catch {
    // A settings table that is unreachable must not take the shop
    // down - the defaults are the ones that shipped.
  }

  return out;
}

export async function getSetting(key: SettingKey): Promise<string> {
  try {
    const row = await db.setting.findUnique({ where: { key } });
    return row?.value ?? SETTING_DEFAULTS[key];
  } catch {
    return SETTING_DEFAULTS[key];
  }
}

/** Whole numbers, with the default when the stored value is nonsense. */
export function asInt(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

/* ---------------- the shapes callers actually want ---------------- */

export function moneyRulesFrom(s: Settings): MoneyRules {
  return {
    flatShippingInPaise: asInt(s["shipping.flatPaise"], 4900),
    freeShippingOverPaise: asInt(s["shipping.freeOverPaise"], 49900),
    gstBps: asInt(s["tax.gstBps"], 1800),
  };
}

export async function getMoneyRules(): Promise<MoneyRules> {
  return moneyRulesFrom(await getSettings());
}

/**
 * Brands that get asked about the logo.
 *
 * Matched against the brand's url slug, so the price lists' "iPhone"
 * and the customer-facing "Apple" both work.
 */
export function logoCutoutBrandsFrom(s: Settings): string[] {
  return s["cut.logoCutoutBrands"]
    .split(",")
    .map((b) => b.trim().toLowerCase())
    .filter(Boolean);
}
