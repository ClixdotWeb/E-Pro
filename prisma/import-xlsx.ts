import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as XLSX from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CATEGORY_LABEL,
  FINISH_LABEL,
  UNCATEGORISED,
} from "../src/lib/catalog-shared";

/**
 * Loads the real price lists - the four spreadsheets in prisma/data -
 * into the database, replacing whatever catalogue is there.
 *
 * How the sheets map onto the schema:
 *
 *   workbook  ->  device category   (Camera / Lens / Gimbal / Phone)
 *   sheet     ->  brand             (Sony, Canon, Samsung, ...)
 *   row       ->  DeviceModel       ("Sony Alpha 7 IV")
 *   column    ->  Product           one per finish, e.g. "Korean Skin"
 *   cell      ->  Variant           that finish for that model, at that price
 *
 * A cell is what is actually for sale. An empty cell means that finish
 * is not offered for that model, so no variant is written - which is
 * why the totals are smaller than models x finishes.
 *
 * The phone sheets carry no prices at all, only YES/NO against three
 * coverage options. Those come in at zero and their products are left
 * DRAFT, so nothing can be bought at the wrong price. Put the prices
 * in from the dashboard and switch them to Active.
 *
 * This REPLACES. It is not the idempotent upsert that seed.ts is: the
 * spreadsheets are the source of truth now, so anything not in them
 * goes. It refuses to run once orders exist, because by then a variant
 * row is something a customer paid against.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/* ---------------- sources ---------------- */

type Source = {
  file: string;
  category: string;
  /** priced: the cell is a rupee amount. yesno: the cell is YES/NO. */
  kind: "priced" | "yesno";
};

const SOURCES: Source[] = [
  { file: "Camera final list.xlsx", category: "camera", kind: "priced" },
  { file: "Lens final list.xlsx", category: "lens", kind: "priced" },
  { file: "Gimbal final list.xlsx", category: "gimbal", kind: "priced" },
  { file: "Phone final list.xlsx", category: "phone", kind: "yesno" },
];

/**
 * Column heading -> finish. The headings are typed by hand and drift
 * between files ("Printed Skin" / "Printed Skins", "3M" / "3M Skin"),
 * so they are normalised before lookup rather than matched literally.
 */
const FINISH_BY_HEADING: Record<string, string> = {
  "printed skin": "printed-skin",
  "printed skins": "printed-skin",
  "variable lamination": "variable-lamination",
  "korean skin": "korean-skin",
  "korean skins": "korean-skin",
  "imported skin": "imported-skin",
  "imported skins": "imported-skin",
  "3m": "3m-skin",
  "3m skin": "3m-skin",
  "3m skins": "3m-skin",
  "full wrap": "full-wrap",
  "back with sides": "back-with-sides",
  "back only": "back-only",
};

/** Headings that are not a finish and are expected to be there. */
const NOT_A_FINISH = new Set(["sl no", "slno", "model", ""]);

/* ---------------- helpers ---------------- */

