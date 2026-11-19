import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone - a self-contained server with only the
  // node_modules it actually traced. Coolify builds this in Docker, and
  // it takes the image from ~1.2 GB to ~200 MB.
  //
  // Vercel builds its own output format and does not want a standalone
  // server, so it is skipped there. VERCEL is set by their build.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),

  // Evaluated once when the build starts, so the footer can print a
  // copyright year without calling new Date() during prerender.
  env: {
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },

  images: {
    remotePatterns: [
      // Imported product photography still lives on Shopify's CDN. Move
      // these files to our own storage before switching the domain over,
      // or the new site depends on the old store staying alive.
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
