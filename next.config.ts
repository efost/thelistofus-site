import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone, so the Droplet only needs Node to run
  // it (no npm install there). See .github/workflows/deploy.yml.
  output: "standalone",
  // The link-preview images read these at runtime.
  outputFileTracingIncludes: {
    "/**/*": ["./fonts/**/*", "./public/app-icon-512.png"],
  },
};

export default nextConfig;
