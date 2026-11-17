"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Account section nav. A client component only because it needs the
 * current path to mark the active tab.
 */

const TABS = [
  { href: "/account", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start"
    >
      <ul className="rail flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {TABS.map((t) => {
          // Exact match, or /account would stay active on every subpage.
          const active = pathname === t.href;

          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-[var(--r-sm)] px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-text-mid hover:bg-surface-2 hover:text-text-hi"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
