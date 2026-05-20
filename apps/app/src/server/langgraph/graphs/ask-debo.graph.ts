/**
 * ask-debo.graph.ts — The main Ask Debo LangGraph.
 *
 * Flow: classify intent → retrieve memory → generate answer → build citations
 *
 * This graph is invoked by the /api/ask route and streams SSE events
 * back to the frontend (retrieval_started, source_found, answer_delta, done).
 */

import {
  StateGraph,
  StateSchema,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { classifyIntent } from "../nodes/classify-intent.node";
import { retrieveMemory } from "../nodes/retrieve-memory.node";
import {
  createNvidiaLLM,
  buildSystemPrompt,
  buildCitations,
  computeConfidenceLabel,
} from "../nodes/generate-answer.node";
import type { SourceFound, Citation } from "../schemas/answer.schema";

// ── Graph State ─────────────────────────────────────────────────────────────

const AskDeboState = new StateSchema({
  // Input
  question: z.string(),
  userId: z.string(),
  mode: z.string().default("recall"),

  // Intermediate
  intent: z.string().default("memory_recall"),
  sourcesFound: z.array(z.any()).default([]),
  contextText: z.string().default(""),

  // Output
  answer: z.string().default(""),
  citations: z.array(z.any()).default([]),
  confidence: z.string().default("no_source_found"),
  followUps: z.array(z.string()).default([]),
});

// ── Nodes ───────────────────────────────────────────────────────────────────

/** Node 1: Classify the user's intent */
async function classifyNode(
  state: { question: string }
) {
  const intent = classifyIntent(state.question);
  return { intent };
}

/** Node 2: Retrieve memory sources from DB */
async function retrieveNode(
  state: { userId: string; question: string }
) {
  const { sourcesFound, contextText } = await retrieveMemory(
    state.userId,
    state.question,
    10
  );
  return { sourcesFound, contextText };
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

  // Use LangChain ChatOpenAI with NVIDIA NIM
  const llm = createNvidiaLLM(false); // non-streaming for graph invoke
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

  // Generate follow-up suggestions based on intent
  const followUps = [
    "What tasks are pending from this?",
    "Summarize my recent entries",
  ];

  return { citations, confidence, followUps };
}

// ── Compile Graph ───────────────────────────────────────────────────────────

export const askDeboGraph = new StateGraph(AskDeboState)
  .addNode("classify", classifyNode)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addNode("cite", citeNode)
  .addEdge(START, "classify")
  .addEdge("classify", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "cite")
  .addEdge("cite", END)
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
    sourcesFound: result.sourcesFound as SourceFound[],
    intent: result.intent as string,
  };
}
