import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getNavCategories } from "@/lib/catalog";
import { getCartCount } from "@/lib/cart";

/**
 * Storefront chrome. Everything a customer sees sits inside this.
 * The admin deliberately does not.
 *
 * The header is a client component - it owns the menus and the mobile
 * sheet - so the category counts are read here, on the server, and
 * handed down. That keeps Prisma out of the browser bundle while the
 * menu still reflects what is actually in the database.
 */
/**
 * Rendered per request. The header shows live category counts, so a
 * shell baked at build time would go stale the moment a product
 * changed - and the Docker build has no database to bake it from.
 */
export const dynamic = "force-dynamic";

export default async function ShopLayout({
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

      <Footer />
      <WhatsAppButton />
    </>
  );
}
