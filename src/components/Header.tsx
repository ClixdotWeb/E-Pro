"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEVICE_CATEGORIES, FINISH_LABEL } from "@/lib/catalog";

const NAV = [
  { label: "Find my device", href: "/find" },
  { label: "Request Model", href: "/request-model" },
  { label: "Material", href: "/material" },
  { label: "How to apply", href: "/how-to-apply" },
  { label: "Contact us", href: "/contact" },
  { label: "About us", href: "/about" },
];

export function Header({ cartCount = 0 }: { cartCount?: number }) {
  const [skinOpen, setSkinOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Any navigation closes every overlay, including back/forward.
  // Adjusted during render rather than in an effect, so the menus are
  // never painted open on the page we just landed on.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSkinOpen(false);
    setMobileOpen(false);
  }

  // Escape closes, and body scroll locks while the mobile sheet is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSkinOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* announcement bar */}
      <div className="border-b border-hairline bg-surface-2">
        <p className="page flex h-8 items-center justify-center text-center text-[11px] tracking-wide text-text-mid">
          Free shipping on orders over ₹499 · Precision-cut, residue-free
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-hairline bg-surface-0/85 backdrop-blur-xl">
        <div className="page flex h-[var(--header-h)] items-center gap-3">
          {/* mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-[var(--r-sm)] p-2 text-text-mid hover:text-text-hi md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Icon name="menu" />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo />
          </Link>

          {/* desktop nav */}
          <nav
            className="ml-4 hidden items-center gap-1 md:flex"
            onMouseLeave={() => setSkinOpen(false)}
          >
            <button
              type="button"
              onClick={() => setSkinOpen((v) => !v)}
              onMouseEnter={() => setSkinOpen(true)}
              className="flex items-center gap-1 rounded-[var(--r-sm)] px-3 py-2 text-sm text-text-mid transition-colors hover:text-text-hi aria-expanded:text-text-hi"
              aria-expanded={skinOpen}
              aria-haspopup="true"
            >
              Skin
              <Icon
                name="chevron"
                className={`transition-transform ${skinOpen ? "rotate-180" : ""}`}
              />
            </button>

            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[var(--r-sm)] px-3 py-2 text-sm transition-colors hover:text-text-hi ${
                  pathname === item.href ? "text-text-hi" : "text-text-mid"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/search"
              className="rounded-[var(--r-sm)] p-2 text-text-mid hover:text-text-hi"
              aria-label="Search"
            >
              <Icon name="search" />
            </Link>
            <Link
              href="/account"
              className="hidden rounded-[var(--r-sm)] p-2 text-text-mid hover:text-text-hi sm:block"
              aria-label="Account"
            >
              <Icon name="user" />
            </Link>
            <Link
              href="/cart"
              className="relative rounded-[var(--r-sm)] p-2 text-text-mid hover:text-text-hi"
              aria-label={`Cart, ${cartCount} items`}
            >
              <Icon name="bag" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* desktop mega menu */}
        {skinOpen && (
          <div
            className="absolute inset-x-0 top-full hidden border-b border-hairline bg-surface-1 shadow-pop md:block"
            onMouseEnter={() => setSkinOpen(true)}
            onMouseLeave={() => setSkinOpen(false)}
          >
            <div className="page grid grid-cols-5 gap-x-6 gap-y-7 py-8">
              {DEVICE_CATEGORIES.map((cat) => (
                <div key={cat.slug}>
                  <Link
                    href={`/collections/${cat.slug}`}
                    className="text-sm font-semibold text-text-hi hover:text-accent"
                  >
                    {cat.name}
                  </Link>
                  <ul className="mt-2 space-y-1.5">
                    {cat.finishes.map((f) => (
                      <li key={f}>
                        <Link
                          href={`/collections/${cat.slug}?finish=${f}`}
                          className="text-[13px] text-text-mid hover:text-text-hi"
                        >
                          {FINISH_LABEL[f]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto border-r border-hairline bg-surface-1">
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-hairline px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-[var(--r-sm)] p-2 text-text-mid"
                aria-label="Close menu"
              >
                <Icon name="close" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4">
              <p className="kicker px-3 pb-2">Shop by device</p>
              {DEVICE_CATEGORIES.map((cat) => (
                <details key={cat.slug} className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-text-hi marker:content-none">
                    {cat.name}
                    <Icon
                      name="chevron"
                      className="text-text-low transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <ul className="pb-2 pl-3">
                    <li>
                      <Link
                        href={`/collections/${cat.slug}`}
                        className="block py-2 pl-3 text-[13px] text-accent"
                      >
                        All {cat.name}
                      </Link>
                    </li>
                    {cat.finishes.map((f) => (
                      <li key={f}>
                        <Link
                          href={`/collections/${cat.slug}?finish=${f}`}
                          className="block py-2 pl-3 text-[13px] text-text-mid"
                        >
                          {FINISH_LABEL[f]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}

              <div className="my-3 h-px bg-hairline" />

              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-text-mid"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/account"
                className="block rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-text-mid"
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-accent text-[13px] font-black text-accent-ink">
        E
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-text-hi">
        Epro<span className="text-text-low"> Gadgets</span>
      </span>
    </span>
  );
}

const PATHS = {
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "M6 6l12 12M18 6L6 18",
  chevron: "M6 9l6 6 6-6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  bag: "M6 7h12l1.2 13H4.8L6 7zM9 7V5a3 3 0 0 1 6 0v2",
} as const;

function Icon({
  name,
  className = "",
}: {
  name: keyof typeof PATHS;
  className?: string;
}) {
  const small = name === "chevron";
  const s = small ? 14 : 19;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={small ? 2.5 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
