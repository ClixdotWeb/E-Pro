"use client";

import { useState } from "react";
import { whatsappRequestModel } from "@/lib/whatsapp";

/**
 * "Add my device to your list."
 *
 * It sends the request to WhatsApp rather than to an inbox. The form
 * posted nowhere at all before this, and the honest alternatives
 * were a mail server nobody has set up yet or a table in the
 * database that someone would have to remember to look at. A
 * WhatsApp message lands on the phone that already answers these,
 * and the customer keeps a copy of what they asked.
 *
 * The button is a link, not a submit: the browser's own required-field
 * check only fires on submit, so the fields are checked here and the
 * message is assembled from whatever is filled in.
 *
 * Every label, placeholder and asterisk is the live store's own.
 */

export function RequestModelForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [productType, setProductType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const missing = [
    !brand.trim() && "the brand",
    !model.trim() && "the model",
  ].filter(Boolean) as string[];

  const ready = missing.length === 0;

  const href = whatsappRequestModel({
    name: name.trim(),
    productType: productType.trim(),
    brand: brand.trim(),
    model: model.trim(),
    message: [message.trim(), email.trim() && `Email: ${email.trim()}`]
      .filter(Boolean)
      .join("\n"),
  });

  return (
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
      <Field
        id="name"
        label="Your name"
        autoComplete="name"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Field
        id="email"
        label="Your email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Field
        id="productType"
        label="Product Type"
        placeholder="e.g. Camera, Lens, Smartphone, Drone..."
        className="md:col-span-2"
        value={productType}
        onChange={(e) => setProductType(e.target.value)}
      />

      <Field
        id="brand"
        label="Brand"
        placeholder="e.g. Sony, Canon, Apple, DJI..."
        required
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />
      <Field
        id="model"
        label="Model"
        placeholder="e.g. A7 IV, 24-70mm GM II, iPhone 16 Pro..."
        required
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />

      <div className="md:col-span-2">
        <Label htmlFor="message">Your message</Label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] w-full resize-y rounded-[6px] border border-hairline bg-surface-2 px-4 pt-2.5 text-[14px] leading-relaxed text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-2 flex flex-col items-center gap-3 md:col-span-2 md:mt-6">
        <a
          href={ready ? href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) {
              e.preventDefault();
              setTouched(true);
            }
          }}
          className={`inline-flex h-11 items-center gap-2.5 rounded-full bg-accent px-7 text-sm font-bold text-black transition-colors hover:bg-accent-hover ${
            ready ? "" : "cursor-not-allowed opacity-50"
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.03L2 22.5l5.6-1.47A9.9 9.9 0 1 0 12.04 2zm0 1.84a8.06 8.06 0 1 1-4.1 14.99l-.29-.17-3.32.87.89-3.23-.19-.3A8.06 8.06 0 0 1 12.04 3.84zm-3.2 4.03c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.16 1.75 2.79 4.3 3.8 2.12.84 2.55.67 3.01.63.46-.04 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29-.25-.12-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.12-.17.25-.65.81-.8.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.39-1.72c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.36-.76-1.86-.2-.49-.4-.42-.55-.43h-.44z" />
          </svg>
          Send on WhatsApp
        </a>

        <p
          role={touched && !ready ? "alert" : undefined}
          className={`text-center text-[12px] ${
            touched && !ready ? "font-bold text-danger" : "text-text-low"
          }`}
        >
          {touched && !ready
            ? `Fill in ${missing.join(" and ")} first.`
            : "Opens WhatsApp with your request typed out. Read it, then send."}
        </p>
      </div>
    </div>
  );
}

function Label({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-text-mid"
    >
      {children}
      {/* .color-error is #eb544a in the theme */}
      {required && <sup className="ml-1 text-danger">*</sup>}
    </label>
  );
}

function Field({
  id,
  label,
  required = false,
  className = "",
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        type={type}
        className="h-11 w-full rounded-[6px] border border-hairline bg-surface-2 px-4 text-[14px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
        {...rest}
      />
    </div>
  );
}
