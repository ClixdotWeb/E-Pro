type Props = {
  rating: number;
  count?: number;
  size?: "sm" | "md";
};

export function Stars({ rating, count, size = "sm" }: Props) {
  const px = size === "sm" ? 12 : 16;
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="relative inline-flex"
        role="img"
        aria-label={`Rated ${rating} out of 5`}
      >
        <StarRow px={px} className="text-hairline-strong" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <StarRow px={px} className="text-accent" />
        </div>
      </div>
      {count !== undefined && (
        <span className="text-[11px] text-text-low tabular-nums">({count})</span>
      )}
    </div>
  );
}

function StarRow({ px, className }: { px: number; className: string }) {
  return (
    <div className={`flex shrink-0 gap-0.5 ${className}`} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={px} height={px} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 5.9 6.6.95-4.8 4.65 1.15 6.5L12 17.4l-5.85 3.1L7.3 14 2.5 9.35l6.6-.95L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}
