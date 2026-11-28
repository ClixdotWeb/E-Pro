/**
 * Catalogue vocabulary and helpers with no data in them.
 *
 * Everything here is a constant or a pure function, so it is safe to
 * import from a client component. The data itself lives in
 * `catalog.ts`, which talks to the database and is server-only.
 *
 * Splitting them this way is what lets the header, the finder and the
 * admin tables keep importing labels without dragging Prisma into the
 * browser bundle.
 */

export const CATEGORY_LABEL: Record<string, string> = {
  phone: "Phone",
  laptop: "Laptop",
  camera: "Camera",
  lens: "Lens",
  tablet: "Tablet",
  gimbal: "Gimbal",
  drone: "Drone",
  "gaming-consoles": "Gaming Console",
  "wireless-earbuds": "Wireless Earbuds",
  charger: "Charger",
};

/**
 * The finishes actually sold, taken from the price lists in
 * prisma/data - not from the old Shopify theme, whose names
 * ("Design Patterns", "Embossed") never matched what the sheets
 * quote a price for.
 *
 * The last three are phone-only. A phone skin is priced by how much
 * of the body it covers rather than by material, so the sheets list
 * coverage where the camera and lens sheets list a finish. They sit
 * in the same map because they do the same job: they are the thing a
 * customer picks before a model.
 */
export const FINISH_LABEL: Record<string, string> = {
  "printed-skin": "Printed Skin",
  "variable-lamination": "Variable Lamination",
  "korean-skin": "Korean Skin",
  "imported-skin": "Imported Skin",
  "3m-skin": "3M Skin",
  "full-wrap": "Full Wrap",
  "back-with-sides": "Back With Sides",
  "back-only": "Back Only",
};

export const UNCATEGORISED = "uncategorised";

/* ---------------- types ---------------- */

export type CatalogVariant = {
  id: string;
  /** what the customer picks: a model, a brand, sometimes a tier */
  title: string;
  priceInPaise: number;
  stock: number;
  available: boolean;
  sku: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string | null;
  finish: string | null;
  /** DRAFT | ACTIVE | ARCHIVED. Only ACTIVE is shown to customers. */
  status: string;
  images: string[];
  variants: CatalogVariant[];
  minPriceInPaise: number;
  maxPriceInPaise: number;
  /** true when there is no photo - render the swatch instead */
  missingImages: boolean;
  /** variants priced under 100 rupees, worth a second look */
  suspiciousPrices: { variant: string; price: string }[];
};

/** A single buyable thing: one variant of one product. */
export type Offer = {
  id: string;
  productSlug: string;
  productTitle: string;
  category: string | null;
  categoryLabel: string;
  finish: string | null;
  variantTitle: string;
  priceInPaise: number;
  available: boolean;
  imageUrl: string | null;
  /** lowercased haystack for matching */
  search: string;
};

export type NavCategory = {
  slug: string;
  name: string;
  count: number;
  finishes: string[];
};

/* ---------------- helpers ---------------- */

/** Stable pseudo-random swatch so imageless products look intentional. */
export function swatchFor(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = h % 360;
  const alt = (hue + 28) % 360;
  return [`hsl(${hue} 18% 14%)`, `hsl(${alt} 22% 32%)`];
}

/** Known camera/lens/laptop brand names, used to name the option axis. */
const BRAND_WORDS = new Set([
  "sony", "canon", "nikon", "fujifilm", "fuji", "panasonic", "olympus",
  "sigma", "tamron", "leica", "pentax", "samyang", "tokina", "hp",
  "dell", "lenovo", "asus", "acer", "apple", "msi", "samsung",
]);

/**
 * What a product's variants actually name.
 *
 * The source catalogue is inconsistent - one product's variants are
 * lens models, another's are camera brands, another's are price tiers
 * - so this is derived from the values rather than trusted from an
 * option name that is often misspelt ("lap brand", "camera  brand").
 */
export function optionLabelFor(p: {
  variants: { title: string }[];
}): string {
  const titles = p.variants.map((v) => v.title.trim().toLowerCase());
  if (titles.length === 0) return "Option";

  const brandHits = titles.filter((t) => BRAND_WORDS.has(t)).length;
  if (brandHits >= Math.max(2, titles.length * 0.6)) return "Brand";

  if (titles.every((t) => /^price\s|^₹|^\d+$/.test(t))) return "Size";

  return "Model";
}

/** Variant titles that are placeholders rather than a real choice. */
export const NOISE_VARIANT = /^(default title|test|untitled|[0-9]+)$/i;

export function categoryLabel(slug: string | null): string {
  if (!slug) return "Uncategorised";
  return CATEGORY_LABEL[slug] ?? slug;
}

/**
 * Ranked search across offers. Deliberately simple and deterministic:
 * a prefix hit on the option name beats one buried in the product
 * title, because someone typing "24-70" wants the lens, not every
 * Sony product.
 */
