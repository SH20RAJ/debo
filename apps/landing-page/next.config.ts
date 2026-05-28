import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: @opennextjs/cloudflare bundles its own worker output;
  // Next's "standalone" mode is unnecessary and confuses asset paths.
};

export default nextConfig;
