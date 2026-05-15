/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export ('output: export') was removed so that:
  //   1. middleware.ts can gate /admin/* on Vercel
  //   2. /admin/analytics can fetch from PostHog server side and keep the API key off the client
  //   3. /admin/api/login and /admin/api/logout can set the signed cookie
  //   4. the pre existing app/api/groq/* route handlers now actually run on Vercel
  // Pages that were previously static still get statically rendered automatically.
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  productionBrowserSourceMaps: false,
  distDir: process.env.NEXT_DIST_DIR || '.next'
};

export default nextConfig;
