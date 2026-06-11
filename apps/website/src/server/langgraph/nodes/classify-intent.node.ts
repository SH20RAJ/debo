import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { resolveProvider } from "../../llm/provider";

/**
 * Classify the user's question intent.
 * Keyword matching is fast and deterministic; we keep it as the primary path
 * because intent here is mostly used for prompt shaping and analytics, not
 * routing-critical decisions.
 */

const INTENT_KEYWORDS: Record<string, string[]> = {
  memory_recall: [
    "what did", "remember", "did i", "what was", "recall",
    "what happened", "when did", "what was my", "where did",
  ],
  source_summary: ["summarize", "summary", "overview", "all my", "recap", "tldr"],
  task_search: [
    "task", "todo", "to-do", "to do", "deadline", "due", "remind",
    "pending", "what do i need to do", "open loops",
  ],
  person_search: [
    "who is", "person", "contact", "people", "someone", "about",
    "who did", "with whom", "who said",
  ],
  project_search: ["project", "initiative", "working on", "what am i building"],
  planning: [
    "plan", "strategy", "next steps", "roadmap", "schedule",
    "what should i do", "prioritize",
  ],
  draft: ["draft", "write", "compose", "email", "message", "reply"],
  compare: ["compare", "difference", "vs", "versus", "trade off", "trade-off"],
};

export type Intent = keyof typeof INTENT_KEYWORDS | "memory_recall" | "chitchat";

/**
 * Detect plain conversation (greetings, thanks, small talk, capability
 * questions) that should NOT trigger a memory search. This is what lets the
 * user just say "hey" without Debo replying "I searched your memory…".
 */
const CHITCHAT_EXACT = new Set([
  "hi", "hey", "hello", "yo", "sup", "hiya", "heya", "howdy",
  "thanks", "thank you", "ty", "thx", "cool", "nice", "ok", "okay",
  "good morning", "good afternoon", "good evening", "good night",
  "how are you", "how's it going", "hows it going", "what's up", "whats up",
  "who are you", "what are you", "what can you do", "help",
  "bye", "goodbye", "see you", "lol", "haha",
]);

const CHITCHAT_STARTS = [
  "hi ", "hey ", "hello ", "thanks ", "thank you", "good morning",
  "good afternoon", "good evening", "nice to", "how are you",
];

export function isChitchat(question: string): boolean {
  const q = question.trim().toLowerCase().replace(/[!.,?]+$/g, "");
  if (!q) return true;
  if (CHITCHAT_EXACT.has(q)) return true;
  // Short greetings like "hey debo", "hello there"
  if (q.length <= 24 && CHITCHAT_STARTS.some((s) => q.startsWith(s))) return true;
  return false;
}

export function classifyIntent(question: string): Intent {
  if (isChitchat(question)) return "chitchat";
  const lower = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent as Intent;
  }
  return "memory_recall";
}

/**
 * Smart classification to decide if memory search / retrieval should be triggered.
 * Prevents scanning journals for general conversation, general code generation, etc.
 */
export async function classifyRetrievalIntent(question: string): Promise<boolean> {
  // 1. Fast path: greetings/chitchat never retrieve memories
  if (isChitchat(question)) {
    return false;
  }

  // 2. Resolve LLM configuration
  const cfg = resolveProvider();
  if (!cfg) {
    const intent = classifyIntent(question);
    return intent !== "chitchat";
  }

  try {
    const llm = new ChatOpenAI({
      model: cfg.chatModel,
      temperature: 0.0,
      maxTokens: 10,
      apiKey: cfg.apiKey,
      configuration: {
        baseURL: cfg.baseURL,
        apiKey: cfg.apiKey,
      },
    });

    const systemPrompt = `You are an intent classifier for a personal memory assistant called Debo.
Analyze if the user's message is asking to recall, retrieve, or search their private personal history, past journals, notes, meetings, files, or tasks (e.g. "what did I do yesterday", "search my meeting with john", "tell me about my project", "remember my journal", "what was my idea for Apify?").

Respond with exactly "YES" if the message requires searching/retrieving the user's private notes/memories.
Respond with exactly "NO" if the message is a general knowledge question, code generation request, general math, creative writing, template, or general greeting/conversation (e.g. "write a react component", "how does react router work", "who is the president", "explain gravity", "hello", "thank you").

Do not include any other text, punctuation, or formatting. Output only YES or NO.`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(question),
    ]);

    const ans = (response.content as string).trim().toUpperCase();
    return ans.includes("YES");
  } catch (err) {
    console.error("[classifyRetrievalIntent] LLM classification failed, falling back to keywords", err);
    const intent = classifyIntent(question);
    return intent !== "chitchat";
  }
}
