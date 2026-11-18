import Link from "next/link";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: {
    default: "Dashboard · Epro Gadgets",
    template: "%s · Dashboard",
  },
  // The admin must never appear in a search result.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin shell: a fixed sidebar and a content column.
 *
 * It sits outside the (shop) route group, so the storefront header and
 * footer are not around it and the dashboard gets the whole screen.
 *
 * SECURITY, stated plainly because it matters: there is no sign-in on
 * this yet. Auth.js is installed but not wired, so anyone who knows
 * the URL can open /admin. That is fine on localhost and NOT fine on a
 * public domain. The guard below refuses to render in production until
 * a session check is added here - one `if (!session) redirect("/login")`
 * at the top of this layout, and then delete the guard.
 */

const LOCKED_IN_PRODUCTION = process.env.NODE_ENV === "production";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (LOCKED_IN_PRODUCTION) return <Locked />;

  return (
    <div className="flex min-h-screen bg-surface-0">
      <AdminNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <DevBanner />
        <main id="main" className="flex-1 px-5 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function DevBanner() {
  return (
    <p className="border-b border-warning/30 bg-warning/10 px-5 py-2 text-center text-[12px] text-warning md:px-10">
      Sign-in is not switched on yet — anyone with this link can open the
      dashboard. Do not put it on a public domain until it is.
    </p>
  );
}

function Locked() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-text-hi">Dashboard locked</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-mid">
          The dashboard has no sign-in yet, so it refuses to run in
          production. Wire the session check into{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px]">
            src/app/admin/layout.tsx
          </code>{" "}
          and remove this guard.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-black"
        >
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
