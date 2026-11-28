"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Empty, Pill } from "./ui";
import { deleteFaq, moveFaq, saveFaq } from "@/app/admin/actions";
import type { Faq } from "@/lib/faq";

/**
 * The FAQ, editable.
 *
 * Ordering is up and down arrows rather than a number field,
 * because "put this one third" is a thing people do by looking, not
 * by arithmetic - and every move rewrites the whole order so there
 * are no gaps or ties for the next one to trip over.
 *
 * A question can be in a section on /faq and also in the short list
 * on the homepage; those are two checkboxes, not two lists, which
 * is the whole reason the two could disagree before.
 */

const BLANK = {
  id: "",
  section: "",
  question: "",
  answer: "",
  onHome: false,
  active: true,
};

type Draft = typeof BLANK;

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const sections = [...new Set(faqs.map((f) => f.section).filter(Boolean))];

  function open(f?: Faq) {
    setResult(null);
    setDraft(
      f
        ? {
            id: f.id,
            section: f.section,
            question: f.question,
            answer: f.answer,
            onHome: f.onHome,
            active: f.active,
          }
        : { ...BLANK },
    );
  }

  function save() {
    if (!draft) return;
    start(async () => {
      const r = await saveFaq(draft);
      setResult(r);
      if (r.ok) {
        setDraft(null);
        router.refresh();
      }
    });
  }

  function remove(f: Faq) {
    if (!window.confirm(`Delete "${f.question}"?`)) return;
    start(async () => {
      const r = await deleteFaq(f.id);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  function move(f: Faq, direction: "up" | "down") {
    start(async () => {
      const r = await moveFaq(f.id, direction);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => open()}
          className="h-11 rounded-[8px] bg-accent px-5 text-[14px] font-bold text-black"
        >
          Add a question
        </button>
        <span className="text-[13px] text-text-low">
          {faqs.length} question{faqs.length === 1 ? "" : "s"} ·{" "}
          {faqs.filter((f) => f.onHome).length} on the homepage
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

      {faqs.length === 0 ? (
        <Empty
          title="No questions yet"
          body="Add the ones customers actually ask. They appear on /faq, and the ones you tick show on the homepage too."
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
          <ul>
            {faqs.map((f, i) => (
              <li
                key={f.id}
                className={`flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-hairline px-5 py-4 last:border-0 ${
                  f.active ? "" : "opacity-55"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-text-hi">
                    {f.question}
                    {f.onHome && <Pill tone="accent">Homepage</Pill>}
                    {!f.active && <Pill tone="warning">Hidden</Pill>}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-text-mid">
                    {f.answer}
                  </p>
                  {f.section && (
                    <p className="mt-1 text-[11.5px] uppercase tracking-[0.06em] text-text-low">
                      {f.section}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(f, "up")}
                    disabled={pending || i === 0}
                    aria-label="Move up"
                    className="grid h-9 w-9 place-items-center rounded-[8px] text-text-mid hover:bg-surface-3 hover:text-text-hi disabled:opacity-30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(f, "down")}
                    disabled={pending || i === faqs.length - 1}
                    aria-label="Move down"
                    className="grid h-9 w-9 place-items-center rounded-[8px] text-text-mid hover:bg-surface-3 hover:text-text-hi disabled:opacity-30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => open(f)}
                    className="h-9 px-3 text-[12.5px] font-bold text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(f)}
                    disabled={pending}
                    className="h-9 px-2 text-[12.5px] font-bold text-text-low hover:text-danger disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {draft && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={draft.id ? "Edit question" : "Add a question"}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
        >
          <div className="w-full max-w-[600px] rounded-[16px] border border-hairline bg-surface-1 p-6">
            <h2 className="text-[17px] font-bold tracking-tight text-text-hi">
              {draft.id ? "Edit question" : "Add a question"}
            </h2>

            <div className="mt-5 space-y-5">
              <Field label="Question">
                <input
                  value={draft.question}
                  onChange={(e) =>
                    setDraft({ ...draft, question: e.target.value })
                  }
                  placeholder="How long does shipping take?"
                  className="h-11 w-full min-w-0 rounded-[8px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
              </Field>

              <Field label="Answer">
                <textarea
                  value={draft.answer}
                  onChange={(e) =>
                    setDraft({ ...draft, answer: e.target.value })
                  }
                  rows={5}
                  placeholder="Within 1–2 business days…"
                  className="w-full min-w-0 resize-y rounded-[8px] border border-hairline bg-surface-2 px-4 py-2.5 text-[14px] leading-relaxed text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
                <p className="mt-2 text-[12px] text-text-low">
                  Leave a blank line between paragraphs.
                </p>
              </Field>

              <Field label="Section on the FAQ page">
                <input
                  value={draft.section}
                  list="faq-sections"
                  onChange={(e) =>
                    setDraft({ ...draft, section: e.target.value })
                  }
                  placeholder="Shipping and returns"
                  className="h-11 w-full min-w-0 rounded-[8px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
                <datalist id="faq-sections">
                  {sections.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <p className="mt-2 text-[12px] text-text-low">
                  Leave it empty and the question sits above the headings.
                </p>
              </Field>

              <label className="flex items-center gap-3 text-[14px] text-text-hi">
                <input
                  type="checkbox"
                  checked={draft.onHome}
                  onChange={(e) =>
                    setDraft({ ...draft, onHome: e.target.checked })
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Also show it on the homepage
              </label>

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
                onClick={save}
                disabled={pending}
                className="h-11 rounded-[8px] bg-accent px-6 text-[14px] font-bold text-black disabled:opacity-50"
              >
                {pending ? "Saving…" : draft.id ? "Save" : "Add question"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
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
