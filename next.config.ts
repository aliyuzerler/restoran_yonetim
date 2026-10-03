import type { NextConfig } from "next";

// When NEXT_PUBLIC_STATIC_EXPORT=true, produce a static export (./out)
// suitable for GitHub Pages. Otherwise use standalone output for the
// self-hosted dev server.
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  // GitHub Pages serves from https://user.github.io/repo/ — set basePath
  // accordingly. For a custom domain or user/org page, leave empty.
  // Example: basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // Generate trailing slashes for GitHub Pages compatibility
  trailingSlash: isStaticExport,
  // images: static export can't use the Next.js image optimizer
  images: isStaticExport
    ? {
        unoptimized: true,
      }
    : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
