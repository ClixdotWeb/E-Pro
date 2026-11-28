import { getSettings } from "@/lib/settings";
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

/**
 * Both videos are served from this site.
 *
 * They were loaded straight off the Shopify CDN, which meant the
 * homepage of the shop we are replacing depended on the shop it is
 * replacing: the day that store closes, the hero goes black. The same
 * files now live in public/brand/video - 13MB desktop, 45MB mobile,
 * byte for byte what the live site serves.
 */
// The poster is the video's own path with the extension swapped,
// which is how the files are named and one fewer thing to set.
function posterFor(video: string): string {
  return video.replace(/\.(mp4|webm|mov)$/i, ".jpg");
}

export async function VideoHero() {
  const settings = await getSettings();
  const HERO_VIDEO_DESKTOP = settings["home.videoDesktop"];
  const HERO_VIDEO_MOBILE = settings["home.videoMobile"];
  const HERO_POSTER_DESKTOP = posterFor(HERO_VIDEO_DESKTOP);
  const HERO_POSTER_MOBILE = posterFor(HERO_VIDEO_MOBILE);

  return (
    /* The live hero is a `.s--banner-spacing` first section:
       padding-block-start = --s-banner-outer-p-y / 2
                           = (4 * 20px gutter) / 2 = 40px,
       and padding-block-end = 80px. */
    <section className="page pt-6 pb-10 md:pt-10 md:pb-20">
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
