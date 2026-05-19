import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
    system: `You are Debo, a personal intelligence companion. You help users reflect on their life, memories, and journals. Be warm, insightful, and concise.`,
    messages,
  });

  return result.toDataStreamResponse();
}
