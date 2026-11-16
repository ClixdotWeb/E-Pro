/**
 * Mock catalog shaped exactly like the Prisma models, so swapping these
 * functions for real `db` queries later is a one-file change per page.
 * Categories/finishes mirror the live Epro Gadgets store.
 */

export type Finish =
  | "printed-designs"
  | "design-patterns"
  | "solid-pattern"
  | "texture"
  | "embossed";

export const FINISH_LABEL: Record<Finish, string> = {
  "printed-designs": "Printed Designs",
  "design-patterns": "Design Patterns",
  "solid-pattern": "Solid Pattern",
  texture: "Texture",
  embossed: "Embossed",
};

export type DeviceCategory = {
  slug: string;
  name: string;
  /** which finishes this category actually stocks */
  finishes: Finish[];
};

export const DEVICE_CATEGORIES: DeviceCategory[] = [
  { slug: "phone", name: "Phone", finishes: ["design-patterns", "printed-designs", "solid-pattern", "texture"] },
  { slug: "laptop", name: "Laptop", finishes: ["embossed", "printed-designs", "design-patterns", "solid-pattern"] },
  { slug: "camera", name: "Camera", finishes: ["design-patterns", "solid-pattern", "texture"] },
  { slug: "lens", name: "Lens", finishes: ["design-patterns", "solid-pattern", "texture"] },
  { slug: "tablet", name: "Tablet", finishes: ["printed-designs", "design-patterns", "solid-pattern"] },
  { slug: "gimbal", name: "Gimbal", finishes: ["design-patterns", "solid-pattern", "texture"] },
  { slug: "gaming-consoles", name: "Gaming Console", finishes: ["printed-designs", "design-patterns", "solid-pattern"] },
  { slug: "drone", name: "Drone", finishes: ["design-patterns", "solid-pattern", "texture"] },
  { slug: "wireless-earbuds", name: "Wireless Earbuds", finishes: ["printed-designs", "design-patterns", "solid-pattern"] },
  { slug: "charger", name: "Charger", finishes: ["printed-designs", "solid-pattern"] },
];

export type DeviceModel = {
  slug: string;
  brand: string;
  name: string;
  categorySlug: string;
};

