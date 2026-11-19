import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ALL_PRODUCTS,
  CATEGORY_LABEL,
  optionLabelFor,
} from "../src/lib/realCatalog";

/**
 * Loads the imported Shopify catalogue into the database.
 *
 * Idempotent: every write is an upsert keyed on a stable slug or SKU,
 * so running it twice changes nothing and running it after a re-import
 * updates in place. It never deletes - a product pulled from Shopify
 * is not automatically pulled from here, because by then it may have
 * orders pointing at it.
 *
 * The shape has to be bridged. Shopify gave us products with a flat
 * list of variants whose titles are sometimes a device model ("24-70mm
 * GM II"), sometimes a brand ("Canon"), sometimes a price tier. Our
 * schema wants a Variant to point at a DeviceModel row. So each
 * distinct variant title within a category becomes a DeviceModel. That
 * is honest to what the data means - the thing a customer picks - even
 * where the source called it something else.
 *
 * Products with no category go under an "Uncategorised" device, since
 * DeviceModel.categoryId is required. They show up in the dashboard's
 * "No category" filter, which is where someone should fix them.
 */

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const UNCATEGORISED = "uncategorised";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Stable, unique SKU when Shopify did not give us one. */
function skuFor(productSlug: string, shopifyId: number): string {
  return `EPRO-${productSlug}-${shopifyId}`.toUpperCase().slice(0, 64);
}

async function main() {
  console.log("Seeding from the imported Shopify catalogue…\n");

  /* ---------- categories ---------- */

  const categorySlugs = [...Object.keys(CATEGORY_LABEL), UNCATEGORISED];

  for (const [i, slug] of categorySlugs.entries()) {
    const name = CATEGORY_LABEL[slug] ?? "Uncategorised";
    await prisma.deviceCategory.upsert({
      where: { slug },
      update: { name, position: i },
      create: { slug, name, position: i },
    });
  }
  console.log(`categories  ${categorySlugs.length}`);

  /* ---------- products, models, variants ---------- */

  let modelCount = 0;
  let variantCount = 0;
  let imageCount = 0;

  for (const p of ALL_PRODUCTS) {
    const categorySlug = p.category ?? UNCATEGORISED;
    const category = await prisma.deviceCategory.findUniqueOrThrow({
      where: { slug: categorySlug },
    });

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description || null,
        finish: p.finish,
        // Everything imported is live; the dashboard can draft one later.
        status: "ACTIVE",
      },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description || null,
        finish: p.finish,
        status: "ACTIVE",
        tags: [],
      },
    });

    /* images - replaced wholesale, position carries the order */
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const [position, url] of p.images.entries()) {
      await prisma.productImage.create({
        data: { productId: product.id, url, alt: p.title, position },
      });
      imageCount++;
    }

    const optionLabel = optionLabelFor(p);

    for (const v of p.variants) {
      const title = v.title.trim() || "Default";

      // One DeviceModel per distinct option within a category. The slug
      // includes the category so "Sony" under Lens and "Sony" under
      // Camera stay separate rows.
      const modelSlug = slugify(`${categorySlug}-${title}`);

      const model = await prisma.deviceModel.upsert({
        where: { slug: modelSlug },
        update: { name: title, brand: optionLabel, categoryId: category.id },
        create: {
          slug: modelSlug,
          name: title,
          brand: optionLabel,
          categoryId: category.id,
        },
      });
      modelCount++;

      const sku = v.sku?.trim() || skuFor(p.slug, v.shopifyId);

      await prisma.variant.upsert({
        where: {
          productId_deviceModelId: {
            productId: product.id,
            deviceModelId: model.id,
          },
        },
        update: {
          sku,
          priceInPaise: v.priceInPaise,
          // Shopify only told us available / not, so stock is a
          // placeholder until real counts are entered in the dashboard.
          stock: v.available ? 10 : 0,
          active: v.available,
        },
        create: {
          productId: product.id,
          deviceModelId: model.id,
          sku,
          priceInPaise: v.priceInPaise,
          stock: v.available ? 10 : 0,
          active: v.available,
        },
      });
      variantCount++;
    }
  }

  console.log(`products    ${ALL_PRODUCTS.length}`);
  console.log(`models      ${modelCount}`);
  console.log(`variants    ${variantCount}`);
  console.log(`images      ${imageCount}`);

  /* ---------- order numbering ---------- */

  // EPRO-1000 onwards, so the first real order does not look like a test.
  await prisma.counter.upsert({
    where: { name: "order" },
    update: {},
    create: { name: "order", value: 1000 },
  });

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error("\nSeed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
