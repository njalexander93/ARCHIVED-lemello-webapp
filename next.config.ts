import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Partial Prerendering for instant load UX
  cacheComponents: true,
  // Standalone output for Docker deployment
  output: "standalone",
};

export default nextConfig;
