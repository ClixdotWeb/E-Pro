"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "./ui";
import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/settings";

/**
 * The shop's own rules, in a form.
 *
 * These were constants in half a dozen files, which made "put free
 * shipping up to ₹699" a code change and a deploy. Money is typed in
 * rupees here and stored in paise, because nobody thinks in paise
 * and a form that asks for 49900 invites someone to type 499.
 *
 * One Save for the lot, written in a transaction, so a half-saved
 * form cannot leave shipping free and GST at zero.
 */

type Draft = Record<string, string>;

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => ({
    "shipping.flatPaise": rupees(settings["shipping.flatPaise"]),
    "shipping.freeOverPaise": rupees(settings["shipping.freeOverPaise"]),
    "tax.gstBps": percent(settings["tax.gstBps"]),
    "contact.whatsapp": settings["contact.whatsapp"],
    "contact.whatsappDisplay": settings["contact.whatsappDisplay"],
    "contact.email": settings["contact.email"],
    "contact.phone": settings["contact.phone"],
    "contact.instagram": settings["contact.instagram"],
    "contact.youtube": settings["contact.youtube"],
    "cut.logoCutoutBrands": settings["cut.logoCutoutBrands"],
    "home.videoDesktop": settings["home.videoDesktop"],
    "home.videoMobile": settings["home.videoMobile"],
    "home.customersHeading": settings["home.customersHeading"],
    "home.customersBlurb": settings["home.customersBlurb"],
  }));
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const set = (key: string) => (value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function save() {
    setResult(null);
    start(async () => {
      const r = await saveSettings({
        ...draft,
        // back to the units the rest of the shop works in
        "shipping.flatPaise": String(toPaise(draft["shipping.flatPaise"])),
        "shipping.freeOverPaise": String(
          toPaise(draft["shipping.freeOverPaise"]),
        ),
        "tax.gstBps": String(toBps(draft["tax.gstBps"])),
      });
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card
        title="Shipping and tax"
        hint="What every order is charged. Typed in rupees."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Shipping"
            prefix="Rs."
            value={draft["shipping.flatPaise"]}
            onChange={set("shipping.flatPaise")}
            note="Flat rate per order"
          />
          <Field
            label="Free over"
            prefix="Rs."
            value={draft["shipping.freeOverPaise"]}
            onChange={set("shipping.freeOverPaise")}
            note="Shipping drops to zero above this"
          />
          <Field
            label="GST"
            suffix="%"
            value={draft["tax.gstBps"]}
            onChange={set("tax.gstBps")}
            note="Already inside the prices shown"
          />
        </div>
      </Card>

      <Card
        title="Where enquiries go"
        hint="Every Ask button, the request form and the floating button open a chat with this number."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="WhatsApp number"
            value={draft["contact.whatsapp"]}
            onChange={set("contact.whatsapp")}
            note="Digits only, with the country code — 91…"
          />
          <Field
            label="How it is printed"
            value={draft["contact.whatsappDisplay"]}
            onChange={set("contact.whatsappDisplay")}
            note="What a customer reads, e.g. +91 95624 70470"
          />
          <Field
            label="Email"
            value={draft["contact.email"]}
            onChange={set("contact.email")}
          />
          <Field
            label="Phone"
            value={draft["contact.phone"]}
            onChange={set("contact.phone")}
          />
          <Field
            label="Instagram"
            value={draft["contact.instagram"]}
            onChange={set("contact.instagram")}
          />
          <Field
            label="YouTube"
            value={draft["contact.youtube"]}
            onChange={set("contact.youtube")}
          />
        </div>
      </Card>

      <Card
        title="What we ask about"
        hint="Brands whose logo a customer may choose to keep showing."
      >
        <Field
          label="Logo cutout brands"
          value={draft["cut.logoCutoutBrands"]}
          onChange={set("cut.logoCutoutBrands")}
          note="Comma separated, as they appear in the price lists. Apple is the only one today."
        />
      </Card>

      <Card
        title="Homepage"
        hint="The video band at the top and the Instagram band further down."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Hero video, desktop"
            value={draft["home.videoDesktop"]}
            onChange={set("home.videoDesktop")}
            note="A path under /public. Its poster is the same name with .jpg."
          />
          <Field
            label="Hero video, phone"
            value={draft["home.videoMobile"]}
            onChange={set("home.videoMobile")}
          />
          <Field
            label="Instagram band heading"
            value={draft["home.customersHeading"]}
            onChange={set("home.customersHeading")}
          />
          <Field
            label="Instagram band line"
            value={draft["home.customersBlurb"]}
            onChange={set("home.customersBlurb")}
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="h-11 rounded-full bg-accent px-7 text-[14px] font-bold text-black disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>

        {result && (
          <p
            role="status"
            className={`text-[13px] font-bold ${
              result.ok ? "text-success" : "text-danger"
            }`}
          >
            {result.message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- units: the form speaks rupees and percent, the shop paise ---- */

function rupees(paise: string): string {
  const n = Number(paise);
  return Number.isFinite(n) ? String(n / 100) : "0";
}

function toPaise(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
}

function percent(bps: string): string {
  const n = Number(bps);
  return Number.isFinite(n) ? String(n / 100) : "0";
}

function toBps(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
}

function Field({
  label,
  value,
  onChange,
  note,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  note?: string;
  prefix?: string;
  suffix?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-text-low"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && (
          <span className="shrink-0 text-[13px] text-text-low">{prefix}</span>
        )}
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full min-w-0 rounded-[8px] border border-hairline bg-surface-2 px-3.5 text-[14px] text-text-hi focus:border-accent focus:outline-none"
        />
        {suffix && (
          <span className="shrink-0 text-[13px] text-text-low">{suffix}</span>
        )}
      </div>
      {note && <p className="mt-2 text-[12px] text-text-mid">{note}</p>}
    </div>
  );
}
