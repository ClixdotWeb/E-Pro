/**
 * One-shot importer: Shopify public storefront JSON -> typed catalog module.
 *
 * Shopify exposes /products.json and /collections/<handle>/products.json
 * without authentication, so this runs with no API keys. Re-run it whenever
 * the Shopify catalog changes, until the Postgres catalog becomes the
 * source of truth — at which point this script seeds the DB instead.
 *
 * Usage:
 *   node scripts/import-shopify.mjs <raw-dir> [out-file]
 *
 * <raw-dir> must contain products.json, collections.json and a
 * collections/<handle>.json per non-empty collection.
 */

import fs from "node:fs";
import path from "node:path";

const rawDir = process.argv[2];
const outFile =
  process.argv[3] ?? path.join("src", "lib", "catalog.generated.ts");

if (!rawDir) {
  console.error("usage: node scripts/import-shopify.mjs <raw-dir> [out-file]");
  process.exit(1);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const products = readJson(path.join(rawDir, "products.json")).products;
const collections = readJson(path.join(rawDir, "collections.json")).collections;

/* ---------- collection membership ---------- */

const collectionsDir = path.join(rawDir, "collections");
/** handle -> Set<product handle> */
const membership = new Map();

if (fs.existsSync(collectionsDir)) {
  for (const file of fs.readdirSync(collectionsDir)) {
    if (!file.endsWith(".json")) continue;
    const handle = file.replace(/\.json$/, "");
    try {
      const list = readJson(path.join(collectionsDir, file)).products ?? [];
      membership.set(handle, new Set(list.map((p) => p.handle)));
    } catch {
      // A rate-limited fetch leaves a truncated file; skip it rather than
      // silently importing an empty collection as "no products".
      console.warn(`  ! skipped unreadable collection: ${file}`);
    }
  }
}

/* ---------- classification ---------- */

const CATEGORY_BY_PRODUCT_TYPE = {
  lens: "lens",
  camera: "camera",
  laptop: "laptop",
  phone: "phone",
  tablet: "tablet",
  drone: "drone",
  gimbal: "gimbal",
  charger: "charger",
};

// Shopify option names in this store are inconsistent ("camera  brand" has
// two spaces, "lap brand", "Mobile Brands"), so match loosely.
const CATEGORY_BY_OPTION = [
  [/lens/i, "lens"],
  [/camera|cam\b/i, "camera"],
  [/lap(top)?\b/i, "laptop"],
  [/mobile|phone/i, "phone"],
  [/tab(let)?\b/i, "tablet"],
  [/drone/i, "drone"],
  [/gimbal/i, "gimbal"],
  [/console|gaming/i, "gaming-consoles"],
  [/earbud|buds/i, "wireless-earbuds"],
  [/charger/i, "charger"],
];

const CATEGORY_BY_TITLE = [
  [/\blens\b|lenss+/i, "lens"],
  [/\bcam(era)?\b/i, "camera"],
  [/\blap\b|laptop/i, "laptop"],
  [/mobile|phone/i, "phone"],
  [/tab\b/i, "tablet"],
];

const FINISH_BY_COLLECTION = [
  [/^design-pattern/, "design-patterns"],
  [/^printed-design/, "printed-designs"],
  [/^s?oild-pattern|^solid-pattern/, "solid-pattern"],
  [/^texture/, "texture"],
  [/^embossed|^empossed/, "embossed"],
];

const FINISH_BY_TITLE = [
  [/emboss/i, "embossed"],
  [/carbon|honeycomb|forged|kevlar|lether|leather/i, "texture"],
  [/neon|dragon|print/i, "printed-designs"],
  [/pattern/i, "design-patterns"],
];

/** Test/placeholder rows that must never reach a storefront. */
const JUNK_TITLE =
  /^(a{3,}|[a-z]{1,6})$|aaaa|werdx|cfnv|ssss|^test|^asd|^qwe|^\d+$/i;

function categoryFor(product) {
  const type = (product.product_type ?? "").trim().toLowerCase();
  if (CATEGORY_BY_PRODUCT_TYPE[type]) return CATEGORY_BY_PRODUCT_TYPE[type];

  for (const opt of product.options ?? []) {
    for (const [re, cat] of CATEGORY_BY_OPTION) {
      if (re.test(opt.name)) return cat;
    }
  }

  for (const [re, cat] of CATEGORY_BY_TITLE) {
    if (re.test(product.title)) return cat;
  }

  return null;
}

function finishFor(product) {
  for (const [handle, handles] of membership) {
    if (!handles.has(product.handle)) continue;
    for (const [re, finish] of FINISH_BY_COLLECTION) {
      if (re.test(handle)) return finish;
    }
  }
  for (const [re, finish] of FINISH_BY_TITLE) {
    if (re.test(product.title)) return finish;
  }
  return null;
}

/** "Model" options carry real device names; brand options carry brands. */
function modelsFor(product) {
  const modelOption = (product.options ?? []).find((o) =>
    /^model$/i.test(o.name.trim()),
  );
  if (!modelOption) return [];
  return modelOption.values
    .map((v) => String(v).trim())
    .filter((v) => v && !/^default title$/i.test(v));
}

const toPaise = (price) => Math.round(Number(price) * 100);

/* ---------- transform ---------- */

const imported = [];
const skipped = [];

for (const p of products) {
  const reasons = [];

  if (JUNK_TITLE.test(p.title.trim())) reasons.push("placeholder title");

  // Prices are imported exactly as Shopify has them, including 0.00 and
  // obvious test values, on the store owner's instruction. Suspicious
  // ones are flagged per product instead of dropped, so nothing vanishes
  // silently and they can be corrected in Shopify afterwards.
  const variants = p.variants ?? [];
  if (variants.length === 0) reasons.push("no variants at all");

  const category = categoryFor(p);
  if (!category) reasons.push("no device category");

  const images = (p.images ?? []).map((im) => im.src);
  if (images.length === 0) reasons.push("no images");

  // Only a placeholder title or a total absence of variants blocks the
  // import. A missing category or photo is carried through as a flag.
  const blocking = reasons.filter(
    (r) => r === "placeholder title" || r === "no variants at all",
  );

  if (blocking.length > 0) {
    skipped.push({ title: p.title, reasons });
    continue;
  }

  const prices = variants.map((v) => toPaise(v.price));

  const SUSPICIOUS_PAISE = 10000; // anything under ₹100 is almost certainly a test value

  imported.push({
    slug: p.handle,
    shopifyId: p.id,
    title: p.title.trim(),
    category,
    finish: finishFor(p),
    suspiciousPrices: variants
      .filter((v) => toPaise(v.price) < SUSPICIOUS_PAISE)
      .map((v) => ({ variant: String(v.title).trim(), price: v.price })),
    description: (p.body_html ?? "").replace(/<[^>]*>/g, "").trim(),
    images,
    models: modelsFor(p),
    minPriceInPaise: Math.min(...prices),
    maxPriceInPaise: Math.max(...prices),
    variants: variants.map((v) => ({
      shopifyId: v.id,
      title: String(v.title).trim(),
      priceInPaise: toPaise(v.price),
      available: Boolean(v.available),
      sku: v.sku ?? null,
    })),
    missingImages: images.length === 0,
    needsFinish: finishFor(p) === null,
  });
}

/* ---------- emit ---------- */

const banner = `// GENERATED FILE - do not edit by hand.
// Source: Shopify public storefront JSON (jaka1n-rd.myshopify.com)
// Regenerate: node scripts/import-shopify.mjs <raw-dir>
//
// Imported ${imported.length} of ${products.length} products.
// Skipped ${skipped.length} (see import report).
`;

const types = `
export type ImportedVariant = {
  shopifyId: number;
  title: string;
  priceInPaise: number;
  available: boolean;
  sku: string | null;
};

export type ImportedProduct = {
  slug: string;
  shopifyId: number;
  title: string;
  category: string | null;
  finish: string | null;
  description: string;
  images: string[];
  models: string[];
  minPriceInPaise: number;
  maxPriceInPaise: number;
  variants: ImportedVariant[];
  /** true when Shopify has no photo yet - render the swatch fallback */
  missingImages: boolean;
  /** true when no collection told us the finish - needs a human */
  needsFinish: boolean;
  /** variants priced under 100 rupees - imported as-is, verify in Shopify */
  suspiciousPrices: { variant: string; price: string }[];
};
`;

const body = `
export const IMPORTED_PRODUCTS: ImportedProduct[] = ${JSON.stringify(
  imported,
  null,
  2,
)};

export const IMPORT_STATS = {
  sourceProducts: ${products.length},
  sourceCollections: ${collections.length},
  imported: ${imported.length},
  skipped: ${skipped.length},
  missingImages: ${imported.filter((p) => p.missingImages).length},
  needsFinish: ${imported.filter((p) => p.needsFinish).length},
  needsCategory: ${imported.filter((p) => !p.category).length},
  withSuspiciousPrices: ${imported.filter((p) => p.suspiciousPrices.length > 0).length},
  totalVariants: ${imported.reduce((n, p) => n + p.variants.length, 0)},
} as const;
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, banner + types + body);

/* ---------- report ---------- */

console.log(`\nSource: ${products.length} products, ${collections.length} collections`);
console.log(`Collection membership loaded for ${membership.size} collections\n`);

console.log(`IMPORTED (${imported.length}):`);
for (const p of imported) {
  const flags = [
    p.missingImages ? "NO IMAGE" : null,
    p.needsFinish ? "NO FINISH" : null,
    p.category ? null : "NO CATEGORY",
    p.suspiciousPrices.length ? `${p.suspiciousPrices.length} LOW PRICE` : null,
  ]
    .filter(Boolean)
    .join(", ");
  console.log(
    `  ${p.title.padEnd(22)} ${(p.category ?? "-").padEnd(10)} ${String(p.variants.length).padStart(3)} variants  ₹${(p.minPriceInPaise / 100).toFixed(0)}-${(p.maxPriceInPaise / 100).toFixed(0)}${flags ? "  [" + flags + "]" : ""}`,
  );
}

console.log(`\nSKIPPED (${skipped.length}):`);
for (const s of skipped) {
  console.log(`  ${s.title.padEnd(22)} ${s.reasons.join(", ")}`);
}

console.log(`\nWrote ${outFile}`);
