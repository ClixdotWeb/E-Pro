import Link from "next/link";
import { Card, PageHeader, Pill, Stat } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";
import { ALL_PRODUCTS, BUYABLE_OFFERS, IMPORT_STATS } from "@/lib/realCatalog";

export const metadata = { title: "Overview" };

/**
 * Overview: what needs attention today, in one screen.
 *
 * The top row is counts. Under it, "Needs your attention" - the things
 * that are actually wrong with the catalogue right now, each one a
 * link to the screen that fixes it. That list is computed from the
 * real imported data, not decoration: products with no photo, no
 * category, and prices that look like typos.
 *
 * Orders are stubs until the database is connected.
 */

const RECENT_ORDERS = [
  { number: "EPRO-1042", customer: "Jayakrishnan R", at: "12 Nov", status: "Shipped", totalInPaise: 231800 },
  { number: "EPRO-1041", customer: "Arun Kumar", at: "12 Nov", status: "Processing", totalInPaise: 94900 },
  { number: "EPRO-1040", customer: "Meera S", at: "11 Nov", status: "Delivered", totalInPaise: 169800 },
];

const STATUS_TONE = {
  Processing: "warning",
  Shipped: "accent",
  Delivered: "success",
  Cancelled: "danger",
} as const;

export default function AdminOverviewPage() {
  const noPhoto = ALL_PRODUCTS.filter((p) => p.missingImages);
  const noCategory = ALL_PRODUCTS.filter((p) => !p.category);
  const oddPrices = ALL_PRODUCTS.filter((p) => p.suspiciousPrices.length > 0);

  const jobs = [
    {
      count: noPhoto.length,
      title: "products have no photo",
      body: "They show a colour swatch instead. A photo is the single biggest thing that makes one sell.",
      href: "/admin/products?filter=no-photo",
      tone: "warning" as const,
    },
    {
      count: oddPrices.length,
      title: "products have a price that looks wrong",
      body: "Imported exactly as they are in Shopify. Someone could order one of these for almost nothing.",
      href: "/admin/products?filter=odd-price",
      tone: "danger" as const,
    },
    {
      count: noCategory.length,
      title: "products have no category",
      body: "They do not appear under any device, so customers browsing cannot find them.",
      href: "/admin/products?filter=no-category",
      tone: "warning" as const,
    },
  ].filter((j) => j.count > 0);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Where the shop stands right now, and what needs you today."
      />

      {/* counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Products"
          value={String(ALL_PRODUCTS.length)}
          sub={`${IMPORT_STATS.totalVariants} options in total`}
        />
        <Stat
          label="Buyable options"
          value={String(BUYABLE_OFFERS.length)}
          sub="In stock and priced"
        />
        <Stat label="Orders today" value="0" sub="Needs the database" />
        <Stat
          label="Needs attention"
          value={String(jobs.reduce((n, j) => n + j.count, 0))}
          sub={jobs.length === 0 ? "Nothing outstanding" : "See the list below"}
          tone={jobs.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* jobs */}
      {jobs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-[15px] font-bold text-text-hi">
            Needs your attention
          </h2>

          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j.title}>
                <Link
                  href={j.href}
                  className="flex items-start gap-4 rounded-[12px] border border-hairline bg-surface-1 p-5 transition-colors hover:border-accent/45"
                >
                  <Pill tone={j.tone}>{j.count}</Pill>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-text-hi">
                      {j.count} {j.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-text-mid">
                      {j.body}
                    </span>
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0 text-text-low">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* recent orders */}
      <section className="mt-8">
        <Card
          title="Latest orders"
          hint="Stub rows until the database is connected."
        >
          <ul className="divide-y divide-hairline">
            {RECENT_ORDERS.map((o) => (
              <li key={o.number}>
                <Link
                  href={`/admin/orders/${o.number}`}
                  className="flex flex-wrap items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:text-accent"
                >
                  <span className="font-mono text-[13px] font-bold text-text-hi">
                    {o.number}
                  </span>
                  <span className="flex-1 truncate text-[13px] text-text-mid">
                    {o.customer}
                  </span>
                  <Pill tone={STATUS_TONE[o.status as keyof typeof STATUS_TONE]}>
                    {o.status}
                  </Pill>
                  <span className="text-[13px] text-text-hi">
                    {formatPaise(o.totalInPaise)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/admin/orders"
            className="mt-5 inline-block text-[13px] font-bold text-accent hover:underline"
          >
            All orders →
          </Link>
        </Card>
      </section>
    </>
  );
}
