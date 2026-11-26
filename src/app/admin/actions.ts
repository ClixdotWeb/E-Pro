"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentStaff, isStaffRole } from "@/auth";
import { UNCATEGORISED } from "@/lib/catalog-shared";

/**
 * Everything the dashboard writes.
 *
 * SECURITY, and this is not a footnote: a Server Action is a POST
 * endpoint. It is reachable whether or not the page that calls it
 * rendered, so locking the admin LAYOUT protects the screens and
 * nothing else. Without the guard below, anyone who knew the
 * deployment URL could delete the catalogue.
 *
 * So every action here awaits `assertCanWrite()` first. It reads the
 * role from the database rather than the session token, for the same
 * reason the layout does: a token is a snapshot and revoking access
 * must take effect on the next request, not in thirty days.
 *
 * The one exception is a shop with no staff at all, which is the
 * state a fresh installation starts in: the dashboard needs an
 * admin, and the only way to make one is the dashboard. While nobody
 * holds a staff role, a signed-in user may write. That hole closes
 * by itself the moment an admin exists, and it never opens to
 * someone who is not signed in.
 */

async function assertCanWrite() {
  const me = await currentStaff();
  if (me && isStaffRole(me.role)) return;

  if (me) {
    const staff = await db.user.count({
      where: { role: { in: ["ADMIN", "STAFF"] } },
    });
    if (staff === 0) return;
  }

  throw new Error(
    "You are not signed in as staff, so this change was refused.",
  );
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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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
  await assertCanWrite();

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

/* ================= flat pricing ================= */

/**
 * Give every option under one product the same price.
 *
 * The phone list prices by coverage, not by model: a Full Wrap costs
 * the same on a Galaxy S24 as on a Redmi 13. Setting 932 rows one at
 * a time in the product editor is not a thing a person does, so this
 * writes them in one statement.
 *
 * It also publishes. A priced draft that stays DRAFT is invisible to
 * the shop, and the only reason those products were drafts is that
 * they had no price - so the moment one arrives they go on sale, with
 * stock, unless the caller says otherwise. Passing 0 is the way back:
 * it unpublishes rather than putting free skins in the window.
 */
export async function setFlatPrice(
  slug: string,
  rupees: string,
  opts: { publish?: boolean; stock?: number } = {},
): Promise<ActionResult> {
  await assertCanWrite();

  const paise = toPaise(rupees);
  if (paise <= 0) {
    return {
      ok: false,
      message: "Type a price above zero. A free skin is not a price.",
    };
  }

  const publish = opts.publish ?? true;
  const stock = Math.max(0, Math.round(opts.stock ?? 10));

  try {
    const product = await db.product.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });
    if (!product) return { ok: false, message: "That product is gone." };

    const { count } = await db.variant.updateMany({
      where: { productId: product.id },
      data: publish
        ? { priceInPaise: paise, stock, active: true }
        : { priceInPaise: paise },
    });

    if (publish) {
      await db.product.update({
        where: { id: product.id },
        data: { status: "ACTIVE" },
      });
    }

    revalidateCatalog(slug);
    safeRevalidate("/admin/pricing");

    return {
      ok: true,
      message: `${product.title}: ${count.toLocaleString("en-IN")} option${
        count === 1 ? "" : "s"
      } at Rs. ${(paise / 100).toLocaleString("en-IN")}${
        publish ? " - now on sale." : "."
      }`,
      slug,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not set the price.",
    };
  }
}

/** Take a product off the shop without touching its prices. */
export async function unpublishProduct(slug: string): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const product = await db.product.update({
      where: { slug },
      data: { status: "DRAFT" },
      select: { title: true },
    });

    revalidateCatalog(slug);
    safeRevalidate("/admin/pricing");

    return { ok: true, message: `${product.title} is off the shop.`, slug };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not unpublish it.",
    };
  }
}

/* ================= designs ================= */

/**
 * Design artwork is uploaded, not typed, so these actions take a File
 * and put it on disk under public/uploads/designs. That directory
 * must be a mounted volume in production - a container's filesystem
 * is thrown away on every deploy, and so would every photograph the
 * shop owner had added.
 *
 * What is accepted is checked against the bytes, not the name: an
 * uploaded file is the one input here that a stranger could choose
 * freely if the dashboard is ever opened up, and "neon.jpg" is not a
 * promise about what is inside it. The stored name is derived from
 * the design's slug and never from the upload's own filename.
 */