export function rankOffers(
  offers: Offer[],
  query: string,
  options: { category?: string | null; limit?: number } = {},
): Offer[] {
  const { category, limit = 40 } = options;
  const q = query.trim().toLowerCase();

  let pool = offers;
  if (category && category !== "all") {
    pool = pool.filter((o) => (o.category ?? UNCATEGORISED) === category);
  }

  if (!q) {
    return [...pool]
      .sort(
        (a, b) =>
          Number(b.available) - Number(a.available) ||
          a.productTitle.localeCompare(b.productTitle) ||
          a.variantTitle.localeCompare(b.variantTitle),
      )
      .slice(0, limit);
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { offer: Offer; score: number }[] = [];

  for (const offer of pool) {
    if (!terms.every((t) => offer.search.includes(t))) continue;

    const variant = offer.variantTitle.toLowerCase();
    const product = offer.productTitle.toLowerCase();

    let score = 0;
    if (variant === q) score += 100;
    if (variant.startsWith(q)) score += 50;
    if (variant.includes(q)) score += 25;
    if (product.startsWith(q)) score += 15;
    if (product.includes(q)) score += 8;
    if (offer.available) score += 5;
    if (offer.imageUrl) score += 2;
    // Prefer the shorter label on a tie - it is the more specific match.
    score -= Math.min(10, variant.length / 12);

    scored.push({ offer, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.offer);
}

/* ================= browsing by device ================= */

/**
 * The shop is browsed the way a customer thinks: device, then brand,
 * then their exact model, then what the skin should be. A skin cut for
 * the wrong model is scrap, so the model comes before the design -
 * the opposite of the old Shopify flow, which asked for a design first
 * and left the model to a dropdown at the end.
 *
 *   /skins/phone                      the brands
 *   /skins/phone/samsung              the 236 Samsungs, searchable
 *   /skins/phone/samsung/galaxy-s24   the one page that sells
 *
 * The slug parts are derived, not stored. A model's name is unique
 * inside its brand - all 1302 of them produce distinct URLs - so there
 * is nothing to migrate and nothing to keep in sync.
 */

export function urlSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Brand names as the price lists type them, mapped to what a customer
 * would call the company. The sheets say "iPhone" where they mean
 * Apple, "mi" where they mean Xiaomi, and shout FUJIFILM and REDMI.
 * Anything not listed is shown as typed.
 */
export const BRAND_LABEL: Record<string, string> = {
  iphone: "Apple",
  mi: "Xiaomi",
  redmi: "Redmi",
  motorola: "Motorola",
  fujifilm: "Fujifilm",
  iqoo: "iQOO",
  dji: "DJI",
  oneplus: "OnePlus",
};

export function brandLabel(brand: string): string {
  return BRAND_LABEL[urlSlug(brand)] ?? brand;
}

/**
 * The order brands are offered in.
 *
 * Not alphabetical, and not by how many models we cut - that would
 * put Apple eighth behind Poco, because Samsung and Realme ship
 * forty phones a year and Apple ships four. This is roughly how
 * often someone walks in holding one.
 *
 * Anything not named here follows, alphabetically.
 *
 * Both spellings of the two renamed brands are listed, because this
 * is asked both before and after BRAND_LABEL has had its way: the
 * price lists say "iPhone" and "mi", a customer reads Apple and
 * Xiaomi, and ranking only one of the pair silently dropped Apple to
 * the end of the row.
 */
const BRAND_ORDER = [
  "apple",
  "iphone",
  "samsung",
  "oneplus",
  "xiaomi",
  "mi",
  "redmi",
  "poco",
  "realme",
  "vivo",
  "iqoo",
  "oppo",
  "google",
  "nothing",
  "motorola",
  // camera and lens
  "canon",
  "sony",
  "nikon",
  "fujifilm",
  "panasonic",
  "sigma",
  "tamron",
  "samyang",
  "viltrox",
  "dji",
  "zhiyun",
];

export function brandRank(brand: string): number {
  const i = BRAND_ORDER.indexOf(urlSlug(brand));
  return i === -1 ? BRAND_ORDER.length : i;
}

export function compareBrands(a: string, b: string): number {
  const d = brandRank(a) - brandRank(b);
  return d !== 0 ? d : brandLabel(a).localeCompare(brandLabel(b));
}

/**
 * Apple puts its logo on the back of every iPhone, and a lot of
 * people want it left showing.
 *
 * Which brands get asked is a setting now, not a rule in this file -
 * the shop owner may well start cutting around the Nothing glyph.
 * The list is passed in, and the default is what the rule used to
 * be hard-coded as.
 */
export const DEFAULT_LOGO_CUTOUT_BRANDS = ["iphone", "apple"];

export function offersLogoCutout(
  category: string,
  brand: string,
  brands: string[] = DEFAULT_LOGO_CUTOUT_BRANDS,
): boolean {
  return category === "phone" && brands.includes(urlSlug(brand));
}

