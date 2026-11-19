import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getNavCategories } from "@/lib/catalog";

/**
 * Storefront chrome. Everything a customer sees sits inside this.
 * The admin deliberately does not.
 *
 * The header is a client component - it owns the menus and the mobile
 * sheet - so the category counts are read here, on the server, and
 * handed down. That keeps Prisma out of the browser bundle while the
 * menu still reflects what is actually in the database.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navCategories = await getNavCategories();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--r-sm)] focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
      >
        Skip to content
      </a>

      <Header navCategories={navCategories} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
    </>
  );
}
