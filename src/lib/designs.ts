import "server-only";
import { db } from "./db";
import { brandLabel, compareBrands, urlSlug } from "./catalog-shared";

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
  /** the tile on "Our Collections" */
  imageUrl: string | null;
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
  /**
   * What this costs at its cheapest, once a device is known.
   *
   * A design has no price of its own - the price is the device's
   * cheapest option plus whatever the design adds - so a card with
   * no device behind it can only say "price by device". Arriving
   * through a category does give us a device, and then there is a
   * real number to show.
   */
  fromPaise?: number;
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
    imageUrl: c.imageUrl,
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

/* ================= one design, sold on its own page ================= */

/**
 * The design-first product page.
 *
 * The shop is navigated two ways now, and this is the one the live
 * store settled on: the customer picks the artwork first, then says
 * what they own. The other way round - device first, artwork second -
 * still exists at /skins, because someone who arrives knowing only
 * "I have a Canon R3" should not have to browse pictures to find out
 * whether we cut for it.
 *
 * Only the names are loaded here. A design cut for phones has 1,033
 * devices behind it and 2,400 options; shipping those to pick four is
 * absurd, so the coverages come from a round trip once a device is
 * chosen. Names are two short columns and compress to nothing.
 */

export type DesignBrand = {
  slug: string;
  name: string;
  /** device category this brand belongs to, for multi-category designs */
  category: string;
  models: { id: string; name: string }[];
};

export type DesignPage = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string | null;
  priceInPaise: number;
  /** device categories this artwork is cut for */
  devices: string[];
  brands: DesignBrand[];
};

export async function getDesignPage(slug: string): Promise<DesignPage | null> {
  const design = await db.design.findFirst({
    where: { slug, active: true },
    include: { category: { select: { name: true } } },
  });
  if (!design) return null;

  // No device list means every device, which is the default someone
  // gets by adding a design and not thinking about it.
  const where =
    design.deviceSlugs.length > 0
      ? { category: { slug: { in: design.deviceSlugs } } }
      : {};

  const models = await db.deviceModel.findMany({
    where: { ...where, active: true },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
    select: {
      id: true,
      brand: true,
      name: true,
      category: { select: { slug: true } },
    },
  });

  const byBrand = new Map<string, DesignBrand>();
  for (const m of models) {
    const key = `${m.category.slug}:${m.brand}`;
    const entry = byBrand.get(key) ?? {
      slug: urlSlug(m.brand),
      name: brandLabel(m.brand),
      category: m.category.slug,
      models: [],
    };
    entry.models.push({ id: m.id, name: m.name });
    byBrand.set(key, entry);
  }

  return {
    id: design.id,
    slug: design.slug,
    name: design.name,
    categoryName: design.category.name,
    categorySlug: design.categorySlug,
    imageUrl: design.imageUrl,
    priceInPaise: design.priceInPaise,
    devices: design.deviceSlugs,
    // Apple first, not Poco. See compareBrands.
    brands: [...byBrand.values()].sort((a, b) => compareBrands(a.name, b.name)),
  };
}

/** Designs grouped by kind, for the collections strip and its page. */
export async function getDesignCollections(): Promise<
  { slug: string; name: string; coverUrl: string | null; designs: DesignRow[] }[]
> {
  const [categories, designs] = await Promise.all([
    db.designCategory.findMany({ orderBy: { position: "asc" } }),
    getActiveDesigns(),
  ]);

  return categories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      coverUrl: c.imageUrl,
      designs: designs.filter((d) => d.categorySlug === c.slug),
    }))
    // Same rule as the device pages: a collection with nothing in it
    // is not shown. See getCollectionsForDevice.
    .filter((c) => c.designs.length > 0);
}

export async function getActiveDesigns(): Promise<DesignRow[]> {
  const rows = await db.design.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });
  return rows.map(toRow);
}

/* ============ the category -> collection -> design walk ============ */

/**
 * The route the live store settled on, and the one this follows:
 *
 *   Categories      what do you own          /skins/phone
 *   Our Collections what should it look like /collections/embossed
 *   the grid        which one                /collections/embossed
 *   the product     on which device exactly  .../products/neon-dragon
 *
 * The category is a doorway rather than a filter that survives: by
 * the time someone is choosing artwork they have already said what
 * they own, and the product page asks again anyway because that is
 * where the answer has to be exact.
 *
 * Only collections that have something in them are shown. The live
 * store does list its empty ones, but that is its shelves standing
 * empty rather than a thing to copy - a customer who clicks one
 * learns only that we have nothing, and three of five read that way.
 * The rows stay in the dashboard with their tiles, taglines and
 * order, so the first design filed under one brings it back by
 * itself. A device we cut but have photographed no design on - the
 * gimbal today - gets the enquiry card instead of an empty grid.
 */

/**
 * The collection tiles the live store used, per device.
 *
 * A camera page showing a phone mock-up for "Solid Pattern" is the
 * wrong picture, and most of these collections have no design behind
 * them yet to borrow one from. The store had a separate image for
 * each device it bothered to shoot, and these are those files.
 *
 * Keyed "<device>:<collection>", falling back to the collection's
 * own tile and then to its first design. A pairing nobody shot is
 * simply missing and falls through - that is better than a picture
 * of the wrong thing.
 */
