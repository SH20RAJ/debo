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

export type Intent = keyof typeof INTENT_KEYWORDS | "memory_recall";

export function classifyIntent(question: string): Intent {
  const lower = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent as Intent;
  }
  return "memory_recall";
}
