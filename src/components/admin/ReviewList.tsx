"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Empty, Pill } from "./ui";

/**
 * Reviews.
 *
 * The Review model already carries an `approved` flag, so a review is
 * written but invisible until someone here says yes. That makes the
 * default view "Waiting for you" - the queue, not the archive. Nobody
 * opens this screen to browse old five-star reviews.
 *
 * Two actions, both one click: Publish, or Delete. There is no edit,
 * on purpose - changing what a customer wrote and leaving their name
 * on it is not something a shop should be able to do by accident.
 */

export type ReviewRow = {
  id: string;
  productSlug: string;
  productTitle: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  at: string;
  approved: boolean;
};

type Tab = "waiting" | "published" | "all";

export function ReviewList({ initial }: { initial: ReviewRow[] }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState<Tab>("waiting");

  const counts = useMemo(
    () => ({
      waiting: rows.filter((r) => !r.approved).length,
      published: rows.filter((r) => r.approved).length,
      all: rows.length,
    }),
    [rows],
  );

  const shown = rows.filter((r) =>
    tab === "all" ? true : tab === "waiting" ? !r.approved : r.approved,
  );

  function publish(id: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, approved: true } : r)));
  }

  function hide(id: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, approved: false } : r)));
  }

  function remove(row: ReviewRow) {
    if (
      !confirm(
        `Delete ${row.author}'s review of ${row.productTitle}?\n\nThis cannot be undone.`,
      )
    )
      return;
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["waiting", "Waiting for you"],
            ["published", "Published"],
            ["all", "All"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`rounded-full border px-4 py-2 text-[13px] transition-colors ${
              tab === id
                ? "border-accent bg-accent font-bold text-black"
                : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
            }`}
          >
            {label}
            <span className="ml-2 opacity-60">{counts[id]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty
          title={
            tab === "waiting" ? "Nothing waiting" : "No reviews here yet"
          }
          body={
            tab === "waiting"
              ? "Every review has been dealt with. New ones land here and stay hidden from the shop until you publish them."
              : "Reviews customers leave will show up here."
          }
        />
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <li
              key={r.id}
              className="rounded-[14px] border border-hairline bg-surface-1 p-5"
            >
              <div className="flex flex-wrap items-start gap-4">
                <Avatar name={r.author} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[14px] font-bold text-text-hi">
                      {r.author}
                    </span>
                    <Stars rating={r.rating} />
                    <span className="text-[12px] text-text-low">{r.at}</span>
                    {r.approved ? (
                      <Pill tone="success">Published</Pill>
                    ) : (
                      <Pill tone="warning">Hidden</Pill>
                    )}
                  </div>

                  <p className="mt-1 text-[12px] text-text-low">
                    on{" "}
                    <Link
                      href={`/admin/products/${r.productSlug}`}
                      className="hover:text-accent hover:underline"
                    >
                      {r.productTitle}
                    </Link>
                  </p>

                  {r.title && (
                    <p className="mt-3 text-[14px] font-bold text-text-hi">
                      {r.title}
                    </p>
                  )}
                  <p className="mt-1.5 text-[13px] leading-relaxed text-text-mid">
                    {r.body}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {r.approved ? (
                    <button
                      type="button"
                      onClick={() => hide(r.id)}
                      className="h-10 rounded-[8px] border border-hairline px-4 text-[13px] font-bold text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                    >
                      Hide
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => publish(r.id)}
                      className="h-10 rounded-[8px] bg-accent px-4 text-[13px] font-bold text-black transition-colors hover:bg-accent-hover"
                    >
                      Publish
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(r)}
                    aria-label={`Delete ${r.author}'s review`}
                    title="Delete"
                    className="grid h-10 w-10 place-items-center rounded-[8px] text-text-low transition-colors hover:bg-danger/15 hover:text-danger"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 12.1A1.5 1.5 0 0 0 9.3 20.5h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
          className={n <= rating ? "text-accent" : "text-surface-3"}
        >
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}
