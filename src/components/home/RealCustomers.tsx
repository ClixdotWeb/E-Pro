import Image from "next/image";

/**
 * "Real Customers - Real Skins", rebuilt from the live theme's
 * `moving_image_banner` markup.
 *
 * The earlier version had this as a heading above a rail of thumbnails.
 * It is not that at all — the images are the BACKGROUND of a single
 * banner, and the heading, subtext and button sit centred on top of
 * them. From the live markup:
 *
 *   .ecx-mask.corner-radius-m
 *     style="--mh-xs:50vh; --mh-md:70vh;
 *            --overlay:45; --color-mask-overlay:0,0,0"
 *     > .d-flex.p-absolute.h-100  style="--time-run: 28s"
 *         > .moving-image-inner  (4 images)
 *         > .moving-image-inner  (the same 4 again)
 *     > .s-header__content  centred, color:#ffffff
 *
 *   .moving-image { width: calc(container-height * --ratio) }  --ratio: 2.0
 *   images are object-fit: contain
 *   .ecx-mask:before { background: rgba(0,0,0, 45/100) }
 *
 * So: 70vh tall, 24px corners, a flat 45% black wash over the moving
 * strip, and the copy on top in white.
 */

const STORIES = [
  "/brand/insta_story_4.png",
  "/brand/insta_story_1.png",
  "/brand/insta_story_2.png",
  "/brand/insta_story_3.png",
];

/** The store's real Instagram, from the button's href. */
const INSTAGRAM = "http://instagram.com/eprogadgets";

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div className="moving-image-inner" aria-hidden={hidden || undefined}>
      {STORIES.map((src, i) => (
        <div key={`${src}-${i}`} className="moving-image relative">
          <Image
            src={src}
            alt={hidden ? "" : `Customer photo ${i + 1}`}
            fill
            sizes="(min-width: 361px) 50vw, 33vw"
            className="object-contain"
            priority={!hidden && i === 0}
          />
        </div>
      ))}
    </div>
  );
}

export function RealCustomers() {
  return (
    <section className="page py-10 md:py-20">
      <div
        className="relative isolate h-[50vh] overflow-hidden rounded-[24px] bg-black md:h-[70vh]"
        style={
          {
            // .moving-image width = container-height * ratio
            "--container-height": "50vh",
            "--time-run": "28s",
          } as React.CSSProperties
        }
      >
        {/* moving strip */}
        <div className="absolute inset-0 flex h-full w-full flex-nowrap md:[--container-height:70vh]">
          <Track />
          <Track hidden />
        </div>

        {/* .ecx-mask:before - flat 45% black, not a gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-black/45"
        />

        {/* centred content */}
        <div className="relative z-[2] flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Real Customers - Real Skins
          </h2>

          {/* The live copy is <em><strong> - bold italic. */}
          <p className="mt-4 text-sm font-bold italic text-white md:text-base">
            Want to see real photos and videos of our products?
          </p>

          {/* .btn.btn-large.btn-secondary - 44px tall (--form-field-lg) */}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-7 inline-flex h-11 items-center gap-2.5 rounded-[var(--r-md)] bg-white px-6 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Follow Us on Instagram
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
