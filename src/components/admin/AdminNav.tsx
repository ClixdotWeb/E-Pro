"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Dashboard sidebar.
 *
 * Six destinations, in the order the work actually happens: look at
 * today, deal with orders, keep products right, then the occasional
 * things. Plain words - "Products", not "Catalogue management".
 *
 * Collapses to a top bar with a drawer under md, because a fixed
 * sidebar on a phone leaves no room for a table.
 */

const NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: <path d="M3 10.5L12 3l9 7.5M5.5 9.5V20h13V9.5" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <>
        <path d="M4.5 7h15l-1 13h-13z" />
        <path d="M8.5 7V5.5a3.5 3.5 0 1 1 7 0V7" />
      </>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <>
        <path d="M12 2.8l8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4z" />
        <path d="M3.8 7.4L12 12l8.2-4.6M12 12v9.2" />
      </>
    ),
  },
  {
    href: "/admin/designs",
    label: "Designs",
    icon: (
      <>
        <path d="M3.5 16.5l5-6 4 4.5 3-3.5 5 5" />
        <circle cx="8.5" cy="8" r="1.6" />
        <rect x="3" y="4" width="18" height="16" rx="3" />
      </>
    ),
  },
  {
    href: "/admin/pricing",
    label: "Pricing",
    icon: (
      <>
        <path d="M12 6v12M9.5 9.2A2.4 2.4 0 0 1 12 7.4c1.4 0 2.5.9 2.5 2M14.5 14.8A2.4 2.4 0 0 1 12 16.6c-1.4 0-2.5-.9-2.5-2" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    href: "/admin/stock",
    label: "Stock",
    icon: (
      <>
        <path d="M3 9h18M3 15h18" />
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      </>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <>
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
      </>
    ),
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: (
      <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.4 6.7 19.2l1.1-5.9L3.5 9.2l5.9-.8z" />
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      </>
    ),
  },
  {
    href: "/admin/discounts",
    label: "Discounts",
    icon: (
      <>
        <path d="M8.5 8.5h.01M15.5 15.5h.01M16.5 7.5l-9 9" />
        <rect x="3" y="3" width="18" height="18" rx="4" />
      </>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1z" />
      </>
    ),
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Any navigation closes the drawer. Adjusted during render so the
  // sheet is never painted open on the page just landed on.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* mobile bar */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-hairline bg-surface-0 px-5 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="rounded-[6px] p-2 text-text-mid hover:text-text-hi"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <Brand />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="absolute inset-y-0 left-0 w-[80%] max-w-xs overflow-y-auto border-r border-hairline bg-surface-1 p-5">
            <Brand />
            <List pathname={pathname} />
          </div>
        </div>
      )}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-hairline bg-surface-1 p-5 md:flex">
        <Brand />
        <List pathname={pathname} />

        <Link
          href="/"
          className="mt-auto flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] text-text-mid transition-colors hover:bg-surface-2 hover:text-text-hi"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 5l-7 7 7 7" />
          </svg>
          View the shop
        </Link>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="mb-7 block">
      <Image
        src="/brand/Epro_LOGO_LIGHT-01.png"
        alt="Epro Gadgets"
        width={2833}
        height={942}
        className="w-[100px]"
        priority
      />
    </Link>
  );
}

function List({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {NAV.map((item) => {
          // Overview must match exactly, or it stays lit on every page.
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] transition-colors ${
                  active
                    ? "bg-accent-soft font-bold text-accent"
                    : "text-text-mid hover:bg-surface-2 hover:text-text-hi"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="shrink-0"
                >
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
