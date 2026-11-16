import type { Finish, Product } from "@/lib/catalog";

/**
 * Stand-in for product photography until real shots are wired up.
 * Renders the design's two-tone swatch plus a finish-specific overlay
 * (weave, grain, print bleed) so the categories are visually distinct
 * in layout review. Swap this component for <Image> on launch.
 */

type Props = {
  product: Product;
  /** device silhouette to mask the design into */
  shape?: "phone" | "laptop" | "square";
  className?: string;
  priority?: boolean;
};

function overlayFor(finish: Finish): React.CSSProperties {
  switch (finish) {
    case "texture":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 3px, transparent 3px 6px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 6px)",
      };
    case "embossed":
      return {
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.14) 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0 2px, transparent 3px)",
        backgroundSize: "14px 14px, 14px 14px",
      };
    case "design-patterns":
      return {
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0 1px, transparent 1px 11px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 11px)",
      };
    case "printed-designs":
      return {
        backgroundImage:
          "radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,0.22), transparent 60%)",
      };
    case "solid-pattern":
      return {
        backgroundImage:
          "linear-gradient(160deg, rgba(255,255,255,0.08), transparent 55%)",
      };
  }
}

const SHAPE_CLASS: Record<NonNullable<Props["shape"]>, string> = {
  phone: "aspect-[3/4]",
  laptop: "aspect-[4/3]",
  square: "aspect-square",
};

export function SkinVisual({ product, shape = "square", className = "" }: Props) {
  const [from, to] = product.swatch;

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--r-md)] ${SHAPE_CLASS[shape]} ${className}`}
      style={{
        background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      {/* finish character */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 mix-blend-overlay"
        style={overlayFor(product.finish)}
      />
      {/* specular sweep so flat colours still read as a physical surface */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.16) 42%, transparent 58%)",
        }}
      />
      {/* edge vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -40px 60px -30px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}