export const DEVICE_MODELS: DeviceModel[] = [
  // Phone
  { slug: "iphone-17-pro-max", brand: "Apple", name: "iPhone 17 Pro Max", categorySlug: "phone" },
  { slug: "iphone-17-pro", brand: "Apple", name: "iPhone 17 Pro", categorySlug: "phone" },
  { slug: "iphone-17", brand: "Apple", name: "iPhone 17", categorySlug: "phone" },
  { slug: "iphone-16-pro-max", brand: "Apple", name: "iPhone 16 Pro Max", categorySlug: "phone" },
  { slug: "iphone-16-pro", brand: "Apple", name: "iPhone 16 Pro", categorySlug: "phone" },
  { slug: "iphone-15-pro-max", brand: "Apple", name: "iPhone 15 Pro Max", categorySlug: "phone" },
  { slug: "galaxy-s25-ultra", brand: "Samsung", name: "Galaxy S25 Ultra", categorySlug: "phone" },
  { slug: "galaxy-s24-ultra", brand: "Samsung", name: "Galaxy S24 Ultra", categorySlug: "phone" },
  { slug: "galaxy-z-fold-6", brand: "Samsung", name: "Galaxy Z Fold 6", categorySlug: "phone" },
  { slug: "oneplus-13", brand: "OnePlus", name: "OnePlus 13", categorySlug: "phone" },
  { slug: "oneplus-12", brand: "OnePlus", name: "OnePlus 12", categorySlug: "phone" },
  { slug: "pixel-10-pro", brand: "Google", name: "Pixel 10 Pro", categorySlug: "phone" },
  { slug: "pixel-9-pro", brand: "Google", name: "Pixel 9 Pro", categorySlug: "phone" },
  { slug: "nothing-phone-3", brand: "Nothing", name: "Nothing Phone (3)", categorySlug: "phone" },

  // Laptop
  { slug: "macbook-pro-14-m4", brand: "Apple", name: 'MacBook Pro 14" M4', categorySlug: "laptop" },
  { slug: "macbook-pro-16-m4", brand: "Apple", name: 'MacBook Pro 16" M4', categorySlug: "laptop" },
  { slug: "macbook-air-13-m4", brand: "Apple", name: 'MacBook Air 13" M4', categorySlug: "laptop" },
  { slug: "macbook-air-15-m4", brand: "Apple", name: 'MacBook Air 15" M4', categorySlug: "laptop" },
  { slug: "dell-xps-14", brand: "Dell", name: "XPS 14", categorySlug: "laptop" },
  { slug: "thinkpad-x1-carbon-g12", brand: "Lenovo", name: "ThinkPad X1 Carbon Gen 12", categorySlug: "laptop" },
  { slug: "asus-rog-zephyrus-g14", brand: "Asus", name: "ROG Zephyrus G14", categorySlug: "laptop" },

  // Camera
  { slug: "sony-a7-iv", brand: "Sony", name: "Alpha a7 IV", categorySlug: "camera" },
  { slug: "sony-a7c-ii", brand: "Sony", name: "Alpha a7C II", categorySlug: "camera" },
  { slug: "canon-r6-ii", brand: "Canon", name: "EOS R6 Mark II", categorySlug: "camera" },
  { slug: "canon-r5", brand: "Canon", name: "EOS R5", categorySlug: "camera" },
  { slug: "nikon-z6-iii", brand: "Nikon", name: "Z6 III", categorySlug: "camera" },
  { slug: "fujifilm-xt5", brand: "Fujifilm", name: "X-T5", categorySlug: "camera" },

  // Lens
  { slug: "sony-24-70-gm2", brand: "Sony", name: "FE 24-70mm f/2.8 GM II", categorySlug: "lens" },
  { slug: "sony-70-200-gm2", brand: "Sony", name: "FE 70-200mm f/2.8 GM II", categorySlug: "lens" },
  { slug: "canon-rf-24-105", brand: "Canon", name: "RF 24-105mm f/4L", categorySlug: "lens" },
  { slug: "nikon-z-24-70", brand: "Nikon", name: "Z 24-70mm f/2.8 S", categorySlug: "lens" },

  // Tablet
  { slug: "ipad-pro-13-m4", brand: "Apple", name: 'iPad Pro 13" M4', categorySlug: "tablet" },
  { slug: "ipad-pro-11-m4", brand: "Apple", name: 'iPad Pro 11" M4', categorySlug: "tablet" },
  { slug: "ipad-air-11-m3", brand: "Apple", name: 'iPad Air 11" M3', categorySlug: "tablet" },
  { slug: "galaxy-tab-s10-ultra", brand: "Samsung", name: "Galaxy Tab S10 Ultra", categorySlug: "tablet" },

  // Gimbal
  { slug: "dji-rs-4-pro", brand: "DJI", name: "RS 4 Pro", categorySlug: "gimbal" },
  { slug: "dji-rs-4", brand: "DJI", name: "RS 4", categorySlug: "gimbal" },
  { slug: "dji-osmo-mobile-7p", brand: "DJI", name: "Osmo Mobile 7P", categorySlug: "gimbal" },

  // Gaming console
  { slug: "ps5-slim", brand: "Sony", name: "PlayStation 5 Slim", categorySlug: "gaming-consoles" },
  { slug: "ps5-dualsense", brand: "Sony", name: "DualSense Controller", categorySlug: "gaming-consoles" },
  { slug: "xbox-series-x", brand: "Microsoft", name: "Xbox Series X", categorySlug: "gaming-consoles" },
  { slug: "steam-deck-oled", brand: "Valve", name: "Steam Deck OLED", categorySlug: "gaming-consoles" },
  { slug: "switch-2", brand: "Nintendo", name: "Switch 2", categorySlug: "gaming-consoles" },

  // Drone
  { slug: "dji-mini-5-pro", brand: "DJI", name: "Mini 5 Pro", categorySlug: "drone" },
  { slug: "dji-air-3s", brand: "DJI", name: "Air 3S", categorySlug: "drone" },
  { slug: "dji-mavic-4-pro", brand: "DJI", name: "Mavic 4 Pro", categorySlug: "drone" },
  { slug: "dji-neo", brand: "DJI", name: "Neo", categorySlug: "drone" },

  // Earbuds
  { slug: "airpods-pro-3", brand: "Apple", name: "AirPods Pro 3", categorySlug: "wireless-earbuds" },
  { slug: "airpods-4", brand: "Apple", name: "AirPods 4", categorySlug: "wireless-earbuds" },
  { slug: "galaxy-buds-3-pro", brand: "Samsung", name: "Galaxy Buds 3 Pro", categorySlug: "wireless-earbuds" },
  { slug: "sony-wf-1000xm5", brand: "Sony", name: "WF-1000XM5", categorySlug: "wireless-earbuds" },

  // Charger
  { slug: "apple-20w-adapter", brand: "Apple", name: "20W USB-C Adapter", categorySlug: "charger" },
  { slug: "apple-96w-adapter", brand: "Apple", name: "96W USB-C Adapter", categorySlug: "charger" },
  { slug: "anker-nano-3", brand: "Anker", name: "Nano 3 65W", categorySlug: "charger" },
];

