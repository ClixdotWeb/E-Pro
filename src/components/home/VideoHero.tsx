import Link from "next/link";
import { SkinFinder } from "@/components/SkinFinder";

/**
 * Clone of the theme's `video_banner` section: a full-bleed autoplaying
 * muted loop with the headline and actions over it.
 *
 * The source videos are 47 MB and 13 MB 1080p files served from Shopify's
 * CDN. They are referenced rather than copied, and both facts need fixing
 * before launch - see the note in the project README.
 */

const HERO_VIDEO =
  "https://jaka1n-rd.myshopify.com/cdn/shop/videos/c/vp/5c0d947a243642b79ab7081df63c644c/5c0d947a243642b79ab7081df63c644c.HD-1080p-7.2Mbps-90999242.mp4?v=0";

export function VideoHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* video layer */}
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={HERO_VIDEO}
        poster="/brand/Untitled_design_2.png"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
      />

      {/* legibility scrim - the source video is bright in places */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <div className="page grid items-center gap-10 py-20 md:min-h-[620px] md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] md:py-28">
        <div>
          <p className="kicker text-white/50">
            Since 2013 · Every day is an evolution
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            Skins cut for
            <br />
            <span className="text-accent">your exact</span> device.
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            Not a case. A 0.2&nbsp;mm precision-cut film that protects every
            edge, port and lens cutout — then peels off clean when you sell the
            device.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/find"
              className="rounded-[var(--r-md)] bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Find my device
            </Link>
            <Link
              href="/request-model"
              className="rounded-[var(--r-md)] border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Request your model
            </Link>
          </div>

          <dl className="mt-10 grid max-w-sm grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {[
              ["205", "variants cut"],
              ["1–2 days", "to dispatch"],
              ["0", "adhesive residue"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="text-lg font-semibold tabular-nums text-white">
                  {stat}
                </dt>
                <dd className="mt-0.5 text-[11px] leading-tight text-white/50">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The finder lives in the hero so the first interaction can be
            "add to cart" rather than "browse a category". */}
        <div className="rounded-[var(--r-lg)] border border-white/15 bg-black/70 p-4 backdrop-blur-xl md:p-5">
          <p className="mb-3 text-[13px] font-semibold text-white">
            Find your skin in one step
          </p>
          <SkinFinder compact />
        </div>
      </div>
    </section>
  );
}
