import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@mastra/core", "@mastra/ai-sdk", "@ast-grep/napi"],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  // Enable calling `getCloudflareContext()` in `next dev`.
  // See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}
