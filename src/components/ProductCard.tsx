import Link from "next/link";
import { FINISH_LABEL, fromPriceInPaise, type Product } from "@/lib/catalog";
import { formatPaise } from "@/lib/money";
import { SkinVisual } from "./SkinVisual";
import { Stars } from "./Stars";

type Props = {
  product: Product;
  /** preselect a device category on the product page */
  categorySlug?: string;
  shape?: "phone" | "laptop" | "square";
};

export function ProductCard({ product, categorySlug, shape = "square" }: Props) {
  const href = categorySlug
    ? `/products/${product.slug}?device=${categorySlug}`
    : `/products/${product.slug}`;

  const price = fromPriceInPaise(product);

  return (
    <Link
      href={href}
      className="group block rounded-[var(--r-lg)] border border-hairline bg-surface-1 p-2.5 transition-colors hover:border-hairline-strong focus-visible:border-accent"
    >
      <div className="relative">
        <SkinVisual
          product={product}
          shape={shape}
          className="transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {(product.bestseller || product.newArrival) && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              product.newArrival
                ? "bg-accent text-accent-ink"
                : "bg-surface-0/80 text-text-hi backdrop-blur"
            }`}
          >
            {product.newArrival ? "New" : "Bestseller"}
          </span>
        )}
      </div>

      <div className="px-1 pb-1 pt-3">
        <p className="kicker">{FINISH_LABEL[product.finish]}</p>

        <h3 className="mt-1 truncate text-sm font-medium text-text-hi">
          {product.title}
        </h3>

        <div className="mt-1.5">
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>

        <p className="mt-2 text-sm text-text-hi">
          <span className="text-text-low">from </span>
          <span className="font-semibold tabular-nums">
            {formatPaise(price)}
          </span>
        </p>
      </div>
    </Link>
  );
}
