import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
