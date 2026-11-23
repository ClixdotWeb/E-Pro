"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPaise } from "@/lib/money";
import type { ModelSummary } from "@/lib/catalog";

/**
 * The model list for one brand.
 *
 * Samsung has 236 models and Vivo 187. A plain list that long is not
 * a list, it is a wall, so this opens with the search box focused on
 * the one thing the customer already knows: the name on their phone.
 *
 * It filters on every keystroke, client-side, because the whole brand
 * is already here - a round trip per letter would be slower and would
 * break typing on a bad connection. Matching ignores spaces and
 * punctuation, so "s24ultra", "S24 Ultra" and "galaxy-s24-ultra" all
 * find the same row.
 */

/** Below this there is nothing to search for. */
const SEARCH_THRESHOLD = 12;

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function ModelPicker({
  category,
  brandSlug,
  brand,
  models,
}: {
  category: string;
  brandSlug: string;
  brand: string;
  models: ModelSummary[];
}) {
  const [query, setQuery] = useState("");

  const haystack = useMemo(
    () => models.map((m) => ({ model: m, key: squash(m.name) })),
    [models],
  );

  /**
   * Does every model here take the same skins?
   *
   * Cameras and lenses do - all four materials, every model - so the
   * answer belongs once under the heading rather than repeated down
   * 153 rows. Phones do not: within one brand some models take a full
   * wrap and some only a back skin, and that is worth seeing before
   * you click.
   */
  const shared = useMemo(() => {
    if (models.length === 0) return null;
    const first = [...models[0].skins].sort().join("|");
    if (!first) return null;
    const same = models.every((m) => [...m.skins].sort().join("|") === first);
    return same ? models[0].skins : null;
  }, [models]);

  const shown = useMemo(() => {
    const q = squash(query);
    if (!q) return models;
    return haystack.filter((h) => h.key.includes(q)).map((h) => h.model);
  }, [haystack, models, query]);

  return (
    <>
      {shared && (
        <p className="mx-auto mt-5 max-w-[640px] text-center text-[13px] leading-relaxed text-text-mid">
          <span className="text-text-low">Available skins — </span>
          {shared.join(" · ")}
          <span className="text-text-low">, for every {brand} model.</span>
        </p>
      )}

      {models.length > SEARCH_THRESHOLD && (
        <div className="relative mx-auto mt-8 max-w-[520px]">
          <label htmlFor="model-search" className="sr-only">
            Search {brand} models
          </label>
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-text-low"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            id="model-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Type your ${brand} model`}
            autoComplete="off"
            // The customer came here knowing the answer. Let them type it.
            autoFocus
            className="h-[52px] w-full rounded-full border border-hairline bg-surface-1 pl-12 pr-5 text-[15px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
          />
        </div>
      )}

      <p className="mt-5 text-center text-[13px] text-text-low">
        {shown.length === models.length
          ? `${models.length} model${models.length === 1 ? "" : "s"}`
          : `${shown.length} of ${models.length}`}
      </p>

      {shown.length === 0 ? (
        <div className="mx-auto mt-6 max-w-[520px] rounded-[var(--r-md)] border border-hairline bg-surface-1 p-8 text-center">
          <h2 className="text-[17px] font-bold text-text-hi">
            No {brand} model called “{query}”
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-mid">
            Check the spelling, or tell us the model and we will cut it for
            you.
          </p>
          <Link
            href="/request-model"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-7 text-[14px] font-bold text-accent-ink"
          >
            Request this model
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/skins/${category}/${brandSlug}/${m.slug}`}
                className="group flex items-center justify-between gap-4 rounded-[var(--r-sm)] border border-hairline bg-surface-1 px-5 py-4 transition-colors hover:border-accent"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] text-text-hi transition-colors group-hover:text-accent">
                    {m.name}
                  </span>
                  {/* Only when it differs model to model - otherwise it
                      is already stated once above the list. */}
                  {!shared && (
                    <span className="mt-1 block truncate text-[12px] text-text-low">
                      {m.skins.length ? m.skins.join(" · ") : "Not cut yet"}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-text-low">
                  {m.fromPaise === null
                    ? "soon"
                    : `from ${formatPaise(m.fromPaise)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
