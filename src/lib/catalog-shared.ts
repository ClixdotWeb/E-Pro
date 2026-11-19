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

export const FINISH_LABEL: Record<string, string> = {
  "printed-designs": "Printed Designs",
  "design-patterns": "Design Patterns",
  "solid-pattern": "Solid Pattern",
  texture: "Texture",
  embossed: "Embossed",
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
