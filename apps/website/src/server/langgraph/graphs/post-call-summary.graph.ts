import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { postCallSummaryNode } from "../nodes/post-call-summary.node";
import type { PostCallSummary } from "../schemas/post-call-summary.schema";

const PostCallSummaryState = Annotation.Root({
  userId: Annotation<string>(),
  title: Annotation<string | undefined>(),
  transcript: Annotation<string>(),
  postCallSummary: Annotation<PostCallSummary | undefined>(),
});

export const postCallSummaryGraph = new StateGraph(PostCallSummaryState)
  .addNode("summarizeCall", postCallSummaryNode)
  .addEdge(START, "summarizeCall")
  .addEdge("summarizeCall", END)
  .compile();

export async function summarizeCall(input: {
  userId: string;
  title?: string;
  transcript: string;
}) {
  const result = await postCallSummaryGraph.invoke(input);
  return result.postCallSummary as PostCallSummary;
}
