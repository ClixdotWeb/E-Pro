import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Root layout: fonts, metadata and the document shell only.
 *
 * The storefront chrome (header, footer, skip link) lives in
 * `(shop)/layout.tsx`, and the admin has its own in `admin/layout.tsx`.
 * They are route groups, so neither changes a URL - `(shop)/cart` is
 * still /cart. Splitting them this way is what lets the dashboard fill
 * the screen instead of sitting inside the shop's header and footer.
 */

// The live theme sets Poppins with an -apple-system fallback chain.
const sans = Poppins({
  variable: "--font-sans-stack",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Epro Gadgets — Precision-cut device skins",
    template: "%s · Epro Gadgets",
  },
  description:
    "Protective skins for phones, laptops, cameras, lenses, drones, gimbals, consoles and earbuds. Precision-cut, residue-free, shipped across India.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "Epro Gadgets",
    locale: "en_IN",
  },
  // No `icons` here on purpose. src/app/icon.png, apple-icon.png and
  // favicon.ico are the file convention, and Next links all three
  // with their own hashes - but only while this field is absent,
  // because an explicit `icons` overrides the convention entirely.
  // The old value pointed at the 1942px source artwork, which the
  // browser then downscaled to 16px itself, badly.
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
