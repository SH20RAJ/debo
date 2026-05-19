/**
 * Citation builder for the memory engine.
 *
 * Citations link answers back to source chunks.
 * Every citation includes source_id for traceability.
 */

export type Citation = {
  id: string;
  sourceId: string;
  sourceType: string;
  title?: string;
  content: string;
  snippet: string;
  heading?: string;
  timestamp?: string;
  pageNumber?: number;
  chunkIndex?: number;
  relevanceScore: number;
  url?: string;
};

export type CitationInput = {
  chunkId: string;
  sourceId: string;
  content: string;
  sourceType: string;
  title?: string;
  heading?: string;
  timestamp?: string;
  pageNumber?: number;
  chunkIndex?: number;
  relevanceScore?: number;
  url?: string;
};

/**
 * Build a citation from a chunk and its source metadata.
 *
 * Always includes source_id for traceability.
 */
export function buildCitation(input: CitationInput): Citation {
  return {
    id: input.chunkId,
    sourceId: input.sourceId,
    sourceType: input.sourceType,
    title: input.title,
    content: input.content,
    snippet: createSnippet(input.content),
    heading: input.heading,
    timestamp: input.timestamp,
    pageNumber: input.pageNumber,
    chunkIndex: input.chunkIndex,
    relevanceScore: input.relevanceScore ?? 0.5,
    url: input.url,
  };
}

/**
 * Validate that a citation has all required fields.
 */
export function validateCitation(citation: unknown): citation is Citation {
  if (!citation || typeof citation !== "object") return false;

  const c = citation as Record<string, unknown>;

  return (
    typeof c.id === "string" &&
    c.id.length > 0 &&
    typeof c.sourceId === "string" &&
    c.sourceId.length > 0 &&
    typeof c.sourceType === "string" &&
    c.sourceType.length > 0 &&
    typeof c.content === "string" &&
    c.content.length > 0 &&
    typeof c.snippet === "string" &&
    c.snippet.length > 0
  );
}

/**
 * Format a citation for display in the UI.
 *
 * Returns a formatted string with source info and snippet.
 */
export function formatCitationForDisplay(citation: Citation): string {
  const parts: string[] = [];

  // Source type badge
  const typeLabel = formatSourceType(citation.sourceType);
  parts.push(`[${typeLabel}]`);

  // Title
  if (citation.title) {
    parts.push(citation.title);
  }

  // Location info
  const location: string[] = [];
  if (citation.heading) {
    location.push(citation.heading);
  }
  if (citation.pageNumber) {
    location.push(`p.${citation.pageNumber}`);
  }
  if (citation.timestamp) {
    location.push(`@${citation.timestamp}`);
  }

  if (location.length > 0) {
    parts.push(`(${location.join(", ")})`);
  }

  // Snippet
  parts.push(`"${citation.snippet}"`);

  return parts.join(" ");
}

/**
 * Format a citation as a structured object for UI components.
 */
export function formatCitationForUI(citation: Citation): {
  label: string;
  detail: string;
  badge: string;
  location?: string;
  snippet: string;
} {
  const location = [
    citation.heading,
    citation.pageNumber ? `Page ${citation.pageNumber}` : undefined,
    citation.timestamp,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    label: citation.title || citation.sourceType,
    detail: citation.sourceId,
    badge: formatSourceType(citation.sourceType),
    location: location || undefined,
    snippet: citation.snippet,
  };
}

/**
 * Create a snippet from content, truncated to a reasonable length.
 */
function createSnippet(content: string, maxLength = 280): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  // Try to break at a sentence boundary
  const truncated = normalized.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclaim = truncated.lastIndexOf("!");
  const breakPoint = Math.max(lastPeriod, lastQuestion, lastExclaim);

  if (breakPoint > maxLength * 0.5) {
    return truncated.slice(0, breakPoint + 1);
  }

  return `${truncated.slice(0, maxLength - 1).trim()}...`;
}

function formatSourceType(type: string): string {
  const labels: Record<string, string> = {
    journal: "Journal",
    voice: "Voice Note",
    document: "Document",
    email: "Email",
    link: "Link",
    manual: "Manual",
    transcript: "Transcript",
  };

  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}