export type Product = {
  slug: string;
  title: string;
  finish: Finish;
  /** categories this design is cut for */
  categories: string[];
  /** base price in paise, per category multiplier applied at variant level */
  basePriceInPaise: number;
  compareAtInPaise?: number;
  /** two CSS gradients used as the stand-in for product photography */
  swatch: [string, string];
  description: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  bestseller?: boolean;
  newArrival?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    slug: "carbon-fibre-black",
    title: "Carbon Fibre Black",
    finish: "texture",
    categories: ["phone", "laptop", "camera", "lens", "gimbal", "drone", "gaming-consoles"],
    basePriceInPaise: 79900,
    compareAtInPaise: 99900,
    swatch: ["#1a1d22", "#34393f"],
    description:
      "A deep 3D carbon weave with a dry, grippy hand feel. The most requested skin we make, and the one we judge every new batch against.",
    tags: ["texture", "grip", "black"],
    rating: 4.8,
    reviewCount: 412,
    bestseller: true,
  },
  {
    slug: "brushed-titanium",
    title: "Brushed Titanium",
    finish: "texture",
    categories: ["phone", "laptop", "camera", "tablet", "charger"],
    basePriceInPaise: 84900,
    swatch: ["#6f7479", "#b9bec4"],
    description:
      "Fine directional grain over a cool grey base. Reads as bare metal in daylight and goes almost graphite indoors.",
    tags: ["texture", "metal", "grey"],
    rating: 4.7,
    reviewCount: 268,
    bestseller: true,
  },
  {
    slug: "matte-midnight",
    title: "Matte Midnight",
    finish: "solid-pattern",
    categories: ["phone", "laptop", "camera", "lens", "tablet", "gimbal", "drone", "wireless-earbuds", "charger", "gaming-consoles"],
    basePriceInPaise: 69900,
    swatch: ["#0b0d10", "#1b1f26"],
    description:
      "A true flat black with no sheen and no sparkle. Hides fingerprints better than any other finish in the range.",
    tags: ["solid", "black", "matte"],
    rating: 4.9,
    reviewCount: 531,
    bestseller: true,
  },
  {
    slug: "arctic-white",
    title: "Arctic White",
    finish: "solid-pattern",
    categories: ["phone", "laptop", "tablet", "wireless-earbuds", "charger"],
    basePriceInPaise: 69900,
    swatch: ["#e9ecef", "#ffffff"],
    description:
      "Clean neutral white with a soft-touch top coat. Pairs with silver and space-grey hardware without clashing.",
    tags: ["solid", "white"],
    rating: 4.6,
    reviewCount: 189,
  },
  {
    slug: "sunset-gradient",
    title: "Sunset Gradient",
    finish: "printed-designs",
    categories: ["phone", "laptop", "tablet", "wireless-earbuds"],
    basePriceInPaise: 74900,
    swatch: ["#ff7a45", "#ffc46b"],
    description:
      "A long amber-to-coral fade printed edge to edge, so the transition lands differently on every device size.",
    tags: ["printed", "gradient", "orange"],
    rating: 4.7,
    reviewCount: 143,
    newArrival: true,
  },
  {
    slug: "deep-ocean",
    title: "Deep Ocean",
    finish: "printed-designs",
    categories: ["phone", "laptop", "tablet", "gaming-consoles"],
    basePriceInPaise: 74900,
    swatch: ["#0b3d5c", "#1f8fb0"],
    description:
      "Layered blues with a faint caustic ripple. Subtle from a distance, detailed up close.",
    tags: ["printed", "blue"],
    rating: 4.5,
    reviewCount: 97,
  },
  {
    slug: "topo-lines",
    title: "Topo Lines",
    finish: "design-patterns",
    categories: ["phone", "laptop", "camera", "lens", "tablet", "gimbal", "drone"],
    basePriceInPaise: 72900,
    swatch: ["#1d2a24", "#5d8f74"],
    description:
      "Contour-map linework in muted sage. Designed for camera bodies where a loud print would be distracting on set.",
    tags: ["pattern", "green", "lines"],
    rating: 4.6,
    reviewCount: 121,
  },
  {
    slug: "circuit-trace",
    title: "Circuit Trace",
    finish: "design-patterns",
    categories: ["phone", "laptop", "tablet", "gaming-consoles", "charger"],
    basePriceInPaise: 72900,
    swatch: ["#12201a", "#2fbf71"],
    description:
      "PCB-inspired traces on a dark board green, with copper-tone vias that catch the light at an angle.",
    tags: ["pattern", "tech", "green"],
    rating: 4.4,
    reviewCount: 88,
  },
  {
    slug: "leather-grain-cognac",
    title: "Leather Grain Cognac",
    finish: "embossed",
    categories: ["laptop", "tablet", "camera"],
    basePriceInPaise: 94900,
    compareAtInPaise: 109900,
    swatch: ["#6b3b1f", "#a8683c"],
    description:
      "Deep pebble emboss in a warm tan. The only finish in the range with real relief you can feel through a fingertip.",
    tags: ["embossed", "leather", "brown"],
    rating: 4.8,
    reviewCount: 156,
    newArrival: true,
  },
  {
    slug: "forged-kevlar",
    title: "Forged Kevlar",
    finish: "texture",
    categories: ["phone", "laptop", "camera", "lens", "drone", "gimbal"],
    basePriceInPaise: 89900,
    swatch: ["#2b2a20", "#6e6a4e"],
    description:
      "Irregular forged weave in olive-bronze. No two cuts land the same way, so every skin is slightly unique.",
    tags: ["texture", "kevlar", "olive"],
    rating: 4.7,
    reviewCount: 74,
    newArrival: true,
  },
  {
    slug: "sandstone-grey",
    title: "Sandstone Grey",
    finish: "solid-pattern",
    categories: ["phone", "laptop", "camera", "tablet", "gimbal", "wireless-earbuds"],
    basePriceInPaise: 69900,
    swatch: ["#5b5f63", "#8d9298"],
    description:
      "Mid-grey with a fine mineral tooth. The safe pick when you want texture without a statement.",
    tags: ["solid", "grey"],
    rating: 4.5,
    reviewCount: 203,
  },
  {
    slug: "aurora-holo",
    title: "Aurora Holo",
    finish: "printed-designs",
    categories: ["phone", "tablet", "wireless-earbuds", "gaming-consoles"],
    basePriceInPaise: 84900,
    swatch: ["#5b2fb0", "#2fd0c4"],
    description:
      "Shifting violet-to-teal holographic print. Loudest skin we sell, and unapologetic about it.",
    tags: ["printed", "holo", "purple"],
    rating: 4.3,
    reviewCount: 61,
    newArrival: true,
  },
];

