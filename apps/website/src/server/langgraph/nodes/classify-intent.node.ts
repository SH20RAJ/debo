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
