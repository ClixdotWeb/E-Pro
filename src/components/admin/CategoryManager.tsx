"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Card, Pill } from "./ui";
import Image from "next/image";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  updateCategoryTile,
} from "@/app/admin/actions";

/**
 * Categories.
 *
 * A category is the device a skin is cut for - Phone, Lens, Drone. It
 * decides which page a product shows up on and what the menu lists,
 * which is why the row says how many products are in it: deleting an
 * empty one is harmless, deleting one with eleven products in it is
 * not, and the confirm says which case you are in.
 *
 * Adding is a single field at the top rather than a separate page.
 * There is only one thing to type, and a round trip for one field is
 * a round trip too many.
 *
 * Every change is written through to the database and the list is
 * re-read from the server afterwards, so the slug shown is the one
 * the server actually made rather than this component's guess at it.
 */

export type CategoryRow = {
  slug: string;
  name: string;
  count: number;
  imageUrl: string | null;
  tagline: string | null;
  active: boolean;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryManager({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const rows = initial;
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftTagline, setDraftTagline] = useState("");
  const [draftActive, setDraftActive] = useState(true);
  const tileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();

    const clean = name.trim();
    if (!clean) return;

    setError(null);
    start(async () => {
      const r = await createCategory(clean);
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  function openEdit(row: CategoryRow) {
    setError(null);
    setEditing(row);
    setDraftName(row.name);
    setDraftTagline(row.tagline ?? "");
    setDraftActive(row.active);
    if (tileRef.current) tileRef.current.value = "";
  }

  function saveEdit() {
    if (!editing) return;
    const clean = draftName.trim();
    if (!clean) return;

    const form = new FormData();
    const file = tileRef.current?.files?.[0];
    if (file) form.set("image", file);

    setError(null);
    start(async () => {
      const r = await updateCategoryTile(
        editing.slug,
        { name: clean, tagline: draftTagline, active: draftActive },
        form,
      );
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  function move(row: CategoryRow, direction: "up" | "down") {
    setError(null);
    start(async () => {
      const r = await moveCategory(row.slug, direction);
      if (!r.ok) setError(r.message);
      else router.refresh();
    });
  }

  function remove(row: CategoryRow) {
    const message =
      row.count === 0
        ? `Delete “${row.name}”? Nothing is in it, so nothing else changes.`
        : `Delete “${row.name}”?

${row.count} product${row.count === 1 ? "" : "s"} will be left with no category, which means ${row.count === 1 ? "it disappears" : "they disappear"} from browsing until you give ${row.count === 1 ? "it" : "them"} a new one.`;

    if (!confirm(message)) return;

    setError(null);
    start(async () => {
      const r = await deleteCategory(row.slug);
      if (!r.ok) {
        setError(r.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      {/* add */}
      <Card title="Add a category" className="mb-5">
        <form onSubmit={add} className="flex flex-wrap items-start gap-3">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="new-category" className="sr-only">
              Category name
            </label>
            <input
              id="new-category"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Smartwatch"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "category-error" : "category-hint"}
              className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
            />
            <p
              id={error ? "category-error" : "category-hint"}
              className={`mt-2 text-[12px] ${error ? "text-danger" : "text-text-mid"}`}
            >
              {error ??
                (name.trim()
                  ? `It will live at /skins/${slugify(name)}`
                  : "The device name, as a customer would say it.")}
            </p>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || pending}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {pending ? "Saving…" : "Add"}
          </button>
        </form>
      </Card>

      {error && (
        <p role="status" className="mb-4 text-[13px] font-bold text-danger">
          {error}
        </p>
      )}

      {/* list */}
      <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
        <div className="hidden items-center gap-4 border-b border-hairline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low sm:flex">
          <span className="w-[56px]">Tile</span>
          <span className="flex-1">Category</span>
          <span className="w-[90px] text-right">Devices</span>
          <span className="w-[120px] text-right">Order</span>
          <span className="w-[92px] text-right">Actions</span>
        </div>

        <ul>
          {rows.map((row, i) => (
            <li
              key={row.slug}
              className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hairline px-5 py-4 last:border-0 ${
                row.active ? "" : "opacity-55"
              }`}
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] border border-hairline bg-surface-2">
                {row.imageUrl && (
                  <Image
                    src={row.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 truncate text-[14px] font-bold text-text-hi">
                  {row.name}
                  {!row.active && <Pill tone="warning">Hidden</Pill>}
                </p>
                <p className="mt-0.5 truncate font-mono text-[12px] text-text-low">
                  /skins/{row.slug}
                </p>
                {row.tagline && (
                  <p className="mt-1 truncate text-[12px] text-text-mid">
                    {row.tagline}
                  </p>
                )}
              </div>

              <div className="w-[90px] text-right">
                {row.count > 0 ? (
                  <Link
                    href={`/admin/models?category=${row.slug}`}
                    className="text-[13px] font-bold tabular-nums text-text-hi hover:text-accent"
                  >
                    {row.count}
                  </Link>
                ) : (
                  <Pill tone="warning">Empty</Pill>
                )}
              </div>

              {/* The homepage grid reads this order. */}
              <div className="flex w-[120px] justify-end gap-1">
                <button
                  type="button"
                  onClick={() => move(row, "up")}
                  disabled={pending || i === 0}
                  aria-label={`Move ${row.name} earlier`}
                  className="grid h-9 w-9 place-items-center rounded-[8px] text-text-mid transition-colors hover:bg-surface-3 hover:text-text-hi disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => move(row, "down")}
                  disabled={pending || i === rows.length - 1}
                  aria-label={`Move ${row.name} later`}
                  className="grid h-9 w-9 place-items-center rounded-[8px] text-text-mid transition-colors hover:bg-surface-3 hover:text-text-hi disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </button>
              </div>

              <div className="flex w-[92px] justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  aria-label={`Edit ${row.name}`}
                  title="Edit"
                  className="grid h-9 w-9 place-items-center rounded-[8px] text-text-mid transition-colors hover:bg-surface-3 hover:text-text-hi"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => remove(row)}
                  aria-label={`Delete ${row.name}`}
                  title="Delete"
                  className="grid h-9 w-9 place-items-center rounded-[8px] text-text-low transition-colors hover:bg-danger/15 hover:text-danger"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 12.1A1.5 1.5 0 0 0 9.3 20.5h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${editing.name}`}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
        >
          <div className="w-full max-w-[520px] rounded-[16px] border border-hairline bg-surface-1 p-6">
            <h2 className="text-[17px] font-bold tracking-tight text-text-hi">
              {editing.name}
            </h2>
            <p className="mt-1 text-[12.5px] text-text-mid">
              The tile is what the homepage shows. The sentence is what
              sits under the heading on its page.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-text-low">
                  Tile
                </p>
                <div className="flex items-center gap-4">
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border border-hairline bg-surface-2">
                    {editing.imageUrl && (
                      <Image
                        src={editing.imageUrl}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <input
                      ref={tileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="w-full text-[13px] text-text-mid file:mr-3 file:rounded-[6px] file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-[13px] file:font-bold file:text-text-hi"
                    />
                    <p className="mt-2 text-[12px] text-text-low">
                      Leave empty to keep the one there now.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-text-low">
                  Name
                </p>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-[8px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-text-low">
                  Sentence on the page
                </p>
                <textarea
                  value={draftTagline}
                  onChange={(e) => setDraftTagline(e.target.value)}
                  rows={3}
                  placeholder="Cut to the millimetre for your exact model."
                  className="w-full min-w-0 resize-y rounded-[8px] border border-hairline bg-surface-2 px-4 py-2.5 text-[14px] leading-relaxed text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-3 text-[14px] text-text-hi">
                <input
                  type="checkbox"
                  checked={draftActive}
                  onChange={(e) => setDraftActive(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Show its tile on the homepage
              </label>
            </div>

            {error && (
              <p role="status" className="mt-4 text-[13px] font-bold text-danger">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={saveEdit}
                disabled={pending || !draftName.trim()}
                className="h-11 rounded-[8px] bg-accent px-6 text-[14px] font-bold text-black disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-11 rounded-[8px] border border-hairline px-5 text-[14px] text-text-mid hover:border-hairline-strong hover:text-text-hi"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
