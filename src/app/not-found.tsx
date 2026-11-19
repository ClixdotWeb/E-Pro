import Link from "next/link";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Root 404. It sits above the (shop) route group, so it renders in
 * the bare root layout and has to bring the storefront chrome itself.
 */
/**
 * The 404 lists the devices from the static label map rather than the
 * database. It only needs names and links, and keeping it off the
 * database means the build can collect this page without one - the
 * Docker build has no database reachable.
 */
export default function NotFound() {
  const navCategories = Object.entries(CATEGORY_LABEL).map(([slug, name]) => ({
    slug,
    name,
  }));

  return (
    <>
      <Header navCategories={navCategories} />
      <main id="main" className="flex-1">
    <div className="page grid place-items-center py-28 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-accent">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-hi">
        This page peeled off.
      </h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-text-mid">
        The link is broken or the design has been retired. Pick a device below,
        or search for a finish.
      </p>

      <ul className="mt-8 flex max-w-lg flex-wrap justify-center gap-2">
        {navCategories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/collections/${c.slug}`}
              className="inline-block rounded-full border border-hairline px-3.5 py-2 text-[13px] text-text-mid transition-colors hover:border-accent hover:text-accent"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Back home
        </Link>
        <Link
          href="/search"
          className="rounded-[var(--r-md)] border border-hairline-strong px-5 py-3 text-sm font-semibold text-text-hi hover:bg-surface-2"
        >
          Search
        </Link>
      </div>
    </div>
      </main>
      <Footer />
    </>
  );
}
