/**
 * classify-intent.node.ts — Classifies the user's question intent.
 * Uses keyword matching (cheap) with LLM fallback for ambiguous queries.
 */

const INTENT_KEYWORDS: Record<string, string[]> = {
  memory_recall: ["what did", "remember", "did i", "what was", "recall", "what happened", "when did"],
  source_summary: ["summarize", "summary", "overview", "all my", "recap"],
  task_search: ["task", "todo", "to-do", "deadline", "due", "remind", "pending"],
  person_search: ["who is", "person", "contact", "people", "someone", "about"],
  project_search: ["project", "initiative", "working on"],
  planning: ["plan", "strategy", "next steps", "roadmap", "schedule"],
  draft: ["draft", "write", "compose", "email", "message"],
  compare: ["compare", "difference", "vs", "versus"],
};

export function classifyIntent(question: string): string {
  const lower = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return "memory_recall"; // default
}
