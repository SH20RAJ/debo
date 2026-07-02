import { createOpenAI } from "@ai-sdk/openai";
import { defineAgent } from "eve";
import { resolveProvider } from "../src/server/llm/provider";

const cfg = resolveProvider();
if (!cfg) {
  throw new Error("LLM provider not configured. Please set environment variables.");
}

const customOpenAI = createOpenAI({
  baseURL: cfg.baseURL,
  apiKey: cfg.apiKey,
});

const model = customOpenAI.chat(cfg.chatModel);

export default defineAgent({
  model,
});
