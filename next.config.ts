import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "64mb",
    },
  },
  serverExternalPackages: ["@mastra/core", "@mastra/ai-sdk", "@ast-grep/napi"],
};

export default nextConfig;
