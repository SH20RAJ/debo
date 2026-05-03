import "server-only";
import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL =
  process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct";
export const DEFAULT_EMBEDDING_MODEL = 
  process.env.OPENAI_EMBEDDING_MODEL || "nvidia/nv-embedqa-e5-v5";

/**
 * Helper to dynamically get the API key and Base URL per-request.
 */
function getEnv() {
  let key = process.env.OPENAI_API_KEY || process.env.CF_AIG_TOKEN;
  let base = process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";

  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env) {
      if (ctx.env.OPENAI_API_KEY) key = ctx.env.OPENAI_API_KEY;
      if (ctx.env.CF_AIG_TOKEN) key = ctx.env.CF_AIG_TOKEN;
      if (ctx.env.OPENAI_BASE_URL) base = ctx.env.OPENAI_BASE_URL;
    }
  } catch (e) {
    // Ignore if not in Cloudflare context
  }

  // Fallback to manual parsing if we are in node and process.env is missing it
  if (!key) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envs = ['.env.local', '.env', '.dev.vars'];
      for (const e of envs) {
        const p = path.resolve(process.cwd(), e);
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8');
          const mKey = content.match(/OPENAI_API_KEY\s*=\s*["']?([^"'\s]+)["']?/);
          const mBase = content.match(/OPENAI_BASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
          if (mKey) key = mKey[1];
          if (mBase) base = mBase[1];
          if (key) break;
        }
      }
    } catch (err) {}
  }

  return { key, base };
}

/**
 * Vercel AI SDK Provider
 * Allows dynamically resolving env variables at request time.
 */
export const aiProvider = createOpenAI({
  apiKey: "DUMMY_KEY", // Will be overridden in fetch
  baseURL: "DUMMY_BASE_URL", // Will be overridden in fetch
  fetch: async (url, options) => {
    const { key, base } = getEnv();

    let finalUrl = url.toString();
    // Vercel AI SDK builds the url as DUMMY_BASE_URL/chat/completions
    if (finalUrl.startsWith("DUMMY_BASE_URL") && base) {
      finalUrl = finalUrl.replace("DUMMY_BASE_URL", base);
    }

    // Set Authorization header
    const headers = new Headers(options?.headers);
    if (key) {
      headers.set("Authorization", `Bearer ${key}`);
    }

    console.log("DEBUG AI SDK FETCH URL:", finalUrl);

    return fetch(finalUrl, {
      ...options,
      headers
    });
  }
});

export function getChatModel() {
  return aiProvider.chat(DEFAULT_CHAT_MODEL);
}

export function getEmbeddingModel() {
  return aiProvider.embedding(DEFAULT_EMBEDDING_MODEL);
}

export function getEmbeddingModelId() {
  return DEFAULT_EMBEDDING_MODEL;
}
