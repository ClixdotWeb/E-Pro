"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FINISH_LABEL } from "@/lib/catalog-shared";
/**
 * The header only needs a slug and, where it is known, how many
 * options are in that category. The 404 renders above the shop layout
 * and has no database, so it passes names without counts - an
 * undefined count means "unknown", and the menu links to the
 * collection rather than claiming nothing is cut yet.
 */
type HeaderCategory = {
  slug: string;
  count?: number;
  /** finish slugs the catalogue offers for this device */
  finishes?: string[];
};

/**
 * The live store's desktop nav, in its order: a "Skin" dropdown then
 * five links. I briefly cut this to two items after reading the mobile
 * drawer markup instead of the desktop header - that was wrong, and
 * this is what the real header shows.
 *
 * The theme class is `logo-position--middle-center`, i.e. the grid is
 * "header-logo header-nav header-icons" with the nav centred in the
 * page, not packed against the logo.
 */
/**
 * The Skin dropdown: the ten devices in the store's order, each with
 * the finishes offered for it.
 *
 * The device list is the live header's, kept verbatim. The finishes
 * under each are not - they used to be a hand-copied list, and that
 * went stale the moment the real price lists came in. They are now
 * whatever the catalogue actually sells for that device, read on the
 * server and passed down. A device with nothing priced for it gets no
 * chevron, and a finish added to the price list appears here without
 * anyone editing this file.
 *
 * Every finish link on the live site is href="#" - a dead placeholder
 * - so these point at the finish collection instead.
 */

/** Device order and labels exactly as the live menu prints them. */
const SKIN_ORDER: { slug: string; label: string }[] = [
  { slug: "phone", label: "Phone" },
  { slug: "camera", label: "Camera" },
  { slug: "lens", label: "Lens" },
  { slug: "laptop", label: "Laptop" },
  { slug: "gimbal", label: "Gimbal" },
  { slug: "tablet", label: "Tablet" },
  { slug: "gaming-consoles", label: "Gaming consoles" },
  { slug: "drone", label: "Drone" },
  { slug: "wireless-earbuds", label: "Wireless Earbuds" },
  { slug: "charger", label: "Charger" },
];

function buildSkinMenu(navCategories: HeaderCategory[]) {
  return SKIN_ORDER.map(({ slug, label }) => ({
    slug,
    label,
    count: navCategories.find((c) => c.slug === slug)?.count,
    finishes: (
      navCategories.find((c) => c.slug === slug)?.finishes ?? []
    ).map((f) => ({
      label: FINISH_LABEL[f] ?? f,
      href: `/collections/${f}`,
    })),
  }));
}

type SkinMenu = ReturnType<typeof buildSkinMenu>;

/**
 * The dropdown panel itself.
 *
 * Not a full-width mega menu: on the live site it is one grey panel
 * hanging off the "Skin" link. It is positioned against the wrapper
 * around that button, so it tracks the word rather than sitting in the
 * middle of the header.
 */
function SkinDropdown({ open, menu }: { open: boolean; menu: SkinMenu }) {
  if (!open) return null;

  return (
    <div className="absolute left-0 top-full z-50 hidden w-[400px] pt-2 md:block">
      <div className="overflow-hidden rounded-lg bg-[#4a4a4a] py-2 shadow-pop">
        {menu.map((item) => {
          const href =
            item.count === 0 ? "/request-model" : `/collections/${item.slug}`;

          return item.finishes.length === 0 ? (
            <Link
              key={item.slug}
              href={href}
              className="block px-6 py-3 text-[19px] font-bold text-white transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ) : (
            <details key={item.slug} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-3 text-[19px] font-bold text-white marker:content-none hover:text-accent">
                {item.label}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                  className="shrink-0 transition-transform group-open:rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.7071 9.00421L18.2929 7.59L12 13.8829L5.70712 7.59L4.29291 9.00421L12 16.7113L19.7071 9.00421Z"
                  />
                </svg>
              </summary>

              <ul className="pb-1 pl-9 pr-6">
                {item.finishes.map((f) => (
                  <li key={f.label}>
                    <Link
                      href={f.href}
                      className="block py-1.5 text-[15px] text-white/75 transition-colors hover:text-white"
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}

const NAV = [
  { label: "Request Model", href: "/request-model" },
  { label: "Material", href: "/material" },
  { label: "How to apply", href: "/how-to-apply" },
  { label: "Contact us", href: "/contact" },
  { label: "About us", href: "/about" },
];

export function Header({
  navCategories,
  cartCount = 0,
}: {
  navCategories: HeaderCategory[];
  cartCount?: number;
}) {
  const skinMenu = buildSkinMenu(navCategories);
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
      {/* The live store has no announcement bar, and no border under
          the header either - it sits on flat black. Both were my
          additions. */}
      <header className="sticky top-0 z-50 bg-surface-0">
        {/* Theme grid: "header-logo header-nav header-icons" - the nav
            is centred in the page, not pushed up against the logo. */}
        <div className="page grid h-[var(--header-h)] grid-cols-[auto_1fr_auto] items-center gap-3">
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

          {/* desktop nav - centred */}
          <nav
            className="hidden items-center justify-center gap-1 md:flex"
            onMouseLeave={() => setSkinOpen(false)}
          >
            {/* The panel is anchored to this wrapper, so it hangs
                directly under the word "Skin" rather than under the
                centre of the header. */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSkinOpen((v) => !v)}
                onMouseEnter={() => setSkinOpen(true)}
                /* "Skin" is the one top-level item the live header
                   keeps bold; the rest are weight 400. */
                className={`nav-link flex items-center gap-1 px-4 py-2 text-base font-bold transition-colors ${
                  skinOpen ? "text-accent" : "text-text-hi"
                }`}
                aria-expanded={skinOpen}
                aria-haspopup="true"
              >
                Skin
                <Icon
                  name="chevron"
                  className={`transition-transform ${skinOpen ? "rotate-180" : ""}`}
                />
              </button>

              <SkinDropdown open={skinOpen} menu={skinMenu} />
            </div>

            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="nav-link whitespace-nowrap px-4 py-2 text-base text-text-hi"
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
              {/* Same menu as the desktop dropdown, so the two cannot
                  drift apart the way they did before. */}
              <p className="kicker px-3 pb-2">Skin</p>
              {skinMenu.map((item) => {
                const href =
                  item.count === 0
                    ? "/request-model"
                    : `/collections/${item.slug}`;

                return item.finishes.length === 0 ? (
                  <Link
                    key={item.slug}
                    href={href}
                    className="block rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-text-hi"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <details key={item.slug} className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-text-hi marker:content-none">
                      {item.label}
                      <Icon
                        name="chevron"
                        className="text-text-low transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <ul className="pb-2 pl-3">
                      <li>
                        <Link
                          href={href}
                          className="block py-2 pl-3 text-[13px] text-accent"
                        >
                          All {item.label}
                        </Link>
                      </li>
                      {item.finishes.map((f) => (
                        <li key={f.label}>
                          <Link
                            href={f.href}
                            className="block py-2 pl-3 text-[13px] text-text-mid"
                          >
                            {f.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              })}

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
              <Link
                href="/login"
                className="block rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-accent"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function Logo() {
  // The real mark, as served by the live theme (light-on-dark, 2833x942).
  // The theme sizes it by WIDTH, not height:
  //   --logo-width-mobile: 90px; --logo-width-desktop: 100px
  return (
    <Image
      src="/brand/Epro_LOGO_LIGHT-01.png"
      alt="Epro Gadgets"
      width={2833}
      height={942}
      priority
      className="w-[90px] md:w-[100px]"
    />
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