function norm(s: unknown): string {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * "+" is spelled out before the rest is stripped.
 *
 * Dropping it the way every other symbol is dropped would fold
 * "Realme 9 Pro+" into "Realme 9 Pro" and "Samsung Galaxy S24+ 5G"
 * into "Samsung Galaxy S24 5G" - different phones that need different
 * skins, silently merged into one row.
 */
function slugify(s: string): string {
  return norm(s)
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * SKUs have to be unique and fit the column, and a model name can be
 * long ("Tamron 17-28mm f/2.8 Di III RXD (Sony E-Mount)"). Long ones
 * are truncated and given a short hash of the full string, so two
 * names that share a prefix still get different SKUs.
 */
const seenSkus = new Set<string>();

function skuFor(finishSlug: string, modelSlug: string): string {
  const full = `EPRO-${finishSlug}-${modelSlug}`.toUpperCase();
  let sku = full;
  if (sku.length > 64) {
    const hash = crypto
      .createHash("sha1")
      .update(full)
      .digest("hex")
      .slice(0, 7);
    sku = `${full.slice(0, 56)}-${hash.toUpperCase()}`;
  }
  // Belt and braces: a collision here would abort the whole insert.
  let n = 2;
  while (seenSkus.has(sku)) {
    const suffix = `-${n++}`;
    sku = `${sku.slice(0, 64 - suffix.length)}${suffix}`;
  }
  seenSkus.add(sku);
  return sku;
}

/* ---------------- read the workbooks ---------------- */

type ParsedModel = {
  slug: string;
  brand: string;
  name: string;
  category: string;
};

type ParsedVariant = {
  productSlug: string;
  modelSlug: string;
  priceInPaise: number;
  active: boolean;
};

type ParsedProduct = {
  slug: string;
  title: string;
  finish: string;
  category: string;
  draft: boolean;
};

const models = new Map<string, ParsedModel>();
const products = new Map<string, ParsedProduct>();
const variants: ParsedVariant[] = [];
const warnings: string[] = [];

function readWorkbook(src: Source, dir: string) {
  const full = path.join(dir, src.file);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing spreadsheet: ${full}`);
  }
  const wb = XLSX.readFile(full);

  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
      header: 1,
      blankrows: false,
      defval: "",
    });
    if (!rows.length) continue;

    const heading = (rows[0] as unknown[]).map((h) => norm(h).toLowerCase());
    const body = rows.slice(1).filter((r) => norm((r as unknown[])[1]) !== "");
    if (!body.length) continue; // an empty "new (7)" template sheet

    const brand = norm(sheetName).replace(/\s*\(\d+\)$/, "");

    // Which columns hold a finish, and which finish.
    const finishColumns: { index: number; finish: string }[] = [];
    heading.forEach((h, index) => {
      if (index <= 1 || NOT_A_FINISH.has(h)) return;
      const finish = FINISH_BY_HEADING[h];
      if (!finish) {
        if (h) {
          warnings.push(
            `${src.file} / ${sheetName}: unknown column "${h}" - skipped`,
          );
        }
        return;
      }
      finishColumns.push({ index, finish });
    });

    for (const row of body) {
      const name = norm((row as unknown[])[1]);
      const modelSlug = slugify(`${src.category}-${brand}-${name}`);
      if (!models.has(modelSlug)) {
        models.set(modelSlug, {
          slug: modelSlug,
          brand,
          name,
          category: src.category,
        });
      }

      for (const { index, finish } of finishColumns) {
        const cell = (row as unknown[])[index];
        let priceInPaise = 0;
        let sell = false;

        if (src.kind === "priced") {
          const rupees = typeof cell === "number" ? cell : Number(norm(cell));
          if (!Number.isFinite(rupees) || rupees <= 0) continue;
          priceInPaise = Math.round(rupees * 100);
          sell = true;
        } else {
          if (norm(cell).toUpperCase() !== "YES") continue;
          priceInPaise = 0;
          sell = false; // no price yet, so not buyable
        }

        const productSlug = `${src.category}-skins-${finish}`;
        if (!products.has(productSlug)) {
          products.set(productSlug, {
            slug: productSlug,
            title: `${CATEGORY_LABEL[src.category] ?? src.category} Skins - ${
              FINISH_LABEL[finish] ?? finish
            }`,
            finish,
            category: src.category,
            draft: src.kind === "yesno",
          });
        }

        variants.push({ productSlug, modelSlug, priceInPaise, active: sell });
      }
    }
  }
}

/* ---------------- write ---------------- */

async function main() {
  const dir = process.argv[2] || path.join(process.cwd(), "prisma", "data");
  console.log(`Reading spreadsheets from ${dir}\n`);

  for (const src of SOURCES) readWorkbook(src, dir);

  for (const w of warnings) console.warn(`  ! ${w}`);
  if (warnings.length) console.warn("");

  console.log(
    `parsed      ${products.size} products, ${models.size} models, ${variants.length} variants`,
  );

  const orders = await prisma.order.count();
  if (orders > 0) {
    throw new Error(
      `${orders} order(s) exist. This script replaces the catalogue wholesale, which would orphan what people bought. Import into a fresh database instead.`,
    );
  }

  /* Categories: every one the site knows about, so the menu does not
     change shape just because a spreadsheet is missing. */
  const categorySlugs = [...Object.keys(CATEGORY_LABEL), UNCATEGORISED];
  for (const [i, slug] of categorySlugs.entries()) {
    const name = CATEGORY_LABEL[slug] ?? "Uncategorised";
    await prisma.deviceCategory.upsert({
      where: { slug },
      update: { name, position: i },
      create: { slug, name, position: i },
    });
  }

  /* Clear the old catalogue. */
  await prisma.cartItem.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.collectionProduct.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.deviceModel.deleteMany({});
  console.log("cleared     old catalogue");

  const categoryIds = new Map(
    (
      await prisma.deviceCategory.findMany({ select: { id: true, slug: true } })
    ).map((c) => [c.slug, c.id] as const),
  );

  /* Models. */
  await prisma.deviceModel.createMany({
    data: [...models.values()].map((m) => ({
      slug: m.slug,
      brand: m.brand,
      name: m.name,
      categoryId: categoryIds.get(m.category)!,
    })),
    skipDuplicates: true,
  });
  const modelIds = new Map(
    (await prisma.deviceModel.findMany({ select: { id: true, slug: true } })).map(
      (m) => [m.slug, m.id] as const,
    ),
  );

  /* Products. */
  await prisma.product.createMany({
    data: [...products.values()].map((p) => {
      const categoryName = (
        CATEGORY_LABEL[p.category] ?? p.category
      ).toLowerCase();
      return {
        slug: p.slug,
        title: p.title,
        description:
          `${FINISH_LABEL[p.finish] ?? p.finish} for ${categoryName}s. ` +
          `Precision cut for your exact model - pick yours below.`,
        finish: p.finish,
        status: (p.draft ? "DRAFT" : "ACTIVE") as "DRAFT" | "ACTIVE",
        tags: [],
      };
    }),
    skipDuplicates: true,
  });
  const productIds = new Map(
    (await prisma.product.findMany({ select: { id: true, slug: true } })).map(
      (p) => [p.slug, p.id] as const,
    ),
  );

  /* One photo per product, borrowed from the category tile. The
     spreadsheets carry no images, and a card with nothing on it looks
     broken. Replace these with real product photos later. */
  await prisma.productImage.createMany({
    data: [...products.values()].map((p) => ({
      productId: productIds.get(p.slug)!,
      url: `/brand/categories/${p.category}.jpg`,
      alt: p.title,
      position: 0,
    })),
  });

  /* Variants. */
  await prisma.variant.createMany({
    data: variants.map((v) => ({
      productId: productIds.get(v.productSlug)!,
      deviceModelId: modelIds.get(v.modelSlug)!,
      sku: skuFor(products.get(v.productSlug)!.finish, v.modelSlug),
      priceInPaise: v.priceInPaise,
      // Stock is not in the spreadsheets. Priced lines start at 10 so
      // the shop is usable; set the real counts in Stock Control.
      stock: v.active ? 10 : 0,
      active: v.active,
    })),
    skipDuplicates: true,
  });

  await prisma.counter.upsert({
    where: { name: "order" },
    update: {},
    create: { name: "order", value: 1000 },
  });

  const [pc, mc, vc] = await Promise.all([
    prisma.product.count(),
    prisma.deviceModel.count(),
    prisma.variant.count(),
  ]);
  console.log(`written     ${pc} products, ${mc} models, ${vc} variants`);
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error("\nImport failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
