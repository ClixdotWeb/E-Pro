"use server";

// No "server-only" here on purpose. A "use server" module already is
// server-only, and a client component importing an action from it
// gets a reference rather than the body - but pairing the two is the
// kind of thing that bites when the bundler changes its mind about
// which graph the module belongs to.
import { db } from "@/lib/db";
import { offersLogoCutout, FINISH_LABEL } from "@/lib/catalog-shared";
import { getSettings, logoCutoutBrandsFrom } from "@/lib/settings";

/**
 * What we can cut for one device.
 *
 * Fetched when the customer picks their device rather than shipped
 * with the page: a design cut for phones has 1,033 devices and 2,400
 * options behind it, and all of it exists to show four lines.
 *
 * It answers for a device that cannot be bought too - out of stock,
 * unpriced - because "Back Only, not available for this one" is the
 * answer, and a silently shorter list is not.
 */

export type CoverageOption = {
  variantId: string;
  label: string;
  priceInPaise: number;
  available: boolean;
  reason: string | null;
};

export type DeviceCoverages = {
  deviceName: string;
  brand: string;
  category: string;
  /** "Coverage" for phones, "Material" for everything else */
  optionLabel: string;
  logoCutout: boolean;
  options: CoverageOption[];
};

export async function getCoveragesFor(
  deviceModelId: string,
): Promise<DeviceCoverages | null> {
  const model = await db.deviceModel.findFirst({
    where: { id: deviceModelId, active: true },
    select: {
      brand: true,
      name: true,
      category: { select: { slug: true } },
      variants: {
        select: {
          id: true,
          active: true,
          stock: true,
          priceInPaise: true,
          product: { select: { title: true, finish: true, status: true } },
        },
      },
    },
  });
  if (!model) return null;

  const category = model.category.slug;
  const logoBrands = logoCutoutBrandsFrom(await getSettings());

  const options: CoverageOption[] = model.variants
    .filter((v) => v.product.status === "ACTIVE")
    .map((v) => {
      const finish = v.product.finish;
      const label =
        (finish && FINISH_LABEL[finish]) ??
        v.product.title.replace(/^.*?-\s*/, "");

      const unpriced = v.priceInPaise <= 0;
      const soldOut = v.stock <= 0 || !v.active;

      return {
        variantId: v.id,
        label,
        priceInPaise: v.priceInPaise,
        available: !unpriced && !soldOut,
        reason: unpriced ? "N/A" : soldOut ? "Out of stock" : null,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    deviceName: model.name,
    brand: model.brand,
    category,
    optionLabel: category === "phone" ? "Coverage" : "Material",
    logoCutout: offersLogoCutout(category, model.brand, logoBrands),
    options,
  };
}
