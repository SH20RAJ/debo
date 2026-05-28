import { retrieveMemory } from "./retrieve-memory.node";

export async function buildContextNode(state: {
  userId: string;
  question: string;
  retrievalLimit?: number;
}) {
  const { sourcesFound, contextText } = await retrieveMemory(
    state.userId,
    state.question,
    state.retrievalLimit ?? 10,
  );

  return { sourcesFound, contextText };
}
