import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod/v3";
import { retrieveMemory } from "../nodes/retrieve-memory.node";

const memoryRetrievalSchema = z.object({
  query: z.string().describe("The user question or search phrase."),
  limit: z.number().min(1).max(20).default(10),
});

type MemoryRetrievalInput = z.infer<typeof memoryRetrievalSchema>;

export function createMemoryRetrievalTool(userId: string): StructuredToolInterface {
  return new DynamicStructuredTool({
    name: "retrieve_memory",
    description: "Retrieve source-backed memory snippets for the authenticated user.",
    schema: memoryRetrievalSchema as any,
    func: async ({ query, limit }: MemoryRetrievalInput) =>
      retrieveMemory(userId, query, limit ?? 10),
  });
}
