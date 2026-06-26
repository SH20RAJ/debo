import { resolveProvider } from "./src/server/llm/provider";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

async function main() {
  console.log("=== Testing LLM Provider Resolution ===");
  const cfg = resolveProvider();
  if (!cfg) {
    console.error("No LLM provider configured!");
    return;
  }

  console.log("\n=== Testing Normal Chat Generation ===");
  try {
    const customOpenAI = createOpenAI({
      baseURL: cfg.baseURL,
      apiKey: cfg.apiKey,
    });
    const model = customOpenAI.chat(cfg.chatModel);
    const result = await generateText({
      model,
      prompt: "Hello! Who are you?",
    });
    console.log("Response text:", result.text);
  } catch (err: any) {
    console.error("Chat Generation Error:", err.message || err);
  }
}

main().catch(console.error);
