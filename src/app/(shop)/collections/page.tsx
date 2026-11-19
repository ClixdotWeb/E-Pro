import Link from "next/link";
import type { Metadata } from "next";
import { getNavCategories, getNavFinishes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All collections",
  description:
    "Every device we cut skins for, and every finish we cut them in.",
};

/**
 * Collections index.
 *
 * The header and footer both linked into /collections/<slug> with no
 * index above them, so there was no page that answered "what do you
 * actually make?". This is that page.
 *
 * Categories with nothing in them are shown rather than hidden — the
 * store does cut drones and tablets on request, and hiding them means
 * nobody ever finds that out. They route to /request-model instead of
 * an empty grid.
 */
export default async function CollectionsIndexPage() {
  const [navCategories, navFinishes] = await Promise.all([
    getNavCategories(),
    getNavFinishes(),
  ]);

  const stocked = navCategories.filter((c) => c.count > 0);
  const onRequest = navCategories.filter((c) => c.count === 0);

  return (
    <div className="page py-8 md:py-10">
      <header className="border-b border-hairline pb-6">
        <p className="kicker">Everything we cut</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">
          Collections
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-mid">
          Skins are cut per device model, so pick the device first. If you
          already know your model, the finder is faster.
        </p>
        <Link
          href="/find"
          className="mt-5 inline-block rounded-[var(--r-md)] bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Find my device →
        </Link>
      </header>

      {/* in stock */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-text-hi">
          Ready to ship
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stocked.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}`}
                className="group flex h-full flex-col justify-between gap-6 rounded-[var(--r-lg)] border border-hairline bg-surface-1 p-4 transition-colors hover:border-accent hover:bg-surface-2"
              >
                <span className="text-sm font-medium text-text-hi">
                  {c.name}
                </span>
                <span className="text-[11px] text-text-low tabular-nums">
                  {c.count} option{c.count === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* on request */}
      {onRequest.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold text-text-hi">Cut on request</h2>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-text-mid">
            We template these when someone asks. There is no extra charge for a
            first cut, and it usually takes about a week.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {onRequest.map((c) => (
              <li key={c.slug}>
                <Link
                  href="/request-model"
                  className="inline-block rounded-full border border-hairline px-3.5 py-2 text-[13px] text-text-mid transition-colors hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* finishes */}
      {navFinishes.length > 0 && (
        <section className="mt-12 border-t border-hairline pt-10">
          <h2 className="text-sm font-semibold text-text-hi">By finish</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {navFinishes.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/collections/${f.slug}`}
                  className="inline-block rounded-full border border-hairline px-3.5 py-2 text-[13px] text-text-mid transition-colors hover:border-accent hover:text-accent"
                >
                  {f.name}
                  <span className="ml-1.5 tabular-nums opacity-55">
                    {f.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