const DESIGN_DIR = "public/uploads/designs";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Magic numbers, so the extension cannot lie about the contents. */
function sniffImage(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "png";
  const ascii = (i: number, s: string) =>
    String.fromCharCode(...bytes.slice(i, i + s.length)) === s;
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "webp";
  return null;
}

async function storeDesignImage(
  file: File,
  slug: string,
): Promise<{ url: string } | { error: string }> {
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_IMAGE_BYTES)
    return { error: "That image is over 8 MB. Export it smaller." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind)
    return { error: "Only JPG, PNG and WebP images can be used here." };

  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");

  await mkdir(DESIGN_DIR, { recursive: true });
  const name = `${slug}-${Date.now()}.${kind}`;
  await writeFile(path.join(DESIGN_DIR, name), bytes);

  return { url: `/uploads/designs/${name}` };
}

export type DesignInput = {
  /** empty for a new design */
  id: string;
  name: string;
  categorySlug: string;
  deviceSlugs: string[];
  active: boolean;
  /** rupees, "" or "0" for "no extra charge" */
  price: string;
};

export async function saveDesign(
  input: DesignInput,
  form?: FormData,
): Promise<ActionResult> {
  await assertCanWrite();

  const name = input.name.trim();
  if (!name) return { ok: false, message: "A design needs a name." };
  if (!input.categorySlug)
    return { ok: false, message: "Pick which kind of design this is." };

  const slug = slugify(name) || `design-${Date.now()}`;

  try {
    const clash = await db.design.findFirst({
      where: { slug, NOT: input.id ? { id: input.id } : undefined },
      select: { id: true },
    });
    if (clash)
      return { ok: false, message: `There is already a design called ${name}.` };

    let imageUrl: string | undefined;
    const file = form?.get("image");
    if (file instanceof File && file.size > 0) {
      const stored = await storeDesignImage(file, slug);
      if ("error" in stored) return { ok: false, message: stored.error };
      imageUrl = stored.url;
    }

    const data = {
      slug,
      name,
      categorySlug: input.categorySlug,
      deviceSlugs: input.deviceSlugs,
      active: input.active,
      priceInPaise: toPaise(input.price || "0"),
      ...(imageUrl ? { imageUrl } : {}),
    };

    if (input.id) {
      await db.design.update({ where: { id: input.id }, data });
    } else {
      const last = await db.design.findFirst({
        where: { categorySlug: input.categorySlug },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      await db.design.create({
        data: { ...data, position: (last?.position ?? -1) + 1 },
      });
    }

    revalidateCatalog();
    safeRevalidate("/admin/designs");

    return {
      ok: true,
      message: input.id ? `${name} saved.` : `${name} added.`,
      slug,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save the design.",
    };
  }
}

export async function deleteDesign(id: string): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const d = await db.design.delete({
      where: { id },
      select: { name: true },
    });

    revalidateCatalog();
    safeRevalidate("/admin/designs");

    return { ok: true, message: `${d.name} deleted.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete it.",
    };
  }
}

export async function setDesignActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const d = await db.design.update({
      where: { id },
      data: { active },
      select: { name: true },
    });

    revalidateCatalog();
    safeRevalidate("/admin/designs");

    return {
      ok: true,
      message: active ? `${d.name} is on the shop.` : `${d.name} is hidden.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not change it.",
    };
  }
}

export async function createDesignCategory(
  name: string,
): Promise<ActionResult> {
  await assertCanWrite();

  const clean = name.trim();
  if (!clean) return { ok: false, message: "A kind of design needs a name." };

  const slug = slugify(clean);
  if (!slug) return { ok: false, message: "Use letters or numbers in the name." };

  try {
    const exists = await db.designCategory.findUnique({ where: { slug } });
    if (exists) return { ok: false, message: `${clean} is already there.` };

    const last = await db.designCategory.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });
    await db.designCategory.create({
      data: { slug, name: clean, position: (last?.position ?? -1) + 1 },
    });

    safeRevalidate("/admin/designs");
    return { ok: true, message: `${clean} added.`, slug };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not add it.",
    };
  }
}

/* ================= orders ================= */

/**
 * Move an order to its next stage.
 *
 * One button, labelled with the actual next step, rather than a
 * dropdown of seven statuses that lets someone mark an unpaid order
 * delivered. The path is fixed and forward-only; cancelling is a
 * separate decision and gets its own action.
 *
 * Every move writes an OrderEvent, because "when was this shipped"
 * is a question the shop will be asked by a customer on the phone.
 */
