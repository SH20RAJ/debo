import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deploy on Netlify/Vercel/Railway Node runtime — NOT Cloudflare Worker
  // LangChain/LangGraph + Neon + AI SDK are too heavy for CF Worker bundle limits
  // NOTE: do not use `output: "standalone"` — @netlify/plugin-nextjs needs the
  // default Next.js build output to wire up routes and functions correctly.
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: [
    "@neondatabase/serverless",
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
  ],
};

export default nextConfig;
