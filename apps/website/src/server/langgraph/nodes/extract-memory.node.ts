import type { ExtractionResult } from "../schemas/extraction.schema";

const TASK_PATTERN = /\b(need to|todo|to-do|follow up|remind me to|deadline)\b/i;
const DECISION_PATTERN = /\b(decided|decision|we will|i will|agreed)\b/i;
const PREFERENCE_PATTERN = /\b(i prefer|i like|i dislike|favorite|works best)\b/i;

function firstSentence(text: string) {
  return text.split(/[.!?]\s/)[0]?.trim() || text.slice(0, 120).trim();
}

export async function extractMemoryNode(state: {
  sourceId?: string;
  text: string;
}): Promise<{ extraction: ExtractionResult }> {
  const text = state.text.trim();
  if (!text) {
    return {
      extraction: {
        memories: [],
        summary: "",
        needsReview: true,
      },
    };
  }

  const memories: ExtractionResult["memories"] = [];
  const title = firstSentence(text).slice(0, 80);

  if (TASK_PATTERN.test(text)) {
    memories.push({
      type: "task_hint",
      title: title || "Possible task",
      content: text.slice(0, 500),
      confidence: 0.45,
      sourceId: state.sourceId,
    });
  }

  if (DECISION_PATTERN.test(text)) {
    memories.push({
      type: "decision",
      title: title || "Possible decision",
      content: text.slice(0, 500),
      confidence: 0.45,
      sourceId: state.sourceId,
    });
  }

  if (PREFERENCE_PATTERN.test(text)) {
    memories.push({
      type: "preference",
      title: title || "Possible preference",
      content: text.slice(0, 500),
      confidence: 0.4,
      sourceId: state.sourceId,
    });
  }

  if (memories.length === 0) {
    memories.push({
      type: "summary",
      title: title || "Memory summary",
      content: text.slice(0, 500),
      confidence: 0.35,
      sourceId: state.sourceId,
    });
  }

  return {
    extraction: {
      memories,
      summary: firstSentence(text),
      needsReview: true,
    },
  };
}
