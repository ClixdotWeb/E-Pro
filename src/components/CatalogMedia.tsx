import Image from "next/image";
import { swatchFor } from "@/lib/catalog-shared";

/**
 * Product imagery for the real catalog.
 *
 * 13 of the 21 imported products have no photo in Shopify yet, so the
 * fallback is not an edge case - it is a third of the grid. A stable
 * hashed swatch keeps those cells looking deliberate instead of broken,
 * and the moment a photo is added in Shopify a re-import picks it up.
 *
 * Photos are still served from Shopify's CDN. They must be moved to our
 * own storage before the domain is switched over, or the new site stops
 * showing products the day the old store is closed.
 */

type Props = {
  src: string | null;
  /** used for the deterministic fallback swatch */
  seed: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function CatalogMedia({
  src,
  seed,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 320px, 50vw",
  priority = false,
}: Props) {
  const [from, to] = swatchFor(seed);

  return (
    <div
      className={`relative overflow-hidden bg-surface-2 ${className}`}
      style={src ? undefined : { background: `linear-gradient(145deg, ${from}, ${to})` }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <>
          {/* specular sweep so a flat swatch still reads as a surface */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.14) 42%, transparent 58%)",
            }}
          />
          <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur">
            Photo coming
          </span>
        </>
      )}
    </div>
  );
}
