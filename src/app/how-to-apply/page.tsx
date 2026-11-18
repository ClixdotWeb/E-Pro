import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to apply",
  description:
    "Learn how to apply your premium skins with confidence. Our detailed video tutorials guide you through every step.",
};

const YOUTUBE = "https://youtube.com/@eprogadgets?si=Y01_gy8ZcXJe5v-k";

/**
 * How to apply, from the live /pages/how-to-apply.
 *
 * It is one media-with-text banner: media on the left, a grey panel on
 * the right carrying the heading, a subheading, a paragraph and a white
 * "view all" pill linking to the store's YouTube channel. The whole
 * thing is one corner-radius-m card.
 *
 * Two things worth knowing about the live page:
 *
 *  - The left half is still Shopify's stock placeholder illustration.
 *    No image or video has been uploaded there. A real still is used
 *    here instead, since a placeholder is not a design.
 *  - "Text block heading" is literally the theme's default subheading,
 *    left unchanged. It is reproduced as-is rather than invented over,
 *    but it should be replaced with real copy.
 */
export default function HowToApplyPage() {
  return (
    <section className="page py-10 md:py-20">
      <div className="grid overflow-hidden rounded-[24px] md:grid-cols-2">
        {/* media */}
        <a
          href={YOUTUBE}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative block aspect-[4/3] md:aspect-auto md:min-h-[560px]"
          aria-label="Watch the installation tutorials on YouTube"
        >
          <Image
            src="/brand/Untitled_design_3.png"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-black transition-transform group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </span>
          </span>
        </a>

        {/* copy */}
        <div className="flex flex-col justify-center bg-surface-grey px-8 py-14 md:px-14 md:py-16">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white md:text-[38px]">
            Step-by-Step Installation Tutorials
          </h1>

          <p className="mt-5 text-[15px] font-bold text-white">
            Text block heading
          </p>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
            Learn how to apply your premium skins with confidence. Our detailed
            video tutorials guide you through every step, helping you achieve a
            clean, bubble-free installation on your device.
          </p>

          <a
            href={YOUTUBE}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-9 inline-flex h-12 w-fit items-center gap-3 rounded-full bg-white pl-7 pr-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            view all
            <span className="grid h-8 w-8 place-items-center rounded-full bg-black/10">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
