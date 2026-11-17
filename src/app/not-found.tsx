import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/realCatalog";

export default function NotFound() {
  return (
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
        {NAV_CATEGORIES.map((c) => (
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
  );
}
