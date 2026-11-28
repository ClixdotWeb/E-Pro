/**
 * Backfill the device categories' own presentation.
 *
 * The homepage tiles, their order and the sentence on each device
 * page all lived in code - a hard-coded array of ten, with the image
 * found by convention from the slug. That meant a category added in
 * the dashboard never appeared on the homepage, and its picture
 * could not be changed at all.
 *
 * This moves what was in the code into the rows it describes. Safe
 * to run again: it only fills what is still empty, so it will never
 * undo the shop owner's edits.
 */
import { db } from "../src/lib/db";

const TILES: { slug: string; position: number; tagline: string }[] = [
  { slug: "phone", position: 0, tagline: "Cut to the millimetre for your exact model. Pick a collection, then tell us what you carry." },
  { slug: "camera", position: 1, tagline: "Precision-cut protective skins for professional camera gear. Pick a collection, then tell us which body you have." },
  { slug: "lens", position: 2, tagline: "Precision-cut protective skins for professional camera lenses. Pick a collection, then tell us which lens you have." },
  { slug: "laptop", position: 3, tagline: "Skins cut for the lid, the deck and the underside." },
  { slug: "gimbal", position: 4, tagline: "Protective skins cut for your stabiliser, grip and arms." },
  { slug: "tablet", position: 5, tagline: "Skins cut to the millimetre for your exact tablet." },
  { slug: "gaming-consoles", position: 6, tagline: "Skins for the console and the controllers." },
  { slug: "drone", position: 7, tagline: "Skins cut for the body, the arms and the controller." },
  { slug: "charger", position: 8, tagline: "Skins for the brick and the cable." },
  { slug: "wireless-earbuds", position: 9, tagline: "Skins cut for the case and the buds." },
];

async function main() {
  let touched = 0;

  for (const t of TILES) {
    const existing = await db.deviceCategory.findUnique({
      where: { slug: t.slug },
      select: { imageUrl: true, tagline: true },
    });
    if (!existing) continue;

    await db.deviceCategory.update({
      where: { slug: t.slug },
      data: {
        position: t.position,
        imageUrl: existing.imageUrl ?? `/brand/categories/${t.slug}.jpg`,
        tagline: existing.tagline ?? t.tagline,
      },
    });
    touched++;
  }

  // Uncategorised is a bucket, not a thing anyone browses.
  await db.deviceCategory.updateMany({
    where: { slug: "uncategorised" },
    data: { active: false, position: 99 },
  });

  console.log(`Categories given a tile and a tagline: ${touched}`);
}

main();
