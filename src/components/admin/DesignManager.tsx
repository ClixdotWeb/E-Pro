"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Empty, Pill } from "./ui";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";
import {
  createDesignCategory,
  deleteDesign,
  saveDesign,
  setDesignActive,
} from "@/app/admin/actions";
import type { DesignCategoryRow, DesignRow } from "@/lib/designs";

/**
 * Designs: add the artwork, say what it is called and what it goes on.
 *
 * The photograph is the design - a row of text here would be useless
 * - so the form leads with the picture and the list is a grid of
 * them, not a table. Everything else is three answers: a name, which
 * kind it is, and which devices it is cut for.
 *
 * Devices default to all. A design added in a hurry should appear
 * everywhere rather than nowhere: nobody notices a design that is
 * missing, and they do notice one in the wrong place.
 *
 * Editing opens the same form with the fields filled, and leaving the
 * file empty keeps the photograph that is already there - so a typo
 * in a name does not cost an upload.
 */

const DEVICES = [
  "phone",
  "laptop",
  "camera",
  "lens",
  "tablet",
  "gimbal",
  "drone",
  "gaming-consoles",
  "wireless-earbuds",
  "charger",
];

const BLANK = {
  id: "",
  name: "",
  categorySlug: "",
  deviceSlugs: [] as string[],
  active: true,
  price: "",
};

type Draft = typeof BLANK;

