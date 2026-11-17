"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Before/after comparison, rebuilt from the live `image_comparison`
 * section and its stylesheet.
 *
 * Everything below is the theme's own, not a guess:
 *
 *   .image-comparison            { --pos: 50% }  corner-radius-m = 24px
 *   .image-comparison__media     { aspect-ratio: var(--ratio, 16 / 9) }
 *   .image-comparison__handle    { left: var(--pos); width: 2px;
 *                                  background: #fff;
 *                                  transform: translateX(-50%) }
 *   .image-comparison__knob      { width: 4rem; height: 4rem;
 *                                  border-radius: corner-radius-l;
 *                                  background: #fff; color: #111;
 *                                  box-shadow: 0 2px 10px #00000047 }
 *   .image-comparison__label     { bottom: 1.6rem; padding: .4rem 1.2rem;
 *                                  font-size: 1.2rem; letter-spacing: .04em;
 *                                  border-radius: corner-radius-xs;
 *                                  background: #1111119e; color: #fff }
 *   .__label--before { left: 1.6rem }   .__label--after { right: 1.6rem }
 *
 * html is font-size: 62.5%, so 1rem = 10px throughout.
 *
 * Three things were wrong before: the box was 16/10 rather than 16/9,
 * the labels sat at the top (and the "After" one was accent-coloured
 * rather than the theme's translucent black), and the two images were
 * the wrong way round — the markup puts Untitled_design_2 in the AFTER
 * layer and Untitled_design_3 in the clipped BEFORE layer, and I had
 * them swapped.
 *
 * The range input is kept: the theme's handle is pointer-only, and this
 * makes the same control keyboard operable and announce a value.
 */

const AFTER_IMAGE = "/brand/Untitled_design_2.png";
const BEFORE_IMAGE = "/brand/Untitled_design_3.png";

export function BeforeAfter() {
  const [pos, setPos] = useState(50);

  return (
    <section className="page py-6 md:py-10">
      <div className="relative isolate aspect-[16/9] w-full overflow-hidden rounded-[24px]">
        {/* after layer - full width, underneath */}
        <Image
          src={AFTER_IMAGE}
          alt="The same device with an Epro skin applied"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <span className="pointer-events-none absolute bottom-4 right-4 z-[2] rounded-[6px] bg-[#1111119e] px-3 py-1 text-xs font-bold tracking-[0.04em] text-white">
          After
        </span>

        {/* before layer - clipped to the handle position */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={BEFORE_IMAGE}
            alt="The device without a skin"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-[6px] bg-[#1111119e] px-3 py-1 text-xs font-bold tracking-[0.04em] text-white">
            Before
          </span>
        </div>

        {/* handle: 2px white bar with a 40px round knob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-[3] w-0.5 -translate-x-1/2 bg-white"
          style={{ left: `${pos}%` }}
        >
          <span
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full bg-white text-[#111]"
            style={{ boxShadow: "0 2px 10px #00000047" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7.8284 11L13.1213 5.70712L11.7071 4.29291L3.99997 12L11.7071 19.7071L13.1213 18.2929L7.8284 13H20.4142V11H7.8284Z" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="rotate-180">
              <path d="M7.8284 11L13.1213 5.70712L11.7071 4.29291L3.99997 12L11.7071 19.7071L13.1213 18.2929L7.8284 13H20.4142V11H7.8284Z" />
            </svg>
          </span>
        </div>

        {/* the control itself, invisible but on top */}
        <label className="absolute inset-0 z-[4] cursor-ew-resize">
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
