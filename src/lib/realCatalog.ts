import {
  IMPORTED_PRODUCTS,
  IMPORT_STATS,
  type ImportedProduct,
  type ImportedVariant,
} from "./catalog.generated";

export { IMPORT_STATS };
export type { ImportedProduct, ImportedVariant };

/**
 * Adapter over the imported Shopify catalog.
 *
 * The source catalog is structurally inconsistent, because that is how the
 * Shopify store was built: a lens product's variants are lens MODELS, a
 * camera product's variants are BRANDS, one product's variants are price
 * tiers ("price 1100"), and some are just "Default Title". Rather than
 * pretend otherwise, everything is flattened into one searchable list of
 * (product, variant) pairs so a customer can reach any buyable thing from
 * a single input instead of walking a category tree.
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

/** A single buyable thing: one variant of one product. */
export type Offer = {
  id: string;
  productSlug: string;
  productTitle: string;
  category: string | null;
  categoryLabel: string;
  finish: string | null;
  /** what the variant actually names - a model, a brand, or a tier */
  variantTitle: string;
  priceInPaise: number;
  available: boolean;
  imageUrl: string | null;
  /** lowercased haystack for matching */
  search: string;
};

/** Variant titles that are placeholders rather than a real choice. */
const NOISE_VARIANT = /^(default title|test|untitled|[0-9]+)$/i;

function toOffer(p: ImportedProduct, v: ImportedVariant): Offer {
  const categoryLabel = p.category
    ? (CATEGORY_LABEL[p.category] ?? p.category)
    : "Uncategorised";

  return {
    id: `${p.slug}:${v.shopifyId}`,
    productSlug: p.slug,
    productTitle: p.title,
    category: p.category,
    categoryLabel,
    finish: p.finish,
    variantTitle: v.title,
    priceInPaise: v.priceInPaise,
    available: v.available,
    imageUrl: p.images[0] ?? null,
    search: [
      p.title,
      v.title,
      categoryLabel,
      p.finish ? FINISH_LABEL[p.finish] : "",
      v.sku ?? "",
    ]
      .join(" ")
      .toLowerCase(),
  };
}

export const OFFERS: Offer[] = IMPORTED_PRODUCTS.flatMap((p) =>
  p.variants.map((v) => toOffer(p, v)),
);

/** Offers worth putting in front of a customer. */
export const BUYABLE_OFFERS: Offer[] = OFFERS.filter(
  (o) => !NOISE_VARIANT.test(o.variantTitle.trim()),
);

