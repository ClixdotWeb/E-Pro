import "server-only";
import { db } from "./db";
import {
  CATEGORY_LABEL,
  FINISH_LABEL,
  NOISE_VARIANT,
  UNCATEGORISED,
  brandLabel,
  categoryLabel,
  offersLogoCutout,
  urlSlug,
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
 * `getAllProducts` fetches the whole catalogue and shapes it in
 * memory. That was obviously right at 21 products and 205 variants;
 * at 1302 models and 3374 variants it is no longer free, so the
 * device-browsing queries further down are narrow on purpose - a
 * brand page reads that brand, not the shop.
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
  // The header runs this on every page in the shop, so it is a single
  // grouped count rather than the whole catalogue shaped in memory.
  // The in-memory version was fine at 205 variants; at 3374 it was
  // reading the entire shop to decide what to put in a menu.
  const rows = await db.$queryRaw<
    { category: string; finish: string | null; n: bigint }[]
  >`
    SELECT c.slug AS category, p.finish AS finish, COUNT(*) AS n
    FROM "Variant" v
    JOIN "Product" p ON p.id = v."productId"
    JOIN "DeviceModel" m ON m.id = v."deviceModelId"
    JOIN "DeviceCategory" c ON c.id = m."categoryId"
    WHERE v.active AND v.stock > 0 AND p.status = 'ACTIVE'
    GROUP BY c.slug, p.finish
  `;

  const counts = new Map<string, number>();
  const finishes = new Map<string, Set<string>>();

  for (const r of rows) {
    counts.set(r.category, (counts.get(r.category) ?? 0) + Number(r.n));
    if (r.finish && FINISH_LABEL[r.finish]) {
      (finishes.get(r.category) ?? finishes.set(r.category, new Set()).get(r.category)!).add(
        r.finish,
      );
    }
  }

  return Object.keys(CATEGORY_LABEL).map((slug) => ({
    slug,
    name: CATEGORY_LABEL[slug],
    count: counts.get(slug) ?? 0,
    finishes: [...(finishes.get(slug) ?? [])],
  }));
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

/* ================= browsing by device ================= */

/**
 * These four are what the shop is actually navigated with, and they
 * are narrow on purpose: a brand page must not read 3374 variants to
 * show 236 names.
 *
 * Brand and model slugs are derived from the stored names rather than
 * stored themselves, so each lookup fetches the candidates for that
 * category and matches on the derived slug. That is one indexed read
 * of a few hundred rows, and it keeps the URL free of the internal
 * slug ("phone-samsung-samsung-galaxy-s24-ultra") that nobody should
 * ever see.
 */

export type BrandSummary = {
  slug: string;
  name: string;
  models: number;
  /** false when nothing in this brand is on sale yet */
  onSale: boolean;
};

export async function getBrandsForCategory(
  category: string,
): Promise<BrandSummary[]> {
  const models = await db.deviceModel.findMany({
    where: { category: { slug: category }, active: true },
    select: {
      brand: true,
      variants: {
        where: { active: true, product: { status: "ACTIVE" } },
        select: { id: true },
        take: 1,
      },
    },
  });

  const byBrand = new Map<string, BrandSummary>();
  for (const m of models) {
    const slug = urlSlug(m.brand);
    const row = byBrand.get(slug) ?? {
      slug,
      name: brandLabel(m.brand),
      models: 0,
      onSale: false,
    };
    row.models++;
    if (m.variants.length > 0) row.onSale = true;
    byBrand.set(slug, row);
  }

  return [...byBrand.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export type ModelSummary = {
  slug: string;
  name: string;
  /** cheapest option on sale, or null when none is */
  fromPaise: number | null;
  /**
   * What can actually be made for this model, named.
   *
   * It is not the same for every model, which is the whole reason it
   * is here: of 1290 models the price lists describe six different
   * sets. 516 phones take a full wrap or a back-only skin, 407 take
   * either of those or back-with-sides, 64 take nothing but back-only.
   * Someone with a OnePlus Nord N20 needs to know that before they
   * open the page, not after.
   *
   * Cameras and lenses are uniform - all four materials, every model -
   * so the brand page says that once at the top instead of repeating
   * it down 153 rows.
   */
  skins: string[];
};

export async function getModelsForBrand(
  category: string,
  brandSlug: string,
): Promise<{ brand: string; models: ModelSummary[] } | null> {
  const models = await db.deviceModel.findMany({
    where: { category: { slug: category }, active: true },
    select: {
      brand: true,
      name: true,
      variants: {
        select: {
          priceInPaise: true,
          active: true,
          product: { select: { finish: true, title: true, status: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const mine = models.filter((m) => urlSlug(m.brand) === brandSlug);
  if (mine.length === 0) return null;

  return {
    brand: brandLabel(mine[0].brand),
    models: mine.map((m) => {
      // On sale now: what sets the "from" price.
      const live = m.variants.filter(
        (v) => v.active && v.product.status === "ACTIVE",
      );

      return {
        slug: urlSlug(m.name),
        name: m.name,
        fromPaise: live.length
          ? Math.min(...live.map((v) => v.priceInPaise))
          : null,
        // Everything we can cut for it, priced or not. A skin that is
        // waiting on a price is still a skin that fits.
        skins: m.variants.map(
          (v) =>
            (v.product.finish && FINISH_LABEL[v.product.finish]) ||
            v.product.title,
        ),
      };
    }),
  };
}

/** One buyable way to have this model's skin made. */
export type SkinOption = {
  variantId: string;
  /** the finish or coverage slug, e.g. "korean-skin" or "full-wrap" */
  finish: string | null;
  label: string;
  priceInPaise: number;
  stock: number;
  available: boolean;
  /** true when the product is still a draft - priced later */
  pending: boolean;
};

export type ModelPage = {
  category: string;
  categoryLabel: string;
  brand: string;
  brandSlug: string;
  name: string;
  slug: string;
  options: SkinOption[];
  /** what the options are called here: "Material" or "Coverage" */
  optionLabel: string;
  logoCutout: boolean;
};

export async function getModelPage(
  category: string,
  brandSlug: string,
  modelSlug: string,
): Promise<ModelPage | null> {
  // Two queries on purpose. The slugs are derived, so finding the row
  // means reading the category's names - 1045 of them for phones - but
  // that is two short columns. Pulling their variants in the same
  // query would have meant 2400 rows to show one model's four.
  const names = await db.deviceModel.findMany({
    where: { category: { slug: category }, active: true },
    select: { id: true, brand: true, name: true },
  });

  const match = names.find(
    (m) => urlSlug(m.brand) === brandSlug && urlSlug(m.name) === modelSlug,
  );
  if (!match) return null;

  const model = await db.deviceModel.findUniqueOrThrow({
    where: { id: match.id },
    select: {
      brand: true,
      name: true,
      variants: {
        select: {
          id: true,
          priceInPaise: true,
          stock: true,
          active: true,
          product: { select: { finish: true, title: true, status: true } },
        },
      },
    },
  });

  const options: SkinOption[] = model.variants
    .map((v) => {
      const finish = v.product.finish;
      const pending = v.product.status !== "ACTIVE";
      return {
        variantId: v.id,
        finish,
        label: (finish && FINISH_LABEL[finish]) || v.product.title,
        priceInPaise: v.priceInPaise,
        stock: v.stock,
        available: v.active && v.stock > 0 && !pending,
        pending,
      };
    })
    // Cheapest first; a pending option has no price to sort on, so it
    // goes last whatever its zero says.
    .sort(
      (a, b) =>
        Number(a.pending) - Number(b.pending) ||
        a.priceInPaise - b.priceInPaise,
    );

  return {
    category,
    categoryLabel: CATEGORY_LABEL[category] ?? category,
    brand: brandLabel(model.brand),
    brandSlug,
    name: model.name,
    slug: modelSlug,
    options,
    optionLabel: category === "phone" ? "Coverage" : "Material",
    logoCutout: offersLogoCutout(category, model.brand),
  };
}
