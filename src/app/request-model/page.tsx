import type { Metadata } from "next";
import { DEVICE_CATEGORIES, FINISH_LABEL, PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Request a model",
  description:
    "Tell us the device you want skinned and we'll template and cut it, usually within a week.",
};

export default function RequestModelPage() {
  return (
    <div className="page grid gap-12 py-12 lg:grid-cols-[1fr_minmax(0,440px)]">
      <div>
        <p className="kicker">Not in the catalogue yet?</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-text-hi">
          Request a cut for
          <br />
          <span className="text-accent">your device.</span>
        </h1>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-mid">
          We template new models every week. Send us the exact model and the
          design you want, and we&apos;ll come back with a price and a date.
          First cuts carry no extra charge.
        </p>

        <ol className="mt-10 space-y-6 border-l border-hairline pl-6">
          {[
            {
              title: "You send the model",
              body: "Exact name and variant — storage size rarely matters, but camera layout does.",
            },
            {
              title: "We template it",
              body: "Either from our die library or a fresh measurement off the real device.",
            },
            {
              title: "We quote and cut",
              body: "Usually within a week. Once cut, the model joins the catalogue for everyone.",
            },
          ].map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[31px] grid h-[22px] w-[22px] place-items-center rounded-full border border-hairline bg-surface-0 font-mono text-[10px] text-accent">
                {i + 1}
              </span>
              <p className="text-sm font-semibold text-text-hi">{s.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-mid">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* form */}
      <div className="card h-fit p-6 lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        <h2 className="text-base font-semibold text-text-hi">
          Tell us what you need
        </h2>

        <form className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Your name" name="name" required />
            <Input label="Phone / WhatsApp" name="phone" type="tel" required />
          </div>

          <Input label="Email" name="email" type="email" required />

          <Select
            label="Device type"
            name="deviceType"
            required
            options={DEVICE_CATEGORIES.map((c) => c.name)}
          />

          <Input
            label="Exact model"
            name="model"
            required
            placeholder="e.g. Sony ZV-E1, Insta360 X4"
            hint="Brand and full model name"
          />

          <Select
            label="Design you want"
            name="design"
            options={[
              ...PRODUCTS.map((p) => `${p.title} (${FINISH_LABEL[p.finish]})`),
              "Not sure yet — suggest something",
            ]}
          />

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
              Anything else?
            </span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Links to photos of the device, areas to leave uncovered, deadline..."
              className="w-full resize-y rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi placeholder:text-text-low"
            />
          </label>

          <button
            type="button"
            className="w-full rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Send request
          </button>

          <p className="text-center text-[11px] leading-relaxed text-text-low">
            We reply within one business day. No payment is taken at this step.
          </p>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi placeholder:text-text-low"
      />
      {hint && (
        <span className="mt-1 block text-[11px] text-text-low">{hint}</span>
      )}
    </label>
  );
}

function Select({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-text-mid">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <select
        name={name}
        required={required}
        className="w-full rounded-[var(--r-md)] border border-hairline bg-surface-0 px-3.5 py-2.5 text-sm text-text-hi"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