/**
 * The shop's own photograph of a collection's films, per device.
 *
 * These are rolls standing on the counter - the actual stock. The
 * live store shows all three on its camera page and both on its lens
 * page, and shows them whether or not a product has been filed under
 * them, because the rolls are there either way. A collection we have
 * a photograph of is a collection we sell; the missing part is only
 * that nobody has photographed a device wearing one yet.
 */
export function deviceTileFor(device: string, collection: string) {
  return DEVICE_TILES[`${device}:${collection}`] ?? null;
}

const DEVICE_TILES: Record<string, string> = {
  "camera:design-patterns": "/brand/styles/design-pattern-camera.jpg",
  "camera:solid-pattern": "/brand/styles/solid-pattern-camera.jpg",
  "camera:texture": "/brand/styles/texture-camera.jpg",

  "lens:design-patterns": "/brand/styles/design-pattern-lens.jpg",
  "lens:texture": "/brand/styles/texture-lens.jpg",

  "laptop:embossed": "/brand/styles/empossed-laptop.jpg",
  "laptop:design-patterns": "/brand/styles/design-patterns-laptop.jpg",
  "laptop:solid-pattern": "/brand/styles/solid-pattern-laptop.jpg",
  "laptop:printed-designs": "/brand/styles/printed-design-laptop-1.jpg",

  "tablet:design-patterns": "/brand/styles/design-pattern-tab.jpg",
  "tablet:solid-pattern": "/brand/styles/solid-pattern-tab.jpg",
  "tablet:printed-designs": "/brand/styles/printed-design-tab.jpg",
};

export type DeviceCollection = {
  slug: string;
  name: string;
  count: number;
  /** the collection's own tile, falling back to its first design */
  coverUrl: string | null;
};

export async function getCollectionsForDevice(
  device: string,
): Promise<DeviceCollection[]> {
  const [categories, designs] = await Promise.all([
    db.designCategory.findMany({ orderBy: { position: "asc" } }),
    db.design.findMany({
      where: {
        active: true,
        OR: [{ deviceSlugs: { isEmpty: true } }, { deviceSlugs: { has: device } }],
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { categorySlug: true, imageUrl: true },
    }),
  ]);

  return categories
    .map((c) => {
      const mine = designs.filter((d) => d.categorySlug === c.slug);
      return {
        slug: c.slug,
        name: c.name,
        count: mine.length,
        // The shop's own photo for this collection ON THIS DEVICE
        // comes first. A design's photo looks like the better choice
        // - it is the thing being sold - but one design serves
        // several devices, so Black Honeycomb's camera body was
        // sitting on the Lens page as the face of Texture. A roll of
        // the actual film, shot for lenses, is about this device; a
        // camera on a lens page is about the wrong one.
        coverUrl:
          DEVICE_TILES[`${device}:${c.slug}`] ??
          mine.find((d) => d.imageUrl)?.imageUrl ??
          c.imageUrl ??
          null,
      };
    })
    // Shown when there is something to show: a design filed under it,
    // or a photograph of the films themselves cut for THIS device.
    // The photograph is the stock - a customer looking at a shelf of
    // rolls can choose from it without a single device having been
    // photographed wearing one.
    //
    // It has to be the device's own photograph, not the collection's
    // generic one. Every collection has a generic tile, so accepting
    // that put all five on every page again - including Solid
    // Pattern on the lens page, which the live store does not list
    // because it does not stock those rolls cut for lenses.
    .filter(
      (c) => c.count > 0 || DEVICE_TILES[`${device}:${c.slug}`] !== undefined,
    );
}

export type DesignCollectionPage = {
  slug: string;
  name: string;
  designs: DesignRow[];
  /** the films themselves, when nothing has been photographed wearing them */
  tile: string | null;
};

/**
 * One collection's grid.
 *
 * `device` narrows it when the customer arrived through a category,
 * and is left out when they came in from the header - in which case
 * the collection is everything of that kind, which is what
 * /collections/<kind> means on the live store.
 */
export async function getCollection(
  kind: string,
  device?: string,
): Promise<DesignCollectionPage | null> {
  const category = await db.designCategory.findUnique({ where: { slug: kind } });
  if (!category) return null;

  const rows = await db.design.findMany({
    where: {
      categorySlug: kind,
      active: true,
      ...(device
        ? {
            OR: [
              { deviceSlugs: { isEmpty: true } },
              { deviceSlugs: { has: device } },
            ],
          }
        : {}),
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });

  // No designs and no photograph of the films either - nothing to
  // put on a page, and the tiles that lead here are filtered the same
  // way, so this is a typed or stale URL. A 404 tells them faster.
  const tile = device ? deviceTileFor(device, kind) : null;
  if (rows.length === 0 && !tile) return null;

  const designs = rows.map(toRow);

  // The cheapest thing we cut for this device, so the cards can quote
  // a figure instead of "price by device". One query for the lot:
  // every design in a collection sits on the same price list.
  if (device) {
    const cheapest = await db.variant.aggregate({
      _min: { priceInPaise: true },
      where: {
        active: true,
        deviceModel: { active: true, category: { slug: device } },
      },
    });
    const floor = cheapest._min.priceInPaise;
    if (floor !== null) {
      for (const d of designs) d.fromPaise = floor + d.priceInPaise;
    }
  }

  return { slug: category.slug, name: category.name, designs, tile };
}

/** Every collection slug, so a route can tell one from a category. */
export async function getCollectionSlugs(): Promise<string[]> {
  const rows = await db.designCategory.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}
