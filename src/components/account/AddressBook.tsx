"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteAddress,
  saveAddress,
  setDefaultAddress,
} from "@/app/auth-actions";

/**
 * Saved addresses.
 *
 * Two invented ones used to sit here under someone else's name,
 * shown to every customer. These are the customer's own, and the
 * buttons do what they say.
 *
 * The default is explicit and exactly one address holds it, because
 * checkout preselects it and a parcel sent to a stale address is a
 * real cost, not a UI detail.
 */

export type AddressRow = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const STATES = [
  "Kerala",
  "Tamil Nadu",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Goa",
  "Gujarat",
  "Delhi",
  "Haryana",
  "Punjab",
  "Rajasthan",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Bihar",
  "West Bengal",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Chandigarh",
  "Puducherry",
];

export function AddressBook({ rows }: { rows: AddressRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AddressRow | "new" | null>(null);
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function makeDefault(id: string) {
    setNote(null);
    start(async () => {
      const r = await setDefaultAddress(id);
      if (!r.ok) setNote(r.message);
      else router.refresh();
    });
  }

  function remove(row: AddressRow) {
    if (!window.confirm(`Delete the address for ${row.fullName}?`)) return;
    setNote(null);
    start(async () => {
      const r = await deleteAddress(row.id);
      if (!r.ok) setNote(r.message);
      else router.refresh();
    });
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-hi">Saved addresses</h2>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded-[var(--r-md)] bg-accent px-4 py-2 text-[12px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          + Add address
        </button>
      </div>

      {note && (
        <p role="status" className="mt-3 text-[12px] font-semibold text-danger">
          {note}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-4 rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-14 text-center">
          <h3 className="text-base font-semibold text-text-hi">
            No addresses saved
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-text-mid">
            Add one and checkout fills itself in next time.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map((a) => (
            <li
              key={a.id}
              className={`card p-5 ${a.isDefault ? "border-accent/45" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold text-text-hi">
                  {a.fullName}
                </p>
                {a.isDefault && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Default
                  </span>
                )}
              </div>

              <address className="mt-3 text-[13px] not-italic leading-relaxed text-text-mid">
                {a.line1}
                <br />
                {a.line2 && (
                  <>
                    {a.line2}
                    <br />
                  </>
                )}
                {a.city}, {a.state} {a.pincode}
                <br />
                <span className="text-text-low">{a.phone}</span>
              </address>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => makeDefault(a.id)}
                    disabled={pending}
                    className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi disabled:opacity-50"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(a)}
                  disabled={pending}
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-low transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <AddressDialog
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

function AddressDialog({
  row,
  onClose,
  onSaved,
}: {
  row: AddressRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [state, action] = useActionState(saveAddress, null);

  // The action has no way to close the dialog itself, so the result
  // does it. Keyed on the object, not its text, so saving twice with
  // the same outcome still closes.
  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state, onSaved]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={row ? "Edit address" : "Add an address"}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
    >
      <form
        action={action}
        className="w-full max-w-[520px] rounded-[var(--r-lg)] border border-hairline bg-surface-0 p-6"
      >
        <h3 className="text-base font-semibold text-text-hi">
          {row ? "Edit address" : "Add an address"}
        </h3>

        {row && <input type="hidden" name="id" value={row.id} />}

        <div className="mt-5 space-y-4">
          <Field
            id="fullName"
            label="Full name"
            defaultValue={row?.fullName ?? ""}
            autoComplete="name"
            required
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            defaultValue={row?.phone ?? ""}
            autoComplete="tel"
            inputMode="numeric"
            required
            hint="10 digits. The courier calls this."
          />
          <Field
            id="line1"
            label="Address"
            defaultValue={row?.line1 ?? ""}
            autoComplete="address-line1"
            required
          />
          <Field
            id="line2"
            label="Apartment, landmark (optional)"
            defaultValue={row?.line2 ?? ""}
            autoComplete="address-line2"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="city"
              label="City"
              defaultValue={row?.city ?? ""}
              autoComplete="address-level2"
              required
            />
            <div>
              <label htmlFor="state" className="block text-[12px] text-text-low">
                State
              </label>
              <select
                id="state"
                name="state"
                defaultValue={row?.state ?? "Kerala"}
                autoComplete="address-level1"
                required
                className="mt-1.5 w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi focus:border-accent"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Field
              id="pincode"
              label="PIN code"
              defaultValue={row?.pincode ?? ""}
              autoComplete="postal-code"
              inputMode="numeric"
              required
            />
          </div>
        </div>

        {state && !state.ok && (
          <p role="alert" className="mt-4 text-[12px] font-semibold text-danger">
            {state.message}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <SaveButton />
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--r-md)] border border-hairline px-4 py-2.5 text-[13px] text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save address"}
    </button>
  );
}

function Field({
  id,
  label,
  hint,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] text-text-low">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1.5 w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[11px] text-text-low">
          {hint}
        </p>
      )}
    </div>
  );
}
