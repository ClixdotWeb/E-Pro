import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SkinVisual } from "@/components/SkinVisual";
import {
  DEVICE_CATEGORIES,
  bestsellers,
  newArrivals,
  getProduct,
} from "@/lib/catalog";

export default function HomePage() {
  const hero = getProduct("carbon-fibre-black")!;
  const secondary = getProduct("leather-grain-cognac")!;
  const tertiary = getProduct("aurora-holo")!;

  return (
    <>
      <Hero hero={hero} secondary={secondary} tertiary={tertiary} />
      <CategoryGrid />
      <Rail
        kicker="Most wrapped"
        title="Bestsellers"
        href="/collections/phone"
        products={bestsellers()}
      />
      <RequestModelBanner />
      <Rail
        kicker="Just landed"
        title="New arrivals"
        href="/collections/phone"
        products={newArrivals()}
      />
      <HowItWorks />
      <Faq />
    </>
  );
}

/* ---------------- hero ---------------- */

function Hero({
  hero,
  secondary,
  tertiary,
}: {
  hero: ReturnType<typeof getProduct>;
  secondary: ReturnType<typeof getProduct>;
  tertiary: ReturnType<typeof getProduct>;
}) {
  if (!hero || !secondary || !tertiary) return null;

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 75% 0%, rgba(240,169,59,0.14), transparent 70%)",
        }}
      />

      <div className="page relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="kicker">Since 2013 · Every day is an evolution</p>

          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-text-hi md:text-5xl lg:text-6xl">
            Skins cut for
            <br />
            <span className="text-accent">your exact</span> device.
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-mid">
            Not a case. A 0.2&nbsp;mm precision-cut film that protects every
            edge, port and lens cutout — then peels off clean when you sell the
            device.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/collections/phone"
              className="rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Shop skins
            </Link>
            <Link
              href="/request-model"
              className="rounded-[var(--r-md)] border border-hairline-strong px-5 py-3 text-sm font-semibold text-text-hi transition-colors hover:bg-surface-2"
            >
              Request your model
            </Link>
          </div>

          <dl className="mt-10 grid max-w-sm grid-cols-3 gap-4 border-t border-hairline pt-6">
            {[
              ["260+", "device models"],
              ["1–2 days", "to dispatch"],
              ["0", "adhesive residue"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="text-lg font-semibold tabular-nums text-text-hi">
                  {stat}
                </dt>
                <dd className="mt-0.5 text-[11px] leading-tight text-text-low">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* staggered product collage */}
        <div className="relative mx-auto grid w-full max-w-md grid-cols-5 grid-rows-6 gap-3">
          <div className="col-span-3 row-span-6">
            <SkinVisual
              product={hero}
              shape="phone"
              className="h-full !aspect-auto shadow-pop"
            />
          </div>
          <div className="col-span-2 row-span-3 col-start-4">
            <SkinVisual
              product={secondary}
              shape="square"
              className="h-full !aspect-auto shadow-card"
            />
          </div>
          <div className="col-span-2 row-span-3 col-start-4 row-start-4">
            <SkinVisual
              product={tertiary}
              shape="square"
              className="h-full !aspect-auto shadow-card"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- categories ---------------- */

function CategoryGrid() {
  return (
    <section className="page py-16 md:py-20">
      <header className="mb-7">
        <p className="kicker">Shop by device</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi">
          Pick your gear
        </h2>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {DEVICE_CATEGORIES.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/collections/${cat.slug}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-[var(--r-lg)] border border-hairline bg-surface-1 p-4 transition-colors hover:border-accent hover:bg-surface-2"
            >
              <span className="text-text-low transition-colors group-hover:text-accent">
                <CategoryIcon slug={cat.slug} />
              </span>
              <span>
                <span className="block text-sm font-medium text-text-hi">
                  {cat.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-text-low">
                  {cat.finishes.length} finishes
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- product rails ---------------- */

function Rail({
  kicker,
  title,
  href,
  products,
}: {
  kicker: string;
  title: string;
  href: string;
  products: ReturnType<typeof bestsellers>;
}) {
  return (
    <section className="page py-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="kicker">{kicker}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="shrink-0 text-[13px] font-medium text-accent hover:underline"
        >
          View all →
        </Link>
      </header>

      <ul className="rail -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {products.map((p) => (
          <li
            key={p.slug}
            className="w-[58%] shrink-0 snap-start sm:w-[38%] md:w-auto"
          >
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- request model ---------------- */

function RequestModelBanner() {
  return (
    <section className="page py-10">
      <div className="card relative overflow-hidden px-6 py-12 md:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 120% at 100% 50%, rgba(240,169,59,0.12), transparent 70%)",
          }}
        />
        <div className="relative max-w-lg">
          <p className="kicker">Can&apos;t find your device?</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi md:text-3xl">
            We&apos;ll cut it for you.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">
            Send us the model and we&apos;ll template it. Most requests ship
            within a week, and once a model is cut it joins the catalogue for
            everyone else too.
          </p>
          <Link
            href="/request-model"
            className="mt-6 inline-block rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Request a model
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Clean the surface",
      body: "Wipe the device down with the included alcohol pad and let it dry fully. Dust under film shows.",
    },
    {
      n: "02",
      title: "Align one edge",
      body: "Start from a single edge or cutout, peel back slowly and let the adhesive find the surface.",
    },
    {
      n: "03",
      title: "Heat the curves",
      body: "A hairdryer on low makes the film relax into corners and camera rings without lifting later.",
    },
  ];

  return (
    <section className="page py-16 md:py-20">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Takes about five minutes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi">
            How to apply
          </h2>
        </div>
        <Link
          href="/how-to-apply"
          className="shrink-0 text-[13px] font-medium text-accent hover:underline"
        >
          Full guide →
        </Link>
      </header>

      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="card p-6">
            <span className="font-mono text-xs font-semibold text-accent">
              {s.n}
            </span>
            <h3 className="mt-3 text-base font-semibold text-text-hi">
              {s.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-mid">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- faq ---------------- */

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 1–2 business days. Metro deliveries usually land in 2–4 days after dispatch, and the rest of India in 4–7. You get a tracking link by email and WhatsApp the moment it ships.",
  },
  {
    q: "Is it hard to apply?",
    a: "No. Every skin is precision-cut for one specific model, so there is no trimming and nothing to measure. Warming the film with a hairdryer on low helps it settle into curves — that is the only trick worth knowing.",
  },
  {
    q: "Will it damage my device or leave residue?",
    a: "The adhesive is a removable automotive-grade layer. It peels off clean even after a couple of years and leaves no residue, which is exactly why resale value holds up.",
  },
  {
    q: "What if my device model isn't listed?",
    a: "Use Request Model. Tell us the exact model and we template and cut it, usually within a week. There is no extra charge for a first cut.",
  },
  {
    q: "Can I return a skin?",
    a: "Unopened skins can be returned within 7 days of delivery. If a skin arrives miscut or lifts within 30 days, we replace it free — just send a photo.",
  },
];

function Faq() {
  return (
    <section className="page pb-20">
      <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <header>
          <p className="kicker">Got questions?</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-hi">
            We&apos;ve got answers
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">
            Still stuck? Reach us on WhatsApp — we answer between 10am and 7pm
            IST.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block text-[13px] font-medium text-accent hover:underline"
          >
            Contact us →
          </Link>
        </header>

        <ul className="divide-y divide-hairline border-y border-hairline">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-text-hi marker:content-none">
                  {f.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline text-text-low transition-transform group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-5 pr-10 text-[13px] leading-relaxed text-text-mid">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- icons ---------------- */

const CATEGORY_PATHS: Record<string, string> = {
  phone: "M7 2.5h10a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5zM10 19h4",
  laptop: "M4.5 5.5h15v10h-15zM2 18.5h20l-1.5-3H3.5z",
  camera: "M3 7.5h4L8.5 5h7L17 7.5h4v12H3zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  lens: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM19 6l-3 2",
  tablet: "M5 3h14v18H5zM11 18.5h2",
  gimbal: "M12 3v5M9 8h6v4H9zM12 12v4M7 20h10M12 16l-5 4M12 16l5 4",
  "gaming-consoles": "M7 9h10a5 5 0 0 1 0 10H7a5 5 0 0 1 0-10zM9 12v4M7 14h4M15.5 13.5h.01M17.5 15.5h.01M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3",
  drone: "M9 9h6v6H9zM9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4M5 5a2 2 0 1 0-.01-.01M19 5a2 2 0 1 0-.01-.01M5 19a2 2 0 1 0-.01-.01M19 19a2 2 0 1 0-.01-.01",
  "wireless-earbuds": "M8 4a4 4 0 0 1 4 4v6a3 3 0 0 1-6 0V9M16 4a4 4 0 0 0-4 4v6a3 3 0 0 0 6 0V9",
  charger: "M9 2v4M15 2v4M7 6h10v6a5 5 0 0 1-10 0zM12 17v5",
};

function CategoryIcon({ slug }: { slug: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={CATEGORY_PATHS[slug] ?? CATEGORY_PATHS.phone} />
    </svg>
  );
}
