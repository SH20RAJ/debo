import type { NextConfig } from "next";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";
import { withEve } from "eve/next";

// Single source of truth: monorepo root .env.local
loadDotenv({ path: resolve(__dirname, "../../.env.local"), override: false });

const nextConfig: NextConfig = {
  // Deployed on Vercel (Node runtime). Do NOT deploy as a Cloudflare Worker —
  // LangChain/LangGraph + Neon + AI SDK exceed Worker bundle limits.
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: [
    "@neondatabase/serverless",
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
  ],
};

export default withEve(nextConfig);
