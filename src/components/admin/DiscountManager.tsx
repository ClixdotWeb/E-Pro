"use client";

import { useState } from "react";
import { Card, Empty, Pill } from "./ui";
import { formatPaise } from "@/lib/money";
import type { DiscountType } from "@/lib/pricing";

/**
 * Discount codes.
 *
 * A code is three decisions: what it takes off, how much, and the
 * smallest order it works on. That is the whole form, in that order,
 * and the sentence under it spells the result back in plain words
 * ("10% off orders over Rs. 299.00 INR") so nobody has to picture what
 * they just configured.
 *
 * Limits are optional and stay collapsed, because most codes do not
 * need them and a form that asks nine questions for a two-question job
 * is how people end up not making the code at all.
 *
 * The guards that matter are in calculateTotals, not here: a FIXED
 * discount can never exceed the cart, so a total cannot go negative,
 * and nothing applies below the minimum order. This screen only
 * decides what to store.
 */

export type DiscountRow = {
  id: string;
  code: string;
  type: DiscountType;
  /** percent for PERCENT, paise for FIXED, ignored for FREE_SHIPPING */
  value: number;
  minOrderInPaise: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

const TYPE_LABEL: Record<DiscountType, string> = {
  PERCENT: "Percent off",
  FIXED: "Amount off",
  FREE_SHIPPING: "Free shipping",
};

/** "10% off orders over Rs. 299.00 INR" */
function describe(d: {
  type: DiscountType;
  value: number;
  minOrderInPaise: number;
}) {
  const what =
    d.type === "PERCENT"
      ? `${d.value}% off`
      : d.type === "FIXED"
        ? `${formatPaise(d.value)} off`
        : "Free shipping on";

  const when =
    d.minOrderInPaise > 0
      ? ` orders over ${formatPaise(d.minOrderInPaise)}`
      : d.type === "FREE_SHIPPING"
        ? " every order"
        : " any order";

  return what + when;
}

export function DiscountManager({ initial }: { initial: DiscountRow[] }) {
  const [rows, setRows] = useState<DiscountRow[]>(initial);
  const [open, setOpen] = useState(initial.length === 0);

  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("PERCENT");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [showLimits, setShowLimits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanCode = code.trim().toUpperCase();
  const numericValue = Number(value) || 0;
  const minPaise = Math.round((Number(minOrder) || 0) * 100);

  const preview = describe({
    type,
    value: type === "FIXED" ? Math.round(numericValue * 100) : numericValue,
    minOrderInPaise: minPaise,
  });

  const valueProblem =
    type === "FREE_SHIPPING"
      ? null
      : !numericValue
        ? "Set how much it takes off."
        : type === "PERCENT" && numericValue > 100
          ? "A percentage cannot be more than 100."
          : null;

  const canAdd = Boolean(cleanCode) && !valueProblem;

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;

    if (rows.some((r) => r.code === cleanCode)) {
      setError(`${cleanCode} already exists.`);
      return;
    }

    setRows((r) => [
      {
        id: `d${Date.now()}`,
        code: cleanCode,
        type,
        value:
          type === "FIXED" ? Math.round(numericValue * 100) : numericValue,
        minOrderInPaise: minPaise,
        maxUses: maxUses ? Number(maxUses) : null,
        usedCount: 0,
        active: true,
      },
      ...r,
    ]);

    setCode("");
    setMinOrder("");
    setMaxUses("");
    setError(null);
    setOpen(false);
  }

  function toggle(id: string) {
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  }

  function remove(row: DiscountRow) {
    const used =
      row.usedCount > 0
        ? `\n\n${row.usedCount} customer${row.usedCount === 1 ? " has" : "s have"} already used it. Past orders keep the discount they got.`
        : "";

    if (!confirm(`Delete ${row.code}?${used}\n\nThis cannot be undone.`))
      return;

    setRows((rs) => rs.filter((r) => r.id !== row.id));
  }

  return (
    <>
      {/* create */}
      {open ? (
        <Card title="New code" className="mb-5">
          <form onSubmit={add}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="code">Code</Label>
                <p className="mb-2 text-[12px] text-text-mid">
                  What the customer types. Capitals, no spaces.
                </p>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\s+/g, ""));
                    setError(null);
                  }}
                  placeholder="EPRO10"
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 font-mono text-[14px] uppercase text-text-hi placeholder:font-sans placeholder:normal-case placeholder:text-text-low focus:border-accent focus:outline-none"
                />
                {error && (
                  <p className="mt-2 text-[12px] text-danger">{error}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">What it does</Label>
                <p className="mb-2 text-[12px] text-text-mid">
                  Pick one of three.
                </p>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value as DiscountType;
                    setType(t);
                    setValue(t === "PERCENT" ? "10" : t === "FIXED" ? "100" : "0");
                  }}
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3 text-[14px] text-text-hi focus:border-accent focus:outline-none"
                >
                  <option value="PERCENT">Percent off</option>
                  <option value="FIXED">Amount off</option>
                  <option value="FREE_SHIPPING">Free shipping</option>
                </select>
              </div>

              {type !== "FREE_SHIPPING" && (
                <div>
                  <Label htmlFor="value">
                    {type === "PERCENT" ? "How many percent" : "How much off (₹)"}
                  </Label>
                  <p className="mb-2 text-[12px] text-text-mid">
                    {type === "PERCENT"
                      ? "Taken off the items, before shipping."
                      : "Never takes more than the cart is worth."}
                  </p>
                  <input
                    id="value"
                    value={value}
                    onChange={(e) =>
                      setValue(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    inputMode="decimal"
                    className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] tabular-nums text-text-hi focus:border-accent focus:outline-none"
                  />
                  {valueProblem && (
                    <p className="mt-2 text-[12px] text-danger">
                      {valueProblem}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="minOrder">Smallest order (₹)</Label>
                <p className="mb-2 text-[12px] text-text-mid">
                  Leave empty to let it work on any order.
                </p>
                <input
                  id="minOrder"
                  value={minOrder}
                  onChange={(e) =>
                    setMinOrder(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  inputMode="decimal"
                  placeholder="0"
                  className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] tabular-nums text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* optional limits, folded away */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowLimits((v) => !v)}
                className="text-[13px] font-bold text-text-mid hover:text-text-hi"
                aria-expanded={showLimits}
              >
                {showLimits ? "− " : "+ "}Limit how many times it can be used
              </button>

              {showLimits && (
                <div className="mt-3 max-w-xs">
                  <Label htmlFor="maxUses">Total uses</Label>
                  <p className="mb-2 text-[12px] text-text-mid">
                    It stops working after this many orders. Empty means no
                    limit.
                  </p>
                  <input
                    id="maxUses"
                    value={maxUses}
                    onChange={(e) =>
                      setMaxUses(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    inputMode="numeric"
                    placeholder="No limit"
                    className="h-11 w-full rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] tabular-nums text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* plain-words preview */}
            <p className="mt-6 rounded-[8px] bg-surface-2 px-4 py-3 text-[13px] text-text-mid">
              {cleanCode ? (
                <>
                  <span className="font-mono font-bold text-text-hi">
                    {cleanCode}
                  </span>{" "}
                  gives <span className="text-accent">{preview}</span>.
                </>
              ) : (
                "Type a code to see what it will do."
              )}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={!canAdd}
                className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create code
              </button>
              {rows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[13px] text-text-mid hover:text-text-hi"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mb-5 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          New code
        </button>
      )}

      {/* list */}
      {rows.length === 0 ? (
        <Empty
          title="No codes yet"
          body="Make one above. It will work the moment a customer types it at checkout."
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
          <div className="hidden items-center gap-4 border-b border-hairline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low md:flex">
            <span className="w-[130px]">Code</span>
            <span className="flex-1">What it does</span>
            <span className="w-[100px] text-right">Used</span>
            <span className="w-[150px] text-right">Actions</span>
          </div>

          <ul>
            {rows.map((r) => (
              <li
                key={r.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hairline px-5 py-4 last:border-0 ${
                  r.active ? "" : "opacity-55"
                }`}
              >
                <span className="w-[130px] font-mono text-[14px] font-bold text-text-hi">
                  {r.code}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-text-hi">{describe(r)}</p>
                  <p className="mt-0.5 text-[12px] text-text-low">
                    {TYPE_LABEL[r.type]}
                    {!r.active && " · switched off"}
                  </p>
                </div>

                <span className="w-[100px] text-right text-[13px] tabular-nums text-text-mid">
                  {r.usedCount}
                  {r.maxUses !== null && (
                    <span className="text-text-low"> / {r.maxUses}</span>
                  )}
                </span>

                <div className="flex w-[150px] items-center justify-end gap-2">
                  {r.active ? (
                    <Pill tone="success">On</Pill>
                  ) : (
                    <Pill tone="neutral">Off</Pill>
                  )}

                  <button
                    type="button"
                    onClick={() => toggle(r.id)}
                    className="h-9 rounded-[8px] border border-hairline px-3 text-[12px] font-bold text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                  >
                    {r.active ? "Turn off" : "Turn on"}
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(r)}
                    aria-label={`Delete ${r.code}`}
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
      )}
    </>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[14px] font-bold text-text-hi"
    >
      {children}
    </label>
  );
}
