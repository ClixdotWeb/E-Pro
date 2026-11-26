import { Header } from "@/components/Header";
import { getNavCategories } from "@/lib/catalog";
import { getCartCount } from "@/lib/cart";

/**
 * Sign-in, sign-up and password reset.
 *
 * The same header as the shop, and deliberately no footer. The shop
 * footer carries four assurance cards and five columns of links -
 * about two screens of it - under a page whose only job is one
 * form. Someone here is finishing a task, not browsing, and every
 * link under the button is a way out of it.
 *
 * A separate route group rather than a flag on the shop layout,
 * because "which chrome does this page get" is what route groups
 * are for, and the URLs do not change.
 */
export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navCategories, cartCount] = await Promise.all([
    getNavCategories(),
    getCartCount(),
  ]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--r-sm)] focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
      >
        Skip to content
      </a>

      <Header navCategories={navCategories} cartCount={cartCount} />

      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