/* ---------------- price model ---------------- */

/** Bigger surfaces cost more material and cutting time. */
const CATEGORY_MULTIPLIER: Record<string, number> = {
  phone: 1,
  "wireless-earbuds": 0.75,
  charger: 0.7,
  lens: 0.85,
  camera: 1.15,
  gimbal: 1.1,
  drone: 1.3,
  tablet: 1.5,
  "gaming-consoles": 1.6,
  laptop: 1.9,
};

/** Rounded to the nearest ₹10 so carts never show stray paise. */
export function variantPriceInPaise(
  product: Product,
  categorySlug: string,
): number {
  const mult = CATEGORY_MULTIPLIER[categorySlug] ?? 1;
  return Math.round((product.basePriceInPaise * mult) / 1000) * 1000;
}

export function variantCompareAtInPaise(
  product: Product,
  categorySlug: string,
): number | undefined {
  if (!product.compareAtInPaise) return undefined;
  const mult = CATEGORY_MULTIPLIER[categorySlug] ?? 1;
  return Math.round((product.compareAtInPaise * mult) / 1000) * 1000;
}

/* ---------------- lookups (swap for db queries later) ---------------- */

export function getCategory(slug: string): DeviceCategory | undefined {
  return DEVICE_CATEGORIES.find((c) => c.slug === slug);
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function modelsForCategory(categorySlug: string): DeviceModel[] {
  return DEVICE_MODELS.filter((m) => m.categorySlug === categorySlug);
}

export function brandsForCategory(categorySlug: string): string[] {
  return [...new Set(modelsForCategory(categorySlug).map((m) => m.brand))];
}

export function productsForCategory(
  categorySlug: string,
  finish?: Finish,
): Product[] {
  return PRODUCTS.filter(
    (p) =>
      p.categories.includes(categorySlug) && (!finish || p.finish === finish),
  );
}

export function bestsellers(): Product[] {
  return PRODUCTS.filter((p) => p.bestseller);
}

export function newArrivals(): Product[] {
  return PRODUCTS.filter((p) => p.newArrival);
}

export function searchProducts(q: string): Product[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return PRODUCTS.filter((p) =>
    [p.title, p.description, ...p.tags, FINISH_LABEL[p.finish]]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

/** Lowest price this design is available at, for "from ₹x" labels. */
export function fromPriceInPaise(product: Product): number {
  return Math.min(
    ...product.categories.map((c) => variantPriceInPaise(product, c)),
  );
}
