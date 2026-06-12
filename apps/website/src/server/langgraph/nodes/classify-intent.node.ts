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

export type IntentCategory = "chitchat" | "general" | "recall" | "connector";

export function fallbackKeywordClassifier(question: string): IntentCategory {
  if (isChitchat(question)) return "chitchat";
  const lower = question.toLowerCase();
  
  // Keyword indicators for connectors
  const connectorKeywords = [
    "email", "gmail", "mail", "calendar", "schedule", "notion", "slack", "github", 
    "drive", "trello", "jira", "discord", "zoom", "salesforce", "hubspot", "connectors"
  ];
  if (connectorKeywords.some(kw => lower.includes(kw))) {
    return "connector";
  }
  
  // Keyword indicators for personal memory recall
  const recallKeywords = [
    "what did", "remember", "did i", "what was", "recall", "journal", "thoughts", "voice note",
    "what happened", "when did", "what was my", "where did", "summarize my", "summary of my"
  ];
  if (recallKeywords.some(kw => lower.includes(kw))) {
    return "recall";
  }
  
  return "general";
}

export async function classifyOrchestrationIntent(question: string): Promise<IntentCategory> {
  // 1. Fast path: greetings/chitchat never retrieve memories or call connectors
  if (isChitchat(question)) {
    return "chitchat";
  }

  // 2. Resolve LLM configuration
  const cfg = resolveProvider();
  if (!cfg) {
    return fallbackKeywordClassifier(question);
  }

  try {
    const llm = new ChatOpenAI({
      model: cfg.chatModel,
      temperature: 0.0,
      maxTokens: 20,
      apiKey: cfg.apiKey,
      configuration: {
        baseURL: cfg.baseURL,
        apiKey: cfg.apiKey,
      },
    });

    const systemPrompt = `You are the intent classifier for a personal memory assistant called Debo.
Debo is connected to the user's private memory graph (journals, voice notes, files) and external apps/connectors (e.g. Gmail, Notion, Slack, GitHub, Google Calendar).

Your job is to classify the user's message into exactly one of these categories:
1. "RECALL": The user is asking to search, recall, or retrieve information from their private personal history, past journals, thoughts, meetings, files, or notes (e.g., "what did I do yesterday", "search my meeting with john", "tell me about my project", "remember my journal").
2. "CONNECTOR": The user is asking to query, fetch, or perform an action on external apps/integrations (Gmail, Google Calendar, Notion, Slack, GitHub, Drive, Trello, Salesforce, etc.) (e.g., "check my latest emails", "can you see my emails", "create a notion page", "post a slack message to general", "check my schedule", "show github issues").
3. "GENERAL": The user is asking a general knowledge question, code generation, creative writing, template, or general explanation that does NOT require private history or external apps (e.g., "write a react component", "how does react router work", "who is the president", "explain gravity").
4. "CHITCHAT": General greeting, small talk, thanks, or simple conversational text (e.g., "hello", "thank you", "nice", "ok").

Respond with exactly one of the words: "RECALL", "CONNECTOR", "GENERAL", or "CHITCHAT".
Do not include any other text, explanation, or punctuation. Output only one word.`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(question),
    ]);

    const ans = (response.content as string).trim().toUpperCase();
    if (ans.includes("RECALL")) return "recall";
    if (ans.includes("CONNECTOR")) return "connector";
    if (ans.includes("GENERAL")) return "general";
    return "chitchat";
  } catch (err) {
    console.error("[classifyOrchestrationIntent] LLM classification failed, falling back to keywords", err);
    return fallbackKeywordClassifier(question);
  }
}