export const CATEGORIES: { slug: string; label: string; count: number }[] =
  Object.entries(
    BUYABLE_OFFERS.reduce<Record<string, number>>((acc, o) => {
      const key = o.category ?? "uncategorised";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([slug, count]) => ({
      slug,
      label: CATEGORY_LABEL[slug] ?? "Uncategorised",
      count,
    }))
    .sort((a, b) => b.count - a.count);

/**
 * Ranked search across every offer. Scoring is deliberately simple and
 * deterministic: a prefix hit on the variant name beats a hit buried in
 * the product title, because someone typing "24-70" wants the lens, not
 * every Sony product.
 */
export function searchOffers(
  query: string,
  options: { category?: string | null; limit?: number } = {},
): Offer[] {
  const { category, limit = 40 } = options;
  const q = query.trim().toLowerCase();

  let pool = BUYABLE_OFFERS;
  if (category && category !== "all") {
    pool = pool.filter((o) => (o.category ?? "uncategorised") === category);
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

  // Every whitespace-separated term must appear somewhere.
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
    // Prefer the shorter label when scores tie - it is the more specific match.
    score -= Math.min(10, variant.length / 12);

    scored.push({ offer, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.offer);
}

export function getProductBySlug(slug: string): ImportedProduct | undefined {
  return IMPORTED_PRODUCTS.find((p) => p.slug === slug);
}

export function offersForProduct(slug: string): Offer[] {
  return BUYABLE_OFFERS.filter((o) => o.productSlug === slug);
}

export function offersForCategory(category: string): Offer[] {
  return BUYABLE_OFFERS.filter(
    (o) => (o.category ?? "uncategorised") === category,
  );
}

/** Distinct products within a category, for grid views. */
export function productsForCategory(category: string): ImportedProduct[] {
  return IMPORTED_PRODUCTS.filter(
    (p) => (p.category ?? "uncategorised") === category,
  );
}

export function priceRange(p: ImportedProduct): [number, number] {
  return [p.minPriceInPaise, p.maxPriceInPaise];
}

/** Stable pseudo-random swatch so imageless products still look intentional. */
export function swatchFor(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = h % 360;
  const alt = (hue + 28) % 360;
  return [`hsl(${hue} 18% 14%)`, `hsl(${alt} 22% 32%)`];
}

/** Known camera/lens brand names, used to name the variant axis. */
const BRAND_WORDS = new Set([
  "sony",
  "canon",
  "nikon",
  "fujifilm",
  "fuji",
  "panasonic",
  "olympus",
  "sigma",
  "tamron",
  "leica",
  "pentax",
  "samyang",
  "tokina",
  "hp",
  "dell",
  "lenovo",
  "asus",
  "acer",
  "apple",
  "msi",
  "samsung",
]);

/**
 * What a product's variants actually name.
 *
 * The Shopify store is inconsistent about this - one product's variants
 * are lens models, another's are camera brands, another's are price
 * tiers - so it is derived from the values rather than trusted from the
 * option name, which is often misspelt ("lap brand", "camera  brand").
 */
export function optionLabelFor(p: ImportedProduct): string {
  const titles = p.variants.map((v) => v.title.trim().toLowerCase());
  if (titles.length === 0) return "Option";

  const brandHits = titles.filter((t) => BRAND_WORDS.has(t)).length;
  if (brandHits >= Math.max(2, titles.length * 0.6)) return "Brand";

  if (titles.every((t) => /^price\s|^\u20b9|^\d+$/.test(t))) return "Size";

  return "Model";
}

/** Other products a customer might plausibly want next. */
export function relatedProducts(
  p: ImportedProduct,
  limit = 4,
): ImportedProduct[] {
  const sameCategory = IMPORTED_PRODUCTS.filter(
    (o) => o.slug !== p.slug && o.category === p.category,
  );
  const rest = IMPORTED_PRODUCTS.filter(
    (o) => o.slug !== p.slug && o.category !== p.category,
  );

  // Prefer products with a photo - a related rail of grey swatches sells
  // nothing.
  const byPhoto = (a: ImportedProduct, b: ImportedProduct) =>
    Number(Boolean(b.images[0])) - Number(Boolean(a.images[0]));

  return [...sameCategory.sort(byPhoto), ...rest.sort(byPhoto)].slice(0, limit);
}

export const ALL_PRODUCTS = IMPORTED_PRODUCTS;

/**
 * Navigation shape for the header, footer and 404.
 *
 * Lists every device the store sells - including the ones with nothing
 * in them yet - because the menu is also how a customer discovers that
 * we cut drones at all. `count` is zero for those, and the UI sends them
 * to /request-model instead of an empty grid.
 *
 * `finishes` holds only the finishes that genuinely exist within that
 * category in the imported data. Most are empty: in Shopify the finish
 * collections overlap and the products carry no finish option, so there
 * is nothing honest to list.
 */
export const NAV_CATEGORIES: {
  slug: string;
  name: string;
  count: number;
  finishes: string[];
}[] = Object.keys(CATEGORY_LABEL).map((slug) => {
  const products = IMPORTED_PRODUCTS.filter((p) => p.category === slug);
  const finishes = [
    ...new Set(
      products
        .map((p) => p.finish)
        .filter((f): f is string => Boolean(f && FINISH_LABEL[f])),
    ),
  ];

  return {
    slug,
    name: CATEGORY_LABEL[slug],
    count: offersForCategory(slug).length,
    finishes,
  };
});

/** Finish collections that have at least one product behind them. */
export const NAV_FINISHES: { slug: string; name: string; count: number }[] =
  Object.keys(FINISH_LABEL)
    .map((slug) => ({
      slug,
      name: FINISH_LABEL[slug],
      count: IMPORTED_PRODUCTS.filter((p) => p.finish === slug).length,
    }))
    .filter((f) => f.count > 0);

/**
 * Offers a customer can actually add to the cart right now: a real
 * option name AND in stock.
 *
 * BUYABLE_OFFERS only strips placeholder names ("Default Title",
 * "test", bare numbers) - it says nothing about stock. The dashboard
 * was labelling that count "in stock and priced", which was wrong by
 * 14 options, so the two are kept separate and named for what they
 * are.
 */
export const IN_STOCK_OFFERS: Offer[] = BUYABLE_OFFERS.filter(
  (o) => o.available,
);
