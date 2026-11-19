"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { UNCATEGORISED } from "@/lib/catalog-shared";

/**
 * Everything the dashboard writes.
 *
 * SECURITY, and this is not a footnote: a Server Action is a POST
 * endpoint. It is reachable whether or not the page that calls it
 * rendered, so locking the admin LAYOUT in production protects the
 * screens and nothing else. Without the guard below, anyone who knew
 * the deployment URL could delete the catalogue.
 *
 * So every action here calls `assertCanWrite()` first. It is a
 * stand-in for a session check, using the same gate as the layout:
 * development, or production with ALLOW_INSECURE_ADMIN=1 explicitly
 * set. When Auth.js is wired, replace its body with the session and
 * role check and delete the env flag - do not add the session check
 * alongside it and leave the flag working.
 */

function assertCanWrite() {
  const open =
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_INSECURE_ADMIN === "1";

  if (!open) {
    throw new Error(
      "The dashboard is locked. Sign-in is not wired yet, so writing is refused in production.",
    );
  }
}

/** Both the shop and the dashboard show this data. Refresh both. */
function revalidateCatalog(slug?: string) {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    if (slug) revalidatePath(`/products/${slug}`);
  } catch {
    // Called outside a request, from a script or a test. The write
    // already happened and must not be reported as a failure just
    // because the cache hint afterwards could not run - which is
    // exactly the bug a test caught here.
  }
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // see revalidateCatalog
  }
}

export type ActionResult =
  | { ok: true; message: string; slug?: string }
  | { ok: false; message: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Rupees typed by a human -> integer paise. Never a float near money. */
function toPaise(rupees: string): number {
  const n = Number(rupees);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

/* ================= products ================= */

export type VariantInput = {
  /** existing Variant id, or empty for a new row */
  id: string;
  title: string;
  price: string;
  stock: string;
  sku: string;
};

export type ProductInput = {
  slug: string;
  title: string;
  description: string;
  category: string;
  finish: string;
  status: "draft" | "active";
  optionLabel: string;
  variants: VariantInput[];
};

export async function saveProduct(
  input: ProductInput,
  mode: "new" | "edit",
): Promise<ActionResult> {
  assertCanWrite();

  const title = input.title.trim();
  if (!title) return { ok: false, message: "A product needs a name." };

  const variants = input.variants.filter((v) => v.title.trim() || v.price.trim());
  if (variants.length === 0) {
    return { ok: false, message: "Add at least one option with a price." };
  }
  if (variants.some((v) => !v.price.trim())) {
    return { ok: false, message: "Every option needs a price." };
  }

  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, message: "That name cannot become a link." };

  const categorySlug = input.category || UNCATEGORISED;

  try {
    const category = await db.deviceCategory.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      return { ok: false, message: `No category called "${categorySlug}".` };
    }

    const clash = await db.product.findUnique({ where: { slug } });
    if (mode === "new" && clash) {
      return { ok: false, message: `A product already lives at /${slug}.` };
    }

    const product = await db.product.upsert({
      where: { slug },
      update: {
        title,
        description: input.description.trim() || null,
        finish: input.finish || null,
        status: input.status === "active" ? "ACTIVE" : "DRAFT",
      },
      create: {
        slug,
        title,
        description: input.description.trim() || null,
        finish: input.finish || null,
        status: input.status === "active" ? "ACTIVE" : "DRAFT",
        tags: [],
      },
    });

    const keptIds: string[] = [];

    for (const v of variants) {
      const name = v.title.trim() || "Default";
      const modelSlug = slugify(`${categorySlug}-${name}`);

      const model = await db.deviceModel.upsert({
        where: { slug: modelSlug },
        update: {
          name,
          brand: input.optionLabel || "Model",
          categoryId: category.id,
        },
        create: {
          slug: modelSlug,
          name,
          brand: input.optionLabel || "Model",
          categoryId: category.id,
        },
      });

      const stock = Math.max(0, Math.round(Number(v.stock) || 0));

      const saved = await db.variant.upsert({
        where: {
          productId_deviceModelId: {
            productId: product.id,
            deviceModelId: model.id,
          },
        },
        update: {
          sku: v.sku.trim() || `EPRO-${slug}-${modelSlug}`.toUpperCase(),
          priceInPaise: toPaise(v.price),
          stock,
          active: stock > 0,
        },
        create: {
          productId: product.id,
          deviceModelId: model.id,
          sku: v.sku.trim() || `EPRO-${slug}-${modelSlug}`.toUpperCase(),
          priceInPaise: toPaise(v.price),
          stock,
          active: stock > 0,
        },
      });

      keptIds.push(saved.id);
    }

    // Options removed in the form go too - but only ones nobody has
    // ordered. A variant with order history stays, because deleting it
    // would take the line item off a past order with it.
    const orphans = await db.variant.findMany({
      where: { productId: product.id, id: { notIn: keptIds } },
      select: { id: true, _count: { select: { orderItems: true } } },
    });

    const deletable = orphans.filter((o) => o._count.orderItems === 0);
    if (deletable.length > 0) {
      await db.variant.deleteMany({
        where: { id: { in: deletable.map((o) => o.id) } },
      });
    }

    const kept = orphans.length - deletable.length;

    revalidateCatalog(slug);

    return {
      ok: true,
      slug,
      message:
        kept > 0
          ? `Saved. ${kept} option${kept === 1 ? "" : "s"} could not be removed — ${kept === 1 ? "it is" : "they are"} on a past order.`
          : mode === "new"
            ? "Product added."
            : "Saved.",
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save.",
    };
  }
}

