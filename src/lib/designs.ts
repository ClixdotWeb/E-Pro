import "server-only";
import { db } from "./db";

/**
 * Designs: the artwork that goes on a skin.
 *
 * Deliberately separate from Product. A product here is a material or
 * a coverage - "Printed Skin", "Full Wrap" - and it exists once per
 * device model. A design is the picture, and the same picture sells
 * on every device, so pairing the two in the database would mean
 * 1290 models x 5 designs of rows that say nothing new. The pairing
 * happens at the moment of sale instead, carried on the cart line.
 */

export type DesignCategoryRow = {
  slug: string;
  name: string;
  position: number;
  designs: number;
};

export type DesignRow = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  imageUrl: string | null;
  deviceSlugs: string[];
  priceInPaise: number;
  active: boolean;
  position: number;
};

export async function getDesignCategories(): Promise<DesignCategoryRow[]> {
  const rows = await db.designCategory.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { designs: true } } },
  });

  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    position: c.position,
    designs: c._count.designs,
  }));
}

function toRow(d: {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  imageUrl: string | null;
  deviceSlugs: string[];
  priceInPaise: number;
  active: boolean;
  position: number;
  category: { name: string };
}): DesignRow {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    categorySlug: d.categorySlug,
    categoryName: d.category.name,
    imageUrl: d.imageUrl,
    deviceSlugs: d.deviceSlugs,
    priceInPaise: d.priceInPaise,
    active: d.active,
    position: d.position,
  };
}

/** Everything, drafts included. The dashboard's list. */
export async function getAllDesigns(): Promise<DesignRow[]> {
  const rows = await db.design.findMany({
    orderBy: [{ categorySlug: "asc" }, { position: "asc" }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });
  return rows.map(toRow);
}

/**
 * What the shop may show for one device category.
 *
 * A design with no device list is cut for everything - that is the
 * default a shop owner gets by adding a design and not thinking about
 * it, and it is the kinder default, because a design nobody can see
 * is a design nobody notices is missing.
 */
export async function getDesignsFor(device: string): Promise<DesignRow[]> {
  const rows = await db.design.findMany({
    where: {
      active: true,
      OR: [{ deviceSlugs: { isEmpty: true } }, { deviceSlugs: { has: device } }],
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });
  return rows.map(toRow);
}