export function DesignManager({
  categories,
  designs,
}: {
  categories: DesignCategoryRow[];
  designs: DesignRow[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const editing = draft?.id
    ? designs.find((d) => d.id === draft.id) ?? null
    : null;

  function open(d?: DesignRow) {
    setResult(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setDraft(
      d
        ? {
            id: d.id,
            name: d.name,
            categorySlug: d.categorySlug,
            deviceSlugs: d.deviceSlugs,
            active: d.active,
            price: d.priceInPaise ? String(d.priceInPaise / 100) : "",
          }
        : { ...BLANK, categorySlug: categories[0]?.slug ?? "" },
    );
  }

  function pickFile(file: File | null) {
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function submit() {
    if (!draft) return;

    const form = new FormData();
    const file = fileRef.current?.files?.[0];
    if (file) form.set("image", file);

    // A new design with no picture is a tile the shop cannot draw.
    if (!file && !draft.id) {
      setResult({ ok: false, message: "Add a photograph of the design." });
      return;
    }

    startTransition(async () => {
      const r = await saveDesign(draft, form);
      setResult(r);
      if (r.ok) {
        setDraft(null);
        setPreview(null);
        router.refresh();
      }
    });
  }

  function remove(d: DesignRow) {
    if (!window.confirm(`Delete ${d.name}? This cannot be undone.`)) return;
    startTransition(async () => {
      const r = await deleteDesign(d.id);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  function toggle(d: DesignRow) {
    startTransition(async () => {
      const r = await setDesignActive(d.id, !d.active);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    startTransition(async () => {
      const r = await createDesignCategory(name);
      setResult(r);
      if (r.ok) {
        setNewCategory("");
        router.refresh();
      }
    });
  }

  const byCategory = categories
    .map((c) => ({ ...c, items: designs.filter((d) => d.categorySlug === c.slug) }))
    .filter((c) => c.items.length > 0 || designs.length === 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => open()}
          className="h-11 rounded-[8px] bg-accent px-5 text-[14px] font-bold text-black"
        >
          Add a design
        </button>

        <span className="text-[13px] text-text-low">
          {designs.length} design{designs.length === 1 ? "" : "s"} in{" "}
          {categories.length} kind{categories.length === 1 ? "" : "s"}
        </span>

        <span className="ml-auto flex items-center gap-2">
          <label htmlFor="new-kind" className="sr-only">
            New kind of design
          </label>
          <input
            id="new-kind"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCategory();
            }}
            placeholder="New kind — e.g. Marble"
            className="h-11 w-[220px] rounded-[8px] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={addCategory}
            disabled={pending || !newCategory.trim()}
            className="h-11 rounded-[8px] border border-hairline px-4 text-[13px] font-bold text-text-mid hover:border-hairline-strong hover:text-text-hi disabled:opacity-40"
          >
            Add kind
          </button>
        </span>
      </div>

      {designs.length === 0 ? (
        <Empty
          title="No designs yet"
          body="Add the artwork customers choose from. Until one is here, the shop asks them for a coverage and nothing else."
        />
      ) : (
        <div className="space-y-10">
          {byCategory.map((c) => (
            <section key={c.slug}>
              <h2 className="mb-4 flex items-center gap-3 text-[15px] font-bold tracking-tight text-text-hi">
                {c.name}
                <span className="text-[12px] font-normal text-text-low">
                  {c.items.length}
                </span>
              </h2>

              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {c.items.map((d) => (
                  <li
                    key={d.id}
                    className={`overflow-hidden rounded-[14px] border border-hairline bg-surface-1 ${
                      d.active ? "" : "opacity-55"
                    }`}
                  >
                    <div className="relative aspect-[4/5] bg-surface-2">
                      {d.imageUrl ? (
                        <Image
                          src={d.imageUrl}
                          alt={d.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <span className="grid h-full place-items-center text-[12px] text-text-low">
                          No photo
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="flex items-center gap-2 text-[14px] font-bold text-text-hi">
                        {d.name}
                        {!d.active && <Pill tone="warning">Hidden</Pill>}
                      </p>

                      <p className="mt-1 text-[12px] text-text-low">
                        {d.deviceSlugs.length === 0
                          ? "Every device"
                          : d.deviceSlugs
                              .map((s) => CATEGORY_LABEL[s] ?? s)
                              .join(", ")}
                        {d.priceInPaise > 0 &&
                          ` · +Rs. ${(d.priceInPaise / 100).toLocaleString("en-IN")}`}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-[12px] font-bold">
                        <button
                          type="button"
                          onClick={() => open(d)}
                          className="text-accent hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggle(d)}
                          disabled={pending}
                          className="text-text-low hover:text-text-hi disabled:opacity-40"
                        >
                          {d.active ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(d)}
                          disabled={pending}
                          className="ml-auto text-text-low hover:text-danger disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {result && !draft && (
        <p
          role="status"
          className={`mt-6 text-[13px] font-bold ${
            result.ok ? "text-success" : "text-danger"
          }`}
        >
          {result.message}
        </p>
      )}

      {draft && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={draft.id ? "Edit design" : "Add a design"}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
        >
          <div className="w-full max-w-[560px] rounded-[16px] border border-hairline bg-surface-1 p-6">
            <h2 className="text-[17px] font-bold tracking-tight text-text-hi">
              {draft.id ? `Edit ${editing?.name ?? "design"}` : "Add a design"}
            </h2>

            <div className="mt-5 space-y-5">
              <Field label="Photograph">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[8px] border border-hairline bg-surface-2">
                    {(preview ?? editing?.imageUrl) && (
                      <Image
                        src={preview ?? editing?.imageUrl ?? ""}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized={!!preview}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                      className="w-full text-[13px] text-text-mid file:mr-3 file:rounded-[6px] file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-[13px] file:font-bold file:text-text-hi"
                    />
                    <p className="mt-2 text-[12px] text-text-low">
                      JPG, PNG or WebP, up to 8 MB.
                      {draft.id && " Leave empty to keep the one already here."}
                    </p>
                  </div>
                </div>
              </Field>

              <Field label="Name">
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  placeholder="Neon Dragon"
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
              </Field>

              <Field label="Kind of design">
                <select
                  value={draft.categorySlug}
                  onChange={(e) =>
                    setDraft({ ...draft, categorySlug: e.target.value })
                  }
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi focus:border-accent focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Cut for">
                <div className="flex flex-wrap gap-2">
                  {DEVICES.map((s) => {
                    const on = draft.deviceSlugs.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            deviceSlugs: on
                              ? draft.deviceSlugs.filter((x) => x !== s)
                              : [...draft.deviceSlugs, s],
                          })
                        }
                        aria-pressed={on}
                        className={`h-9 rounded-[6px] border px-3 text-[12px] font-bold transition-colors ${
                          on
                            ? "border-accent bg-accent text-black"
                            : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
                        }`}
                      >
                        {CATEGORY_LABEL[s] ?? s}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[12px] text-text-low">
                  Pick none and it shows on every device.
                </p>
              </Field>

              <Field label="Extra charge, if any">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-text-low">Rs.</span>
                  <input
                    value={draft.price}
                    onChange={(e) =>
                      setDraft({ ...draft, price: e.target.value })
                    }
                    inputMode="decimal"
                    placeholder="0"
                    className="h-11 w-28 rounded-[8px] border border-hairline bg-surface-2 px-3 text-right text-[14px] font-bold tabular-nums text-text-hi focus:border-accent focus:outline-none"
                  />
                  <span className="text-[12px] text-text-low">
                    added on top of the skin price
                  </span>
                </div>
              </Field>

              <label className="flex items-center gap-3 text-[14px] text-text-hi">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) =>
                    setDraft({ ...draft, active: e.target.checked })
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Show it on the shop
              </label>
            </div>

            {result && !result.ok && (
              <p role="status" className="mt-4 text-[13px] font-bold text-danger">
                {result.message}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="h-11 rounded-[8px] bg-accent px-6 text-[14px] font-bold text-black disabled:opacity-50"
              >
                {pending ? "Saving…" : draft.id ? "Save" : "Add design"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setPreview(null);
                }}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-text-low">
        {label}
      </p>
      {children}
    </div>
  );
}