export async function deleteProduct(slug: string): Promise<ActionResult> {
  assertCanWrite();

  try {
    const product = await db.product.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        variants: { select: { _count: { select: { orderItems: true } } } },
      },
    });

    if (!product) return { ok: false, message: "That product is already gone." };

    const ordered = product.variants.reduce(
      (n, v) => n + v._count.orderItems,
      0,
    );
    if (ordered > 0) {
      return {
        ok: false,
        message: `"${product.title}" is on ${ordered} order line${ordered === 1 ? "" : "s"} and cannot be deleted. Set it to Draft instead to hide it from the shop.`,
      };
    }

    await db.product.delete({ where: { id: product.id } });
    revalidateCatalog();

    return { ok: true, message: `"${product.title}" deleted.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete.",
    };
  }
}

/* ================= stock ================= */

export async function saveStock(
  changes: { id: string; stock: number }[],
): Promise<ActionResult> {
  assertCanWrite();

  if (changes.length === 0) return { ok: true, message: "Nothing to save." };

  try {
    await db.$transaction(
      changes.map((c) =>
        db.variant.update({
          where: { id: c.id },
          data: {
            stock: Math.max(0, Math.round(c.stock)),
            // Out of stock means not sellable; the shop reads `active`.
            active: c.stock > 0,
          },
        }),
      ),
    );

    revalidateCatalog();

    return {
      ok: true,
      message: `Stock saved for ${changes.length} option${changes.length === 1 ? "" : "s"}.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save stock.",
    };
  }
}

/* ================= categories ================= */

export async function createCategory(name: string): Promise<ActionResult> {
  assertCanWrite();

  const clean = name.trim();
  if (!clean) return { ok: false, message: "A category needs a name." };

  const slug = slugify(clean);
  if (!slug) return { ok: false, message: "That name cannot become a link." };

  try {
    const exists = await db.deviceCategory.findUnique({ where: { slug } });
    if (exists) return { ok: false, message: `"${clean}" already exists.` };

    const count = await db.deviceCategory.count();
    await db.deviceCategory.create({
      data: { slug, name: clean, position: count },
    });

    revalidateCatalog();
    return { ok: true, message: `"${clean}" added.`, slug };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not add it.",
    };
  }
}

export async function renameCategory(
  slug: string,
  name: string,
): Promise<ActionResult> {
  assertCanWrite();

  const clean = name.trim();
  if (!clean) return { ok: false, message: "A category needs a name." };

  try {
    await db.deviceCategory.update({
      where: { slug },
      data: { name: clean },
    });
    revalidateCatalog();
    return { ok: true, message: "Renamed." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not rename it.",
    };
  }
}

export async function deleteCategory(slug: string): Promise<ActionResult> {
  assertCanWrite();

  if (slug === UNCATEGORISED) {
    return {
      ok: false,
      message: "Uncategorised is where products land when they have no device. It cannot be removed.",
    };
  }

  try {
    const category = await db.deviceCategory.findUnique({
      where: { slug },
      select: { id: true, name: true, _count: { select: { models: true } } },
    });

    if (!category) return { ok: false, message: "That category is already gone." };

    if (category._count.models > 0) {
      return {
        ok: false,
        message: `"${category.name}" still has ${category._count.models} option${category._count.models === 1 ? "" : "s"} in it. Move those products to another device first.`,
      };
    }

    await db.deviceCategory.delete({ where: { id: category.id } });
    revalidateCatalog();

    return { ok: true, message: `"${category.name}" deleted.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete it.",
    };
  }
}

/* ================= discounts ================= */

export type DiscountInput = {
  code: string;
  type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  /** percent for PERCENT, paise for FIXED */
  value: number;
  minOrderInPaise: number;
  maxUses: number | null;
};

export async function createDiscount(
  input: DiscountInput,
): Promise<ActionResult> {
  assertCanWrite();

  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: "A code needs some letters." };

  if (input.type === "PERCENT" && (input.value <= 0 || input.value > 100)) {
    return { ok: false, message: "A percentage has to be between 1 and 100." };
  }
  if (input.type === "FIXED" && input.value <= 0) {
    return { ok: false, message: "Set how much it takes off." };
  }

  try {
    const exists = await db.discount.findUnique({ where: { code } });
    if (exists) return { ok: false, message: `${code} already exists.` };

    await db.discount.create({
      data: {
        code,
        type: input.type,
        value: input.value,
        minOrderInPaise: input.minOrderInPaise,
        maxUses: input.maxUses,
        active: true,
      },
    });

    safeRevalidate("/admin/discounts");
    return { ok: true, message: `${code} created.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not create it.",
    };
  }
}

export async function setDiscountActive(
  code: string,
  active: boolean,
): Promise<ActionResult> {
  assertCanWrite();

  try {
    await db.discount.update({ where: { code }, data: { active } });
    safeRevalidate("/admin/discounts");
    return { ok: true, message: active ? `${code} is on.` : `${code} is off.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not change it.",
    };
  }
}

export async function deleteDiscount(code: string): Promise<ActionResult> {
  assertCanWrite();

  try {
    await db.discount.delete({ where: { code } });
    safeRevalidate("/admin/discounts");
    return { ok: true, message: `${code} deleted.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete it.",
    };
  }
}
