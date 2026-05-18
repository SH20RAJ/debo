import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "64mb",
    },
  },
  serverExternalPackages: ["@mastra/core", "@mastra/ai-sdk", "@ast-grep/napi", "@libsql/client", "libsql", "@mastra/libsql", "xxhash-wasm", "@libsql/isomorphic-ws"],
};

export default nextConfig;
