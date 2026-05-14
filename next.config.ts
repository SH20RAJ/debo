import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@mastra/core", "@mastra/ai-sdk", "@ast-grep/napi"],
};

export default nextConfig;
