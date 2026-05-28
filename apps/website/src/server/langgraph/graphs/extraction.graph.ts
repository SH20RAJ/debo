import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { extractMemoryNode } from "../nodes/extract-memory.node";
import type { ExtractionResult } from "../schemas/extraction.schema";

const ExtractionState = Annotation.Root({
  userId: Annotation<string>(),
  sourceId: Annotation<string | undefined>(),
  text: Annotation<string>(),
  extraction: Annotation<ExtractionResult | undefined>(),
});

export const extractionGraph = new StateGraph(ExtractionState)
  .addNode("extract", extractMemoryNode)
  .addEdge(START, "extract")
  .addEdge("extract", END)
  .compile();

export async function extractMemories(input: {
  userId: string;
  sourceId?: string;
  text: string;
}) {
  const result = await extractionGraph.invoke(input);
  return result.extraction as ExtractionResult;
}
