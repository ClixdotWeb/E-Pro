import Link from "next/link";
import { formatPaise } from "@/lib/money";
import { CatalogMedia } from "./CatalogMedia";
import type { CatalogProduct } from "@/lib/catalog-shared";

/**
 * Product card, rebuilt from the live grid's own markup.
 *
 *   .product-card__wrapper.d-grid.gap-16
 *     .card__media.corner-radius-s      square, 12px radius
 *       a (covers the media)
 *       .product__buttons -> "Quick Shop" btn-secondary btn-icon
 *     .card__content > .card__info
 *       h3.card__heading.fw-700.mb-4  -> a  (title)
 *       .card__price-wrapper          -> "Rs. 949.00 INR"
 *
 * --font-card-heading-size is --font-body-size, so the title is 16px
 * in the heading family at weight 700.
 *
 * Two things I had added are gone: the price RANGE ("Rs. 849 – Rs.
 * 1,299") and the "N options" line underneath. The live card shows one
 * plain price and nothing else. The badge slot above the media exists
 * in the markup but renders empty on this store, so there is no
 * bestseller/new flag to show.
 */

type Props = {
  product: CatalogProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  return (
    <div className="grid gap-4">
      {/* media */}
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.title}
          className="block"
        >
          <CatalogMedia
            src={product.images[0] ?? null}
            seed={product.slug}
            alt={product.title}
            priority={priority}
            className="aspect-square rounded-[12px]"
          />
        </Link>

        {/* Quick Shop, as the live card carries it */}
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Quick Shop ${product.title}`}
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-[6px] border border-hairline bg-surface-0/80 text-text-hi backdrop-blur transition-colors hover:border-accent hover:text-accent"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.3-4.3M11 8v6M8 11h6" />
          </svg>
        </Link>
      </div>

      {/* content */}
      <div>
        <h3 className="mb-1 text-[16px] font-bold leading-[1.25] text-text-hi">
          <Link href={`/products/${product.slug}`} className="hover:text-accent">
            {product.title}
          </Link>
        </h3>

        <p className="text-[14px] text-text-mid">
          {formatPaise(product.minPriceInPaise)}
        </p>
      </div>
    </div>
  );
}
