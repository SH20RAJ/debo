/**
 * ask-debo.graph.ts — The main Ask Debo LangGraph.
 *
 * Flow: classify intent → retrieve memory → generate answer → build citations
 *
 * This graph is invoked by the /api/ask route and streams SSE events
 * back to the frontend (retrieval_started, source_found, answer_delta, done).
 */

import {
  Annotation,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { classifyIntent } from "../nodes/classify-intent.node";
import { buildContextNode } from "../nodes/build-context.node";
import {
  createNvidiaLLM,
  buildSystemPrompt,
  buildCitations,
  computeConfidenceLabel,
} from "../nodes/generate-answer.node";
import { validateCitationsNode } from "../nodes/validate-citations.node";
import { suggestActionsNode } from "../nodes/suggest-actions.node";
import type { SourceFound, Citation } from "../schemas/answer.schema";
import type { ActionSuggestion } from "../schemas/action-suggestion.schema";
import type { CitationValidation } from "../schemas/citation-validation.schema";

// ── Graph State ─────────────────────────────────────────────────────────────

const AskDeboState = Annotation.Root({
  // Input
  question: Annotation<string>(),
  userId: Annotation<string>(),
  mode: Annotation<string>(),

  // Intermediate
  intent: Annotation<string>(),
  sourcesFound: Annotation<SourceFound[]>(),
  contextText: Annotation<string>(),
  retrievalLimit: Annotation<number | undefined>(),

  // Output
  answer: Annotation<string>(),
  citations: Annotation<Citation[]>(),
  citationValidation: Annotation<CitationValidation | undefined>(),
  confidence: Annotation<string>(),
  followUps: Annotation<string[]>(),
  actionSuggestions: Annotation<ActionSuggestion[]>(),
});

// ── Nodes ───────────────────────────────────────────────────────────────────

/** Node 1: Classify the user's intent */
async function classifyNode(
  state: { question: string }
) {
  const intent = classifyIntent(state.question);
  return { intent };
}

/** Node 3: Generate answer using NVIDIA NIM */
async function generateNode(
  state: {
    question: string;
    contextText: string;
    mode: string;
    intent: string;
    sourcesFound: SourceFound[];
  }
) {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

  // If no API key, return a helpful fallback
  if (!apiKey) {
    const answer = state.sourcesFound.length > 0
      ? `I found ${state.sourcesFound.length} relevant memories including: ${state.sourcesFound.map(s => `"${s.title}"`).join(", ")}. Configure NVIDIA_API_KEY for AI-powered answers.`
      : "No stored memories found. Start capturing journals, voice notes, or connecting apps. Configure NVIDIA_API_KEY for AI answers.";

    return { answer };
  }

  // Use LangChain ChatOpenAI with the resolved provider
  const llm = createNvidiaLLM(false); // non-streaming for graph invoke
  if (!llm) {
    return {
      answer:
        "AI answers are not configured. Set NVIDIA_API_KEY or OPENAI_API_KEY to enable them.",
    };
  }
  const systemPrompt = buildSystemPrompt(state.contextText, state.mode, state.intent);

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(state.question),
  ]);

  return { answer: response.content as string };
}

/** Node 4: Build citations + compute confidence */
async function citeNode(
  state: {
    sourcesFound: SourceFound[];
    answer: string;
  }
) {
  const citations = buildCitations(state.sourcesFound);
  const confidence = computeConfidenceLabel(state.sourcesFound, state.answer);
  return { citations, confidence };
}

// ── Compile Graph ───────────────────────────────────────────────────────────

export const askDeboGraph = new StateGraph(AskDeboState)
  .addNode("classify", classifyNode)
  .addNode("buildContext", buildContextNode)
  .addNode("generate", generateNode)
  .addNode("cite", citeNode)
  .addNode("validateCitations", validateCitationsNode)
  .addNode("suggestActions", suggestActionsNode)
  .addEdge(START, "classify")
  .addEdge("classify", "buildContext")
  .addEdge("buildContext", "generate")
  .addEdge("generate", "cite")
  .addEdge("cite", "validateCitations")
  .addEdge("validateCitations", "suggestActions")
  .addEdge("suggestActions", END)
  .compile();

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Run the Ask Debo graph and return the full result.
 * For streaming, the /api/ask route can also call individual nodes.
 */
export async function askDebo(
  userId: string,
  question: string,
  mode = "recall"
) {
  const result = await askDeboGraph.invoke({
    userId,
    question,
    mode,
  });

  return {
    answer: result.answer as string,
    citations: result.citations as Citation[],
    confidence: result.confidence as string,
    followUps: result.followUps as string[],
    actionSuggestions: result.actionSuggestions as ActionSuggestion[],
    citationValidation: result.citationValidation as CitationValidation | undefined,
    sourcesFound: result.sourcesFound as SourceFound[],
    intent: result.intent as string,
  };
}
