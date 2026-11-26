/**
 * The design vocabulary, and the artwork that actually exists.
 *
 * The five categories are the ones the Shopify store was organised
 * by. Twenty collections carried those five names - "texture",
 * "texture-1", "texture-camera", "texture-lens" are all Texture - and
 * fourteen of the twenty were empty, so there is nothing else to
 * carry over.
 *
 * The designs are the five photographs that survived. Eight products
 * on the live store looked like real designs; five had a photograph.
 * The category each one sits in is where Shopify had it, and where
 * Shopify had it in nothing, the nearest honest guess - which is
 * exactly what the dashboard is for changing.
 *
 * Safe to run again: categories are upserted, and designs are only
 * seeded into an empty table, so it will never undo the shop owner's
 * edits.
 */
import { db } from "../src/lib/db";

const CATEGORIES = [
  { slug: "embossed", name: "Embossed", position: 0 },
  { slug: "printed-designs", name: "Printed Designs", position: 1 },
  { slug: "design-patterns", name: "Design Patterns", position: 2 },
  { slug: "solid-pattern", name: "Solid Pattern", position: 3 },
  { slug: "texture", name: "Texture", position: 4 },
];

const DESIGNS = [
  {
    slug: "neon-dragon",
    name: "Neon Dragon",
    categorySlug: "embossed",
    imageUrl: "/brand/designs/neon-dragon.jpg",
    deviceSlugs: ["phone"],
    position: 0,
  },
  {
    slug: "embosse",
    name: "Embosse",
    categorySlug: "embossed",
    imageUrl: "/brand/designs/embosse.png",
    deviceSlugs: ["phone"],
    position: 1,
  },
  {
    slug: "black-honeycomb",
    name: "Black Honeycomb",
    categorySlug: "texture",
    imageUrl: "/brand/designs/black-honeycomb-back.jpg",
    deviceSlugs: ["camera", "lens"],
    position: 0,
  },
  {
    slug: "forged-carbon",
    name: "Forged Carbon",
    categorySlug: "texture",
    imageUrl: "/brand/designs/forged-carbon.jpg",
    deviceSlugs: ["camera", "lens"],
    position: 1,
  },
  {
    slug: "black-leather",
    name: "Black Leather",
    categorySlug: "texture",
    imageUrl: "/brand/designs/black-leather.jpg",
    deviceSlugs: ["camera", "lens"],
    position: 2,
  },
];

async function main() {
  for (const c of CATEGORIES) {
    await db.designCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, position: c.position },
      create: c,
    });
  }
  console.log(`Design categories: ${CATEGORIES.length}`);

  const existing = await db.design.count();
  if (existing > 0) {
    console.log(`Designs: ${existing} already here, left alone.`);
    return;
  }

  await db.design.createMany({ data: DESIGNS });
  console.log(`Designs: ${DESIGNS.length} seeded.`);
}

main();
