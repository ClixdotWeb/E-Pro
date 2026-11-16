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
      <div className="page">
        <p className="kicker">Want to see real photos and videos?</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi md:text-3xl">
          Real Customers — Real Skins
        </h2>
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

      <div className="page mt-8">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[13px] font-medium text-accent hover:underline"
        >
          See more on Instagram →
        </a>
      </div>
    </section>
  );
}
