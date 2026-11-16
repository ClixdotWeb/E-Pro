"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/**
 * Clone of the theme's `image_comparison` section: a draggable divider
 * wiping between the bare device and the skinned one.
 *
 * Driven by a range input rather than pointer maths, so it is keyboard
 * operable and announces a value to screen readers for free — the
 * original theme's slider is mouse-only.
 */

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement>(null);

  return (
    <section className="page py-16 md:py-20">
      <header className="mb-7 max-w-lg">
        <p className="kicker">See the difference</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi md:text-3xl">
          Before and after
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-mid">
          Drag to wipe between a bare device and the same one skinned. No
          bulk, no lip around the screen — the shape does not change.
        </p>
      </header>

      <div
        ref={frame}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--r-lg)] border border-hairline"
      >
        {/* after (full width, underneath) */}
        <Image
          src="/brand/Untitled_design_3.png"
          alt="Device with an Epro skin applied"
          fill
          sizes="(min-width: 1360px) 1296px, 100vw"
          className="object-cover"
          priority={false}
        />

        {/* before (clipped to the slider position) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src="/brand/Untitled_design_2.png"
            alt="The same device without a skin"
            fill
            sizes="(min-width: 1360px) 1296px, 100vw"
            className="object-cover"
          />
        </div>

        {/* divider */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-pop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </span>
        </div>

        {/* labels */}
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          Before
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
          After
        </span>

        {/* the control itself, invisible but on top */}
        <label className="absolute inset-0 cursor-ew-resize">
          <span className="sr-only">Reveal the skinned device</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="h-full w-full cursor-ew-resize opacity-0"
            aria-valuetext={`${pos}% skinned`}
          />
        </label>
      </div>
    </section>
  );
}
