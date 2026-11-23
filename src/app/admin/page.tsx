import Link from "next/link";
import { Avatar, Card, PageHeader, Pill, Stat } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";
import { getAllProducts, getCatalogStats } from "@/lib/catalog";

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
 * The attention rows carry a coloured left edge and a tinted number
 * so severity reads before the sentence does. Orders are a proper
 * aligned table with the customer's initials to anchor the eye, not a
 * run of cramped lines.
 *
 * Orders are stubs until the database is connected.
 */

const RECENT_ORDERS = [
  { number: "EPRO-1042", customer: "Jayakrishnan R", at: "12 Nov", status: "Shipped", items: 3, totalInPaise: 231800 },
  { number: "EPRO-1041", customer: "Arun Kumar", at: "12 Nov", status: "Processing", items: 1, totalInPaise: 94900 },
  { number: "EPRO-1040", customer: "Meera S", at: "11 Nov", status: "Delivered", items: 2, totalInPaise: 169800 },
];

const STATUS_TONE = {
  Processing: "warning",
  Shipped: "accent",
  Delivered: "success",
  Cancelled: "danger",
} as const;

const ICON = {
  box: (
    <>
      <path d="M12 2.8l8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4z" />
      <path d="M3.8 7.4L12 12l8.2-4.6M12 12v9.2" />
    </>
  ),
  tag: (
    <>
      <path d="M8.5 8.5h.01M16.5 7.5l-9 9" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </>
  ),
  bag: (
    <>
      <path d="M4.5 7h15l-1 13h-13z" />
      <path d="M8.5 7V5.5a3.5 3.5 0 1 1 7 0V7" />
    </>
  ),
  alert: (
    <>
      <path d="M12 8.5v5M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
};

export default async function AdminOverviewPage() {
  const [products, stats] = await Promise.all([
    getAllProducts(),
    getCatalogStats(),
  ]);

  const noPhoto = products.filter((p) => p.missingImages);
  const noCategory = products.filter((p) => !p.category);
  const oddPrices = products.filter((p) => p.suspiciousPrices.length > 0);
  const soldOut = stats.realOptions - stats.inStock;

  const jobs = [
    {
      count: oddPrices.length,
      title: "products have a price that looks wrong",
      body: "Imported exactly as they are in Shopify. Someone could order one of these for almost nothing.",
      href: "/admin/products?filter=odd-price",
      tone: "danger" as const,
    },
    {
      count: noPhoto.length,
      title: "products have no photo",
      body: "They show a colour swatch instead. A photo is the single biggest thing that makes one sell.",
      href: "/admin/products?filter=no-photo",
      tone: "warning" as const,
    },
    {
      count: noCategory.length,
      title: "products have no category",
      body: "They do not appear under any device, so customers browsing cannot find them.",
      href: "/admin/products?filter=no-category",
      tone: "warning" as const,
    },
  ].filter((j) => j.count > 0);

  const outstanding = jobs.reduce((n, j) => n + j.count, 0);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Where the shop stands right now, and what needs you today."
      />

      {/* counts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Products"
          value={String(stats.products)}
          sub={
            stats.draftProducts > 0
              ? `${stats.draftProducts} in draft — ${stats.draftVariants.toLocaleString("en-IN")} options waiting on a price`
              : `${stats.totalVariants.toLocaleString("en-IN")} options in total`
          }
          icon={ICON.box}
          tone={stats.draftProducts > 0 ? "warning" : "default"}
        />
        {/* "Buyable options / in stock and priced" was wrong twice over:
            the number only excluded placeholder NAMES, and said nothing
            about stock. This is the count someone can actually add to a
            cart - in stock, priced, and on a product that is Active.
            The denominator leaves out placeholder option names, so it
            is smaller than the row count in the database. */}
        <Stat
          label="Options for sale"
          value={String(stats.inStock)}
          sub={
            soldOut > 0
              ? `Of ${stats.realOptions} real options — ${soldOut} sold out`
              : `All ${stats.realOptions} available`
          }
          icon={ICON.tag}
          tone="accent"
        />
        <Stat
          label="Orders today"
          value="0"
          sub="Needs the database"
          icon={ICON.bag}
        />
        <Stat
          label="Needs attention"
          value={String(outstanding)}
          sub={outstanding === 0 ? "Nothing outstanding" : "See the list below"}
          icon={ICON.alert}
          tone={outstanding > 0 ? "warning" : "default"}
        />
      </div>

      {/* jobs */}
      {jobs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-[15px] font-bold tracking-tight text-text-hi">
            Needs your attention
          </h2>

          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j.title}>
                <Link
                  href={j.href}
                  className={`group relative flex items-center gap-5 overflow-hidden rounded-[14px] border border-hairline bg-surface-1 py-5 pl-6 pr-5 transition-colors hover:border-hairline-strong ${
                    j.tone === "danger"
                      ? "hover:bg-danger/[0.04]"
                      : "hover:bg-warning/[0.04]"
                  }`}
                >
                  {/* severity edge */}
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-[3px] ${
                      j.tone === "danger" ? "bg-danger" : "bg-warning"
                    }`}
                  />

                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-bold tabular-nums ${
                      j.tone === "danger"
                        ? "bg-danger/15 text-danger"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {j.count}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-text-hi">
                      {j.count} {j.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-text-mid">
                      {j.body}
                    </span>
                  </span>

                  <span className="hidden shrink-0 text-[12px] font-bold text-text-low group-hover:text-text-hi sm:block">
                    Fix
                  </span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-text-low transition-transform group-hover:translate-x-0.5 group-hover:text-text-hi">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* recent orders */}
      <section className="mt-10">
        <Card
          title="Latest orders"
          hint="Stub rows until the database is connected."
          flush
          action={
            <Link
              href="/admin/orders"
              className="text-[13px] font-bold text-accent hover:underline"
            >
              All orders →
            </Link>
          }
        >
          {/* column headers, so the numbers on the right have a name */}
          <div className="hidden items-center gap-4 border-b border-hairline px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-low md:flex">
            <span className="w-[108px]">Order</span>
            <span className="flex-1">Customer</span>
            <span className="w-[110px]">Status</span>
            <span className="w-[130px] text-right">Total</span>
          </div>

          <ul>
            {RECENT_ORDERS.map((o) => (
              <li key={o.number} className="border-b border-hairline last:border-0">
                <Link
                  href={`/admin/orders/${o.number}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-surface-2"
                >
                  <span className="w-[108px] font-mono text-[13px] font-bold text-text-hi">
                    {o.number}
                  </span>

                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={o.customer} />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-text-hi">
                        {o.customer}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-text-low">
                        {o.at} · {o.items} item{o.items === 1 ? "" : "s"}
                      </span>
                    </span>
                  </span>

                  <span className="w-[110px]">
                    <Pill tone={STATUS_TONE[o.status as keyof typeof STATUS_TONE]}>
                      {o.status}
                    </Pill>
                  </span>

                  <span className="w-[130px] text-right text-[13px] font-bold tabular-nums text-text-hi">
                    {formatPaise(o.totalInPaise)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  );
}
