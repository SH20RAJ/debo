import type { Citation, SourceFound } from "../schemas/answer.schema";

export function validateCitationsNode(state: {
  citations: Citation[];
  sourcesFound: SourceFound[];
}) {
  const sourceIds = new Set(state.sourcesFound.map((source) => source.id));
  const warnings: string[] = [];
  const citations = state.citations.filter((citation) => {
    const isValid = sourceIds.has(citation.sourceId);
    if (!isValid) warnings.push(`Dropped citation for unknown source ${citation.sourceId}`);
    return isValid;
  });

  for (const citation of citations) {
    if (!citation.snippet.trim()) {
      warnings.push(`Citation ${citation.id} has an empty snippet`);
    }
  }

  return {
    citations,
    citationValidation: {
      valid: warnings.length === 0,
      warnings,
    },
  };
}
