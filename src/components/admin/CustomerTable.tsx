"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Avatar, Pill, type Tone } from "./ui";
import { setUserRole } from "@/app/admin/actions";

/**
 * Customers, with the role dropdown on the same row.
 *
 * Making someone staff is a two-second job done once, so it does not
 * deserve its own screen - but it does deserve to be obvious, which
 * is why the role is a control and not a badge you have to go
 * somewhere else to change.
 *
 * Your own row is marked, because demoting yourself out of the
 * dashboard you are standing in is the mistake this screen invites.
 */

type Row = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  orders: number;
  joined: string;
};

const TONE: Record<string, Tone> = {
  ADMIN: "accent",
  STAFF: "success",
  CUSTOMER: "neutral",
};

export function CustomerTable({
  rows,
  meId,
}: {
  rows: Row[];
  meId: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.phone ?? "").includes(q),
    );
  }, [rows, query]);

  function change(row: Row, role: string) {
    setBusy(row.id);
    setResult(null);
    start(async () => {
      const r = await setUserRole(
        row.id,
        role as "CUSTOMER" | "STAFF" | "ADMIN",
      );
      setResult(r);
      setBusy(null);
      if (r.ok) router.refresh();
    });
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label htmlFor="customer-search" className="sr-only">
          Search customers
        </label>
        <input
          id="customer-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone"
          autoComplete="off"
          className="h-11 min-w-[260px] flex-1 rounded-[8px] border border-hairline bg-surface-1 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        />
        <span className="text-[13px] text-text-low">
          {shown.length} of {rows.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface-1">
        <div className="hidden items-center gap-4 border-b border-hairline px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low lg:flex">
          <span className="flex-1">Customer</span>
          <span className="w-[90px] text-right">Orders</span>
          <span className="w-[120px] text-right">Joined</span>
          <span className="w-[160px] text-right">Dashboard access</span>
        </div>

        <ul>
          {shown.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hairline px-6 py-4 last:border-0"
            >
              <span className="flex min-w-[220px] flex-1 items-center gap-3">
                <Avatar name={r.name ?? r.email} />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[14px] text-text-hi">
                    <span className="truncate">{r.name ?? "No name"}</span>
                    {r.id === meId && <Pill tone="accent">You</Pill>}
                    {r.id !== meId && r.role !== "CUSTOMER" && (
                      <Pill tone={TONE[r.role] ?? "neutral"}>
                        {r.role.charAt(0) + r.role.slice(1).toLowerCase()}
                      </Pill>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-text-low">
                    {r.email}
                    {r.phone ? ` · ${r.phone}` : ""}
                  </span>
                </span>
              </span>

              <span className="w-[90px] text-right text-[13px] tabular-nums text-text-mid">
                {r.orders}
              </span>

              <span className="w-[120px] text-right text-[12px] text-text-low">
                {r.joined}
              </span>

              <span className="w-[160px] text-right">
                <label className="sr-only" htmlFor={`role-${r.id}`}>
                  Dashboard access for {r.name ?? r.email}
                </label>
                <select
                  id={`role-${r.id}`}
                  value={r.role}
                  disabled={busy === r.id}
                  onChange={(e) => change(r, e.target.value)}
                  className="h-10 w-full rounded-[6px] border border-hairline bg-surface-2 px-2 text-[13px] text-text-hi focus:border-accent focus:outline-none disabled:opacity-50"
                >
                  <option value="CUSTOMER">No access</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {result && (
        <p
          role="status"
          className={`mt-5 text-[13px] font-bold ${
            result.ok ? "text-success" : "text-danger"
          }`}
        >
          {result.message}
        </p>
      )}
    </>
  );
}