// A "use server" module may only export async functions, so the
// button's labels live beside the button in order-status.ts and only
// the transition itself is here.
const NEXT_STATUS: Record<string, { to: string; note: string }> = {
  PENDING: { to: "CONFIRMED", note: "Order confirmed" },
  CONFIRMED: { to: "PROCESSING", note: "Cutting started" },
  PROCESSING: { to: "SHIPPED", note: "Shipped" },
  SHIPPED: { to: "DELIVERED", note: "Delivered" },
};

export async function advanceOrder(
  orderNumber: string,
  opts: { trackingNumber?: string; courier?: string } = {},
): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: { id: true, status: true },
    });
    if (!order) return { ok: false, message: "No such order." };

    const step = NEXT_STATUS[order.status];
    if (!step)
      return {
        ok: false,
        message: `An order that is ${order.status.toLowerCase()} has nowhere further to go.`,
      };

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          status: step.to as never,
          ...(opts.trackingNumber
            ? { trackingNumber: opts.trackingNumber }
            : {}),
          ...(opts.courier ? { courier: opts.courier } : {}),
        },
      }),
      db.orderEvent.create({
        data: {
          orderId: order.id,
          type: step.to.toLowerCase(),
          message: step.note,
          actor: "dashboard",
        },
      }),
    ]);

    safeRevalidate("/admin/orders");
    safeRevalidate(`/admin/orders/${orderNumber}`);
    safeRevalidate("/admin");

    return { ok: true, message: `${step.note}.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update the order.",
    };
  }
}

export async function cancelOrder(orderNumber: string): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: { id: true, status: true },
    });
    if (!order) return { ok: false, message: "No such order." };

    if (["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status))
      return {
        ok: false,
        message: `An order that is ${order.status.toLowerCase()} cannot be cancelled.`,
      };

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      }),
      db.orderEvent.create({
        data: {
          orderId: order.id,
          type: "cancelled",
          message: "Cancelled",
          actor: "dashboard",
        },
      }),
    ]);

    safeRevalidate("/admin/orders");
    safeRevalidate(`/admin/orders/${orderNumber}`);
    safeRevalidate("/admin");

    return { ok: true, message: "Order cancelled." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not cancel the order.",
    };
  }
}

/* ================= staff ================= */

/**
 * Who may use the dashboard.
 *
 * The last admin cannot demote themselves. It is the one mistake on
 * this screen that cannot be undone from inside the application -
 * with no admin left, nobody can make one - so it is refused rather
 * than confirmed.
 */
export async function setUserRole(
  userId: string,
  role: "CUSTOMER" | "STAFF" | "ADMIN",
): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!target) return { ok: false, message: "No such account." };

    if (target.role === "ADMIN" && role !== "ADMIN") {
      const admins = await db.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1)
        return {
          ok: false,
          message:
            "That is the only admin. Make someone else an admin first, or nobody can get back in.",
        };
    }

    await db.user.update({ where: { id: userId }, data: { role } });

    safeRevalidate("/admin/customers");
    safeRevalidate("/admin");

    const who = target.name ?? target.email;
    return {
      ok: true,
      message:
        role === "CUSTOMER"
          ? `${who} can no longer use the dashboard.`
          : `${who} is now ${role === "ADMIN" ? "an admin" : "staff"}.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not change that.",
    };
  }
}

/* ================= reviews ================= */

/**
 * Moderation.
 *
 * A review arrives hidden and stays hidden until someone here
 * publishes it. That is the whole feature: the shop reads only
 * approved rows, so nothing a stranger types appears on a product
 * page without a person seeing it first.
 */
export async function setReviewApproved(
  id: string,
  approved: boolean,
): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const review = await db.review.update({
      where: { id },
      data: { approved },
      select: { authorName: true, product: { select: { slug: true } } },
    });

    safeRevalidate("/admin/reviews");
    safeRevalidate(`/products/${review.product.slug}`);

    return {
      ok: true,
      message: approved
        ? `${review.authorName}'s review is on the shop.`
        : `${review.authorName}'s review is hidden again.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not change that.",
    };
  }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await assertCanWrite();

  try {
    const review = await db.review.delete({
      where: { id },
      select: { authorName: true, product: { select: { slug: true } } },
    });

    safeRevalidate("/admin/reviews");
    safeRevalidate(`/products/${review.product.slug}`);

    return { ok: true, message: `${review.authorName}'s review is deleted.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete it.",
    };
  }
}
