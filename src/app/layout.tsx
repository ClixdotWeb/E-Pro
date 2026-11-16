import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

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
  icons: { icon: "/brand/Epro_gadgets_Favicon_image.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--r-sm)] focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
        >
          Skip to content
        </a>

        <Header />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
