import type { SourceFound } from "../schemas/answer.schema";
import type { ActionSuggestion } from "../schemas/action-suggestion.schema";

const DEFAULT_SUGGESTIONS = [
  "What tasks are pending from this?",
  "Summarize my recent entries",
];

export function suggestActionsNode(state: {
  intent: string;
  sourcesFound: SourceFound[];
  answer: string;
}) {
  const suggestions: ActionSuggestion[] = [];

  if (state.sourcesFound.length > 0) {
    suggestions.push({
      id: "summarize_sources",
      label: "Summarize these sources",
      kind: "ask",
      confidence: 0.7,
      reason: "Relevant sources were found.",
    });
  }

  if (state.intent === "task_search" || /\b(task|todo|due|follow up)\b/i.test(state.answer)) {
    suggestions.push({
      id: "review_tasks",
      label: "Review pending tasks",
      kind: "task",
      confidence: 0.65,
      reason: "The request appears task-oriented.",
    });
  }

  if (state.intent === "draft") {
    suggestions.push({
      id: "draft_from_memory",
      label: "Draft from this memory",
      kind: "draft",
      confidence: 0.65,
      reason: "The request asks for composed output.",
    });
  }

  const followUps = suggestions.length > 0
    ? suggestions.map((suggestion) => suggestion.label)
    : DEFAULT_SUGGESTIONS;

  return { actionSuggestions: suggestions, followUps };
}
