import Link from "next/link";
import type { Metadata } from "next";
import { getFaqGroups } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Application, durability, shipping, returns and sizing — answered.",
};

/**
 * Full FAQ.
 *
 * The homepage carries five questions; this is the rest, grouped so
 * someone can scan to their section. Rendered as <details> so it works
 * without JavaScript and is searchable by the browser's own find.
 *
 * The answers are deliberately specific — "2–4 days to metros" rather
 * than "fast shipping" — because vague answers generate the support
 * messages an FAQ exists to prevent.
 */



export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const GROUPS = await getFaqGroups();

  return (
    <div className="page max-w-3xl py-12">
      <p className="kicker">Got questions?</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-text-hi">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-text-mid">
        If the answer is not here, message us on WhatsApp between 10am and
        7pm IST — the person who replies is usually the person who cut the
        skin.
      </p>

      <nav aria-label="Sections" className="mt-7 flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <a
            key={g.title}
            href={`#${slug(g.title)}`}
            className="rounded-full border border-hairline px-3.5 py-1.5 text-[12px] text-text-mid transition-colors hover:border-accent hover:text-accent"
          >
            {g.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-12">
        {GROUPS.map((g) => (
          <section key={g.title} id={slug(g.title)} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight text-text-hi">
              {g.title}
            </h2>

            <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
              {g.items.map((f) => (
                <li key={f.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-text-hi marker:content-none">
                      {f.question}
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline text-text-low transition-transform group-open:rotate-45">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="pb-5 pr-10 text-[13px] leading-relaxed text-text-mid">
                      {f.answer}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-8 text-center">
        <h2 className="text-lg font-semibold text-text-hi">
          Still not answered?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-text-mid">
          Send us the device model and what you are trying to do. We answer
          between 10am and 7pm IST.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-[var(--r-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Contact us
          </Link>
          <Link
            href="/how-to-apply"
            className="rounded-[var(--r-md)] border border-hairline px-5 py-2.5 text-[13px] font-semibold text-text-hi transition-colors hover:border-hairline-strong"
          >
            Application guide
          </Link>
        </div>
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
