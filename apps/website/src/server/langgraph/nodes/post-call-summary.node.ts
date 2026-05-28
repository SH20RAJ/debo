import type { PostCallSummary } from "../schemas/post-call-summary.schema";

function linesMatching(text: string, pattern: RegExp) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => pattern.test(line))
    .slice(0, 8);
}

export async function postCallSummaryNode(state: {
  transcript: string;
  title?: string;
}): Promise<{ postCallSummary: PostCallSummary }> {
  const transcript = state.transcript.trim();
  const summary = transcript
    ? transcript.split(/[.!?]\s/).slice(0, 3).join(". ").slice(0, 700)
    : "No transcript content was provided.";

  return {
    postCallSummary: {
      title: state.title || "Call summary",
      summary,
      actionItems: linesMatching(transcript, /\b(action|todo|follow up|owner|due)\b/i),
      decisions: linesMatching(transcript, /\b(decided|decision|agreed|we will)\b/i),
      followUps: linesMatching(transcript, /\b(follow up|next|check in|circle back)\b/i),
    },
  };
}
