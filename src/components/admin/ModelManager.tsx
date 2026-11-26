"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Empty, Pill } from "./ui";
import {
  createDeviceModel,
  deleteDeviceModel,
  updateDeviceModel,
} from "@/app/admin/actions";
import { urlSlug } from "@/lib/catalog-shared";
import type { AdminModelRow } from "@/lib/catalog";

/**
 * Devices: the thing a skin is cut for.
 *
 * One category at a time, chosen above, because a flat list of 1,290
 * is not something anyone reads - and grouped by brand under that,
 * because "which Samsungs do we cut" is the question people
 * actually arrive with.
 *
 * Brands are not a table. A brand is a field on the device, so
 * adding a device under a name nobody has used yet is how a brand
 * comes into being; the box offers the ones already in use and
 * accepts anything else.
 *
 * Adding offers to give the device the same skins the rest of the
 * category sells, at the same price. Without that a new device gets
 * a page saying "we cut skins for this, but it is not priced yet",
 * which is not what anyone means by adding the iPhone 17.
 */

export function ModelManager({
  category,
  categoryName,
  rows,
}: {
  category: string;
  categoryName: string;
  rows: AdminModelRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [withSkins, setWithSkins] = useState(true);
  const [editing, setEditing] = useState<AdminModelRow | null>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const brands = useMemo(
    () => [...new Set(rows.map((r) => r.brand))].sort((a, b) => a.localeCompare(b)),
    [rows],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.brand}${r.name}`.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q),
    );
  }, [rows, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminModelRow[]>();
    for (const r of shown) {
      const list = map.get(r.brand) ?? [];
      list.push(r);
      map.set(r.brand, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [shown]);

  function add() {
    setResult(null);
    start(async () => {
      const r = await createDeviceModel({ category, brand, name, withSkins });
      setResult(r);
      if (r.ok) {
        setName("");
        router.refresh();
      }
    });
  }

  function save() {
    if (!editing) return;
    setResult(null);
    start(async () => {
      const r = await updateDeviceModel(editing.id, {
        brand: editing.brand,
        name: editing.name,
        active: editing.active,
      });
      setResult(r);
      if (r.ok) {
        setEditing(null);
        router.refresh();
      }
    });
  }

  function toggle(row: AdminModelRow) {
    setResult(null);
    start(async () => {
      const r = await updateDeviceModel(row.id, {
        brand: row.brand,
        name: row.name,
        active: !row.active,
      });
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  function remove(row: AdminModelRow) {
    const warning =
      row.skins > 0
        ? `\n\nIts ${row.skins} skin${row.skins === 1 ? "" : "s"} go with it.`
        : "";
    if (
      !window.confirm(
        `Delete ${row.brand} ${row.name}?${warning}\n\nThis cannot be undone.`,
      )
    )
      return;

    setResult(null);
    start(async () => {
      const r = await deleteDeviceModel(row.id);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  const unpriced = rows.filter((r) => r.onSale === 0).length;

  return (
    <>
      {/* add */}
      <div className="mb-6 overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-expanded={adding}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span>
            <span className="block text-[14px] font-bold text-text-hi">
              Add a {categoryName.toLowerCase().replace(/s$/, "")}
            </span>
            <span className="mt-0.5 block text-[12.5px] text-text-mid">
              A new model, under a brand you already sell or a new one.
            </span>
          </span>
          <span className="shrink-0 text-[13px] font-bold text-accent">
            {adding ? "Close" : "Add"}
          </span>
        </button>

        {adding && (
          <div className="border-t border-hairline px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="model-brand"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-text-low"
                >
                  Brand
                </label>
                <input
                  id="model-brand"
                  list="model-brands"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Samsung"
                  autoComplete="off"
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
                <datalist id="model-brands">
                  {brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="model-name"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-text-low"
                >
                  Model
                </label>
                <input
                  id="model-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && brand.trim() && name.trim()) add();
                  }}
                  placeholder="Galaxy S26 Ultra"
                  autoComplete="off"
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <label className="mt-4 flex items-start gap-3 text-[13.5px] text-text-hi">
              <input
                type="checkbox"
                checked={withSkins}
                onChange={(e) => setWithSkins(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span>
                Give it the same skins as the rest of {categoryName}
                <span className="mt-0.5 block text-[12px] text-text-mid">
                  Same coverages or materials, at the price most of them
                  carry. Without this it goes on the site with nothing to
                  buy.
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={add}
              disabled={pending || !brand.trim() || !name.trim()}
              className="mt-5 h-11 rounded-full bg-accent px-6 text-[14px] font-bold text-black disabled:opacity-40"
            >
              {pending ? "Adding…" : "Add device"}
            </button>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${rows.length.toLocaleString("en-IN")} devices`}
          aria-label="Search devices"
          autoComplete="off"
          className="h-11 min-w-[240px] flex-1 rounded-[8px] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        />
        <span className="text-[13px] text-text-low">
          {brands.length} brand{brands.length === 1 ? "" : "s"}
          {unpriced > 0 && ` · ${unpriced} with nothing to buy`}
        </span>
      </div>

      {result && (
        <p
          role="status"
          className={`mb-5 text-[13px] font-bold ${
            result.ok ? "text-success" : "text-danger"
          }`}
        >
          {result.message}
        </p>
      )}

      {/* list */}
      {rows.length === 0 ? (
        <Empty
          title={`No ${categoryName.toLowerCase()} yet`}
          body="Add the first one above, or import a price list."
        />
      ) : grouped.length === 0 ? (
        <Empty
          title="Nothing matches"
          body={`No device in ${categoryName} matches “${query}”.`}
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([brandName, items]) => (
            <section key={brandName}>
              <h2 className="mb-3 flex items-center gap-3 text-[15px] font-bold tracking-tight text-text-hi">
                {brandName}
                <span className="text-[12px] font-normal text-text-low">
                  {items.length}
                </span>
              </h2>

              <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
                <ul>
                  {items.map((row) => (
                    <li
                      key={row.id}
                      className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hairline px-5 py-3.5 last:border-0 ${
                        row.active ? "" : "opacity-55"
                      }`}
                    >
                      {editing?.id === row.id ? (
                        <>
                          <input
                            value={editing.brand}
                            onChange={(e) =>
                              setEditing({ ...editing, brand: e.target.value })
                            }
                            aria-label="Brand"
                            className="h-10 w-[150px] rounded-[6px] border border-accent bg-surface-2 px-3 text-[14px] text-text-hi focus:outline-none"
                          />
                          <input
                            value={editing.name}
                            onChange={(e) =>
                              setEditing({ ...editing, name: e.target.value })
                            }
                            aria-label="Model name"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") save();
                              if (e.key === "Escape") setEditing(null);
                            }}
                            className="h-10 min-w-[200px] flex-1 rounded-[6px] border border-accent bg-surface-2 px-3 text-[14px] text-text-hi focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={save}
                            disabled={pending}
                            className="h-10 rounded-[8px] bg-accent px-4 text-[13px] font-bold text-black disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="h-10 px-2 text-[13px] text-text-mid hover:text-text-hi"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-text-hi">
                              {row.name}
                              {!row.active && <Pill tone="warning">Off</Pill>}
                              {row.active && row.onSale === 0 && (
                                <Pill tone="danger">Nothing to buy</Pill>
                              )}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-[11.5px] text-text-low">
                              {shopUrl(category, row)}
                            </span>
                          </span>

                          <span className="w-[120px] text-right text-[12.5px] text-text-mid">
                            {row.onSale} of {row.skins} skins
                          </span>

                          <span className="flex w-[170px] justify-end gap-3 text-[12px] font-bold">
                            {row.active && row.onSale > 0 && (
                              <Link
                                href={shopUrl(category, row)}
                                target="_blank"
                                className="text-text-low hover:text-text-hi"
                              >
                                View
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditing(row)}
                              className="text-accent hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggle(row)}
                              disabled={pending}
                              className="text-text-low hover:text-text-hi disabled:opacity-40"
                            >
                              {row.active ? "Switch off" : "Switch on"}
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(row)}
                              disabled={pending}
                              className="text-text-low hover:text-danger disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Where this device lives on the shop.
 *
 * Built from the brand and model names, not from the stored slug:
 * that one is internal ("phone-iphone-iphone-11") and deliberately
 * never appears in a URL.
 */
function shopUrl(category: string, row: AdminModelRow): string {
  return `/skins/${category}/${urlSlug(row.brand)}/${urlSlug(row.name)}`;
}
