import "server-only";
import { db } from "./db";
import {
  CATEGORY_LABEL,
  FINISH_LABEL,
  NOISE_VARIANT,
  UNCATEGORISED,
  categoryLabel,
  type CatalogProduct,
  type NavCategory,
  type Offer,
} from "./catalog-shared";

/**
 * The catalogue, read from the database.
 *
 * This replaces `realCatalog.ts`, which served the same shapes out of
 * the generated import file. That file is still the seed's input, but
 * nothing the site renders reads it any more - otherwise an edit made
 * in the dashboard would never show up on the shop.
 *
 * Everything here is server-only. Client components take what they
 * need as props; see `catalog-shared.ts` for the labels and helpers
 * they can import directly.
 *
 * The queries are deliberately unglamorous: there are 21 products and
 * 205 variants, so one query that fetches the lot and shapes it in
 * memory beats a careful set of narrow ones. Revisit if the catalogue
 * grows an order of magnitude.
 */

/** Shapes a Prisma row into the shape the UI has always used. */
type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  finish: string | null;
  status: string;
  images: { url: string; position: number }[];
  variants: {
    id: string;
    sku: string;
    priceInPaise: number;
    stock: number;
    active: boolean;
    deviceModel: { name: string; category: { slug: string } };
  }[];
};

function toProduct(p: Row): CatalogProduct {
  const variants = p.variants
    .map((v) => ({
      id: v.id,
      title: v.deviceModel.name,
      priceInPaise: v.priceInPaise,
      stock: v.stock,
      available: v.active && v.stock > 0,
      sku: v.sku,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const prices = variants.map((v) => v.priceInPaise);
  const categorySlug = p.variants[0]?.deviceModel.category.slug ?? null;

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description ?? "",
    category:
      categorySlug && categorySlug !== UNCATEGORISED ? categorySlug : null,
    finish: p.finish,
    status: p.status,
    images: [...p.images]
      .sort((a, b) => a.position - b.position)
      .map((i) => i.url),
    variants,
    minPriceInPaise: prices.length ? Math.min(...prices) : 0,
    maxPriceInPaise: prices.length ? Math.max(...prices) : 0,
    missingImages: p.images.length === 0,
    suspiciousPrices: variants
      .filter((v) => v.priceInPaise > 0 && v.priceInPaise < 10000)
      .map((v) => ({
        variant: v.title,
        price: (v.priceInPaise / 100).toFixed(2),
      })),
  };
}

const INCLUDE = {
  images: { select: { url: true, position: true } },
  variants: {
    select: {
      id: true,
      sku: true,
      priceInPaise: true,
      stock: true,
      active: true,
      deviceModel: {
        select: { name: true, category: { select: { slug: true } } },
      },
    },
  },
} as const;

/* ---------------- products ---------------- */

export async function getAllProducts(): Promise<CatalogProduct[]> {
  const rows = await db.product.findMany({
    include: INCLUDE,
    orderBy: { title: "asc" },
  });
  return rows.map(toProduct);
}

/**
 * What a customer is allowed to see.
 *
 * Draft and archived products exist in the database and must stay
 * visible in the dashboard - that is the whole point of a draft - but
 * they are not for sale. The phone catalogue arrives from the price
 * lists as drafts with no price on them, so without this filter the
 * shop would list a thousand skins at Rs. 0.00 and sell them.
 *
 * `getAllProducts` is the unfiltered one; only the dashboard uses it.
 */
export async function getLiveProducts(): Promise<CatalogProduct[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.status === "ACTIVE");
}

export async function getProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  const row = await db.product.findUnique({
    where: { slug },
    include: INCLUDE,
  });
  return row ? toProduct(row) : null;
}

export async function getProductsForCategory(
  category: string,
): Promise<CatalogProduct[]> {
  const all = await getLiveProducts();
  return all.filter((p) => (p.category ?? UNCATEGORISED) === category);
}

export async function getProductsForFinish(
  finish: string,
): Promise<CatalogProduct[]> {
  const all = await getLiveProducts();
  return all.filter((p) => p.finish === finish);
}

/** Other products a customer might plausibly want next. */
export async function getRelatedProducts(
  p: CatalogProduct,
  limit = 4,
): Promise<CatalogProduct[]> {
  const all = await getLiveProducts();

  const same = all.filter((o) => o.slug !== p.slug && o.category === p.category);
  const rest = all.filter((o) => o.slug !== p.slug && o.category !== p.category);

  // Prefer products with a photo - a rail of grey swatches sells nothing.
  const byPhoto = (a: CatalogProduct, b: CatalogProduct) =>
    Number(Boolean(b.images[0])) - Number(Boolean(a.images[0]));

  return [...same.sort(byPhoto), ...rest.sort(byPhoto)].slice(0, limit);
}

/* ---------------- offers ---------------- */

/**
 * Flattened (product, variant) pairs - one row per buyable thing.
 * The source catalogue cannot be walked as a clean category tree, so
 * the finder and search work off this instead.
 */
export async function getOffers(): Promise<Offer[]> {
  const products = await getLiveProducts();

  return products.flatMap((p) =>
    p.variants
      .filter((v) => !NOISE_VARIANT.test(v.title.trim()))
      .map((v) => ({
        id: v.id,
        productSlug: p.slug,
        productTitle: p.title,
        category: p.category,
        categoryLabel: categoryLabel(p.category),
        finish: p.finish,
        variantTitle: v.title,
        priceInPaise: v.priceInPaise,
        available: v.available,
        imageUrl: p.images[0] ?? null,
        search: [
          p.title,
          v.title,
          categoryLabel(p.category),
          p.finish ? FINISH_LABEL[p.finish] : "",
          v.sku,
        ]
          .join(" ")
          .toLowerCase(),
      })),
  );
}

/* ---------------- navigation ---------------- */

/**
 * Every device the store sells, including the ones with nothing in
 * them - the menu is also how someone discovers that we cut drones at
 * all. `count` is zero for those and the UI routes them to
 * /request-model rather than an empty grid.
 */
export async function getNavCategories(): Promise<NavCategory[]> {
  const products = await getLiveProducts();
  const offers = await getOffers();

  return Object.keys(CATEGORY_LABEL).map((slug) => {
    const inCategory = products.filter((p) => p.category === slug);

    return {
      slug,
      name: CATEGORY_LABEL[slug],
      count: offers.filter((o) => o.category === slug).length,
      finishes: [
        ...new Set(
          inCategory
            .map((p) => p.finish)
            .filter((f): f is string => Boolean(f && FINISH_LABEL[f])),
        ),
      ],
    };
  });
}

/** Finish collections that have at least one product behind them. */
export async function getNavFinishes(): Promise<
  { slug: string; name: string; count: number }[]
> {
  const products = await getLiveProducts();

  return Object.keys(FINISH_LABEL)
    .map((slug) => ({
      slug,
      name: FINISH_LABEL[slug],
      count: products.filter((p) => p.finish === slug).length,
    }))
    .filter((f) => f.count > 0);
}

/* ---------------- counts for the dashboard ---------------- */

export async function getCatalogStats() {
  const [products, offers] = await Promise.all([
    getAllProducts(),
    getOffers(),
  ]);

  const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);

  return {
    products: products.length,
    totalVariants,
    realOptions: offers.length,
    inStock: offers.filter((o) => o.available).length,
    missingImages: products.filter((p) => p.missingImages).length,
    noCategory: products.filter((p) => !p.category).length,
    oddPrices: products.filter((p) => p.suspiciousPrices.length > 0).length,
  };
}
