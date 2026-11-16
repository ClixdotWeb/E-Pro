import Link from "next/link";

export type ContentBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: { title: string; body: string }[] }
  | { kind: "table"; rows: [string, string][] }
  | { kind: "note"; text: string };

export type ContentDoc = {
  kicker: string;
  title: string;
  lede: string;
  updated?: string;
  blocks: ContentBlock[];
  cta?: { label: string; href: string };
};

export function ContentPage({ doc }: { doc: ContentDoc }) {
  return (
    <article className="page max-w-3xl py-12">
      <p className="kicker">{doc.kicker}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-text-hi">
        {doc.title}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-text-mid">
        {doc.lede}
      </p>
      {doc.updated && (
        <p className="mt-3 text-[12px] text-text-low">
          Last updated {doc.updated}
        </p>
      )}

      <div className="mt-10 space-y-6">
        {doc.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>

      {doc.cta && (
        <Link
          href={doc.cta.href}
          className="mt-10 inline-block rounded-[var(--r-md)] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          {doc.cta.label}
        </Link>
      )}
    </article>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "h2":
      return (
        <h2 className="pt-4 text-xl font-semibold tracking-tight text-text-hi">
          {block.text}
        </h2>
      );

    case "p":
      return (
        <p className="text-[14px] leading-relaxed text-text-mid">
          {block.text}
        </p>
      );

    case "ul":
      return (
        <ul className="space-y-2">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-[14px] leading-relaxed text-text-mid"
            >
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="space-y-5 border-l border-hairline pl-6">
          {block.items.map((item, i) => (
            <li key={item.title} className="relative">
              <span className="absolute -left-[31px] grid h-[22px] w-[22px] place-items-center rounded-full border border-hairline bg-surface-0 font-mono text-[10px] text-accent">
                {i + 1}
              </span>
              <p className="text-sm font-semibold text-text-hi">{item.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-mid">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <dl className="divide-y divide-hairline border-y border-hairline text-[13px]">
          {block.rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
              <dt className="w-44 shrink-0 font-medium text-text-hi">{k}</dt>
              <dd className="leading-relaxed text-text-mid">{v}</dd>
            </div>
          ))}
        </dl>
      );

    case "note":
      return (
        <p className="rounded-[var(--r-md)] border border-hairline bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-text-mid">
          {block.text}
        </p>
      );
  }
}
