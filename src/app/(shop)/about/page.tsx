import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { VideoHero } from "@/components/home/VideoHero";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "About us",
  description:
    "We believe the best device protection is built through millimeter precision, not bulky cases.",
};

/**
 * About us, from the live /pages/camera?view=about-us.
 *
 * Sections, in order:
 *
 *   video_banner      the same hero video as the homepage - the three
 *                     product shots in the screenshot are one frame of
 *                     it, not a separate gallery
 *   Our Philosophy    badge + one large centred paragraph, with
 *                     "precision," and "individuality." in accent
 *   How it works      badge + "Your Idea Our Creation" + three cards
 *   Customer story    badge + pull quote + a link, beside a video still
 *                     captioned Johnny S. / Tech Creator & Reviewer
 *   newsletter        the same block as the homepage, but headed
 *                     "Join us now" rather than "Newsletter"
 *
 * All copy is the store's own.
 */

const STEPS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: "Choose Your Gadget & Style",
    body: "Select your exact smartphone, laptop, tablet, or gaming console and customize it with premium skins in Carbon, Matte, Leather, and more.",
    icon: (
      <path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3L12 2.5zM3.5 7.3L12 12l8.5-4.7M12 12v9.5" />
    ),
  },
  {
    title: "Precision-Cut Premium Skins",
    body: "Every skin is precision-cut for your device using premium materials, ensuring a perfect fit, smooth finish, and easy bubble-free application.",
    icon: (
      <path d="M12 2.5l2.2 5.9 5.9 2.2-5.9 2.2L12 18.7l-2.2-5.9L3.9 10.6l5.9-2.2L12 2.5z" />
    ),
  },
  {
    title: "Residue-Free Removal",
    body: "Upgrade your gadget's look with premium skins designed for a clean finish and easy removal, helping keep your device looking its best.",
    icon: (
      <>
        <path d="M12 2.5l8 3.2v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6l8-3.2z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <VideoHero />

      {/* ---- our philosophy ---- */}
      <section className="page py-10 text-center md:py-20">
        <Badge>Our Philosophy</Badge>

        <p className="mx-auto mt-9 max-w-4xl text-[22px] font-medium leading-[1.5] tracking-tight text-text-hi md:text-[34px]">
          We believe the best device protection is built through millimeter{" "}
          <span className="text-accent">precision,</span> not bulky cases.
          Every skin is engineered to elevate your grip, defend against daily
          scratches, and showcase your pure{" "}
          <span className="text-accent">individuality.</span>
        </p>
      </section>

      {/* ---- how it works ---- */}
      <section className="page py-10 text-center md:py-20">
        <Badge>How it works</Badge>

        <h2 className="mt-7 text-[30px] font-bold tracking-tight text-text-hi md:text-[44px]">
          Your Idea Our Creation
        </h2>

        <ul className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="rounded-2xl border border-hairline bg-surface-1 p-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-accent/35 text-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {s.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-[17px] font-bold text-text-hi">
                {s.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-text-mid">
                {s.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- customer story ---- */}
      <section className="page py-10 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <Badge>Customer story</Badge>

            <blockquote
              className="mt-7 max-w-xl rounded-xl px-5 py-4 text-[26px] font-bold leading-[1.3] tracking-tight text-text-hi md:text-[34px]"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, rgba(0,164,79,0.16) 0%, transparent 85%)",
              }}
            >
              &ldquo;The 0.1mm precision fit and textured grip completely
              transformed my device. Zero bulk, premium 3M quality, and
              effortless bubble-free installation.&rdquo;
            </blockquote>

            <Link
              href="/collections"
              className="mt-8 inline-flex items-center gap-2.5 text-[14px] font-bold text-text-hi hover:text-accent"
            >
              Explore Our Skins
              <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>

          <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/brand/customer-story-thumb.jpg"
              alt="Johnny S., tech creator and reviewer, at his desk"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />

            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </span>
            </span>

            <figcaption className="absolute bottom-5 left-6">
              <span className="block text-[15px] font-bold text-white">
                Johnny S.
              </span>
              <span className="mt-0.5 block text-[12px] text-white/70">
                Tech Creator &amp; Reviewer
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The same newsletter block, headed "Join us now" here. */}
      <Newsletter heading="Join us now" />
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/45 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}
