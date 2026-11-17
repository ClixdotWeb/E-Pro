import Image from "next/image";

/**
 * Clone of the theme's `moving_image_banner` section — the real store
 * runs the four Instagram story stills past in a continuous rail under
 * the heading "Real Customers - Real Skins".
 *
 * The track is duplicated so the CSS translate can loop at -50% without
 * a visible seam. Pauses on hover; the keyframes are disabled entirely
 * under prefers-reduced-motion by the global rule.
 */

const STORIES = [
  "/brand/insta_story_1.png",
  "/brand/insta_story_2.png",
  "/brand/insta_story_3.png",
  "/brand/insta_story_4.png",
];

export function RealCustomers() {
  return (
    <section className="border-y border-hairline bg-surface-1 py-14">
      {/* Heading, then subtext, then the button - the order the live
          section uses. An earlier version had the subtext above as a
          kicker, which reads as a different page. */}
      <div className="page text-center">
        <h2 className="text-2xl font-bold tracking-tight text-text-hi md:text-[28px]">
          Real Customers - Real Skins
        </h2>
        <p className="mt-2.5 text-sm text-text-mid">
          Want to see real photos and videos of our products?
        </p>
      </div>

      <div className="marquee mt-8 overflow-hidden">
        <div className="marquee-track gap-4">
          {[...STORIES, ...STORIES].map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative aspect-[9/16] w-[210px] shrink-0 overflow-hidden rounded-[var(--r-lg)] border border-hairline md:w-[260px]"
            >
              <Image
                src={src}
                alt={
                  i < STORIES.length
                    ? `Customer photo ${i + 1}`
                    : /* duplicated for the seamless loop */ ""
                }
                fill
                sizes="260px"
                className="object-cover"
                aria-hidden={i >= STORIES.length}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="page mt-8 text-center">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-block rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Follow Us on Instagram
        </a>
      </div>
    </section>
  );
}
