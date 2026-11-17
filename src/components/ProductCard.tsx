import Link from "next/link";
import { formatPaise } from "@/lib/money";
import { CatalogMedia } from "./CatalogMedia";
import {
  CATEGORY_LABEL,
  FINISH_LABEL,
  type ImportedProduct,
} from "@/lib/realCatalog";

/**
 * Grid card for a real imported product.
 *
 * Shows a price RANGE rather than a single price, because a product's
 * variants genuinely differ in price in this catalog (a camera skin is
 * ₹849-₹1299 depending on brand). Collapsing that to "from ₹849" hid
 * the spread badly enough that a customer could feel misled at checkout.
 */

type Props = {
  product: ImportedProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  const { minPriceInPaise: min, maxPriceInPaise: max } = product;
  const buyable = product.variants.filter((v) => v.available).length;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-surface-1 transition-colors hover:border-hairline-strong focus-visible:border-accent"
    >
      <CatalogMedia
        src={product.images[0] ?? null}
        seed={product.slug}
        alt={product.title}
        priority={priority}
        className="aspect-square"
      />

      <div className="p-3.5">
        <p className="kicker truncate">
          {product.finish
            ? (FINISH_LABEL[product.finish] ?? product.finish)
            : product.category
              ? (CATEGORY_LABEL[product.category] ?? product.category)
              : "Skin"}
        </p>

        <h3 className="mt-1 truncate text-sm font-medium text-text-hi">
          {product.title}
        </h3>

        <p className="mt-2 text-sm text-text-hi">
          <span className="font-semibold tabular-nums">
            {formatPaise(min)}
          </span>
          {max > min && (
            <span className="text-text-low tabular-nums">
              {" – "}
              {formatPaise(max)}
            </span>
          )}
        </p>

        <p className="mt-1 text-[11px] text-text-low tabular-nums">
          {buyable > 0
            ? `${buyable} option${buyable === 1 ? "" : "s"}`
            : "Currently unavailable"}
        </p>
      </div>
    </Link>
  );
}
