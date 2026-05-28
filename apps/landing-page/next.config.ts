import type { NextConfig } from "next";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";

// Single source of truth: monorepo root .env.local
loadDotenv({ path: resolve(__dirname, "../../.env.local"), override: false });

const nextConfig: NextConfig = {
  // Note: @opennextjs/cloudflare bundles its own worker output;
  // Next's "standalone" mode is unnecessary and confuses asset paths.
};

export default nextConfig;
