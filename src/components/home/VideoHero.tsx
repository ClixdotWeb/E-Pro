/**
 * Hero — rebuilt to match the live Shopify `video_banner` section
 * exactly, after an earlier version invented a layout that did not
 * exist on the real site.
 *
 * What the live section actually is, from its own markup:
 *
 *   <div class="ctnr">                    page container, NOT full bleed
 *     <div class="corner-radius-m">       --font-body-size(16px) * 1.5 = 24px
 *       <video autoplay muted loop>       desktop video
 *       <video class="d-none-md d-block"> mobile video, swapped at md
 *       <div style="--mh-xs:70vh;--mh-md:70vh"></div>   EMPTY. No text.
 *     </div>
 *   </div>
 *
 * `--overlay: 0`, so there is no scrim either. The video carries the
 * whole section on its own — no headline, no buttons, no stats, no
 * search panel. Those were all my additions and they are what made the
 * page read as a different site.
 *
 * The finder still exists; it now sits in its own band underneath
 * rather than on top of the hero.
 */

/** Desktop video (the theme's first <ecx-load-video>). */
const HERO_VIDEO_DESKTOP =
  "https://jaka1n-rd.myshopify.com/cdn/shop/videos/c/vp/bfcc7b3e56e8480a98f97854d42ad0bb/bfcc7b3e56e8480a98f97854d42ad0bb.HD-1080p-7.2Mbps-91009730.mp4?v=0";
const HERO_POSTER_DESKTOP =
  "https://jaka1n-rd.myshopify.com/cdn/shop/files/preview_images/bfcc7b3e56e8480a98f97854d42ad0bb.thumbnail.0000000000_1920x.jpg?v=1786095431";

/** Mobile video (the theme's `d-none-md d-block` one). */
const HERO_VIDEO_MOBILE =
  "https://jaka1n-rd.myshopify.com/cdn/shop/videos/c/vp/5c0d947a243642b79ab7081df63c644c/5c0d947a243642b79ab7081df63c644c.HD-1080p-7.2Mbps-90999242.mp4?v=0";
const HERO_POSTER_MOBILE =
  "https://jaka1n-rd.myshopify.com/cdn/shop/files/preview_images/5c0d947a243642b79ab7081df63c644c.thumbnail.0000000000_small.jpg?v=1786087935";

export function VideoHero() {
  return (
    <section className="page pt-4">
      <div className="relative h-[70vh] overflow-hidden rounded-[24px] bg-surface-1">
        {/* mobile */}
        <video
          className="absolute inset-0 h-full w-full object-cover md:hidden"
          src={HERO_VIDEO_MOBILE}
          poster={HERO_POSTER_MOBILE}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
        />

        {/* desktop */}
        <video
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          src={HERO_VIDEO_DESKTOP}
          poster={HERO_POSTER_DESKTOP}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
        />
      </div>
    </section>
  );
}
