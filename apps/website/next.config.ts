import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed on Vercel (Node runtime). Do NOT deploy as a Cloudflare Worker —
  // LangChain/LangGraph + Neon + AI SDK exceed Worker bundle limits.
  // Vercel auto-detects Next.js, so we keep the default build output (no `output: "standalone"`).
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: [
    "@neondatabase/serverless",
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
  ],
};

export default nextConfig;
