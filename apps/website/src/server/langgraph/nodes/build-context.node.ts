import { retrieveMemory } from "./retrieve-memory.node";

export async function buildContextNode(state: {
  userId: string;
  question: string;
  intent: string;
  retrievalLimit?: number;
}) {
  if (state.intent === "chitchat") {
    return { sourcesFound: [], contextText: "" };
  }
  const { sourcesFound, contextText } = await retrieveMemory(
    state.userId,
    state.question,
    state.retrievalLimit ?? 10,
  );

  return { sourcesFound, contextText };
}
