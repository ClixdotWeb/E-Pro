import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { currentStaff, isStaffRole } from "@/auth";
import { db } from "@/lib/db";

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
 * The sign-in check is here, one place for every screen inside it,
 * and a screen added later is protected by being added. Anyone not
 * signed in is sent to the login page; anyone signed in without a
 * staff role is told plainly rather than redirected in a loop.
 *
 * The one exception is a shop with no staff at all. A fresh
 * installation would otherwise lock its own owner out: the dashboard
 * needs an admin, and the only way to make one is the dashboard.
 * While the User table holds nobody with a role, the first person
 * through is let in and told to make themselves an admin. That hole
 * closes by itself the moment one exists.
 */

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The role comes from the database, not the token: taking someone
  // out of the dashboard has to work now, not when their token
  // happens to expire.
  const [me, staffCount] = await Promise.all([
    currentStaff(),
    db.user.count({ where: { role: { in: ["ADMIN", "STAFF"] } } }),
  ]);

  if (!me) redirect("/login?next=/admin");
  if (!isStaffRole(me.role) && staffCount > 0) return <NotStaff />;

  return (
    <div className="flex min-h-screen bg-surface-0">
      <AdminNav />

      <div className="flex min-w-0 flex-1 flex-col">
        {staffCount === 0 && <NoStaffYet />}
        <header className="flex items-center justify-end gap-4 border-b border-hairline px-5 py-3 md:px-10">
          <span className="text-[13px] text-text-mid">
            {me.name ?? me.email}
          </span>
          <SignOutButton />
        </header>
        <main id="main" className="flex-1 px-5 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function NoStaffYet() {
  return (
    <p className="border-b border-warning/30 bg-warning/10 px-5 py-2 text-center text-[12px] text-warning md:px-10">
      No staff account exists yet, so everyone signed in can open this.
      Make yourself an admin under{" "}
      <Link href="/admin/customers" className="underline">
        Customers
      </Link>{" "}
      to close it.
    </p>
  );
}

function NotStaff() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-text-hi">Not your dashboard</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-mid">
          You are signed in, but this account is not staff. If it should be,
          ask whoever runs the shop to change it.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-black"
          >
            Back to the shop
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
