/**
 * Memory extraction for the memory engine.
 *
 * Currently stubbed — returns mock extracted data.
 * Real AI integration will be added later.
 *
 * Per backend.md section 11.6, the extractor should identify:
 * - facts, promises, tasks, decisions, preferences, ideas, dates, risks, follow-ups
 *
 * Per backend.md section 11.7, entities include:
 * - people, projects, companies, tools, locations
 */

export type ExtractedFact = {
  content: string;
  type: "fact" | "promise" | "task" | "decision" | "preference" | "idea" | "date" | "risk" | "follow-up";
  confidence: number;
};

export type ExtractedEntity = {
  name: string;
  type: "person" | "project" | "company" | "tool" | "location" | "topic";
  confidence: number;
};

export type ExtractionResult = {
  facts: ExtractedFact[];
  entities: ExtractedEntity[];
  summary: string;
};

/**
 * Extract memory items from text.
 *
 * STUB: Returns mock data based on simple keyword matching.
 * Will be replaced with real AI extraction later.
 */
export async function extractMemoryItems(
  text: string,
  sourceId: string
): Promise<ExtractionResult> {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return { facts: [], entities: [], summary: "" };
  }

  const facts = stubExtractFacts(normalized);
  const entities = stubExtractEntities(normalized);
  const summary = stubSummarize(normalized);

  return { facts, entities, summary };
}

/**
 * Extract entities from text.
 *
 * STUB: Simple pattern matching for capitalized words.
 * Will be replaced with NER later.
 */
export async function extractEntities(
  text: string,
  sourceId: string
): Promise<ExtractedEntity[]> {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  return stubExtractEntities(normalized);
}

// -- Stub implementations --

function stubExtractFacts(text: string): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  const lower = text.toLowerCase();

  // Task patterns
  const taskPatterns = [
    /(?:need to|have to|must|should|todo|task:)\s+([^.!?]{5,100})/gi,
    /(?:i'll|i will|going to|plan to)\s+([^.!?]{5,100})/gi,
  ];

  for (const pattern of taskPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      facts.push({
        content: match[1].trim(),
        type: "task",
        confidence: 0.6,
      });
    }
  }

  // Decision patterns
  const decisionPatterns = [
    /(?:decided|chose|picked|went with|agreed to)\s+([^.!?]{5,100})/gi,
    /(?:decision:|we decided)\s+([^.!?]{5,100})/gi,
  ];

  for (const pattern of decisionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      facts.push({
        content: match[1].trim(),
        type: "decision",
        confidence: 0.6,
      });
    }
  }

  // Preference patterns
  if (/(?:prefer|like|love|enjoy|favorite)/i.test(lower)) {
    const prefMatch = text.match(/(?:i prefer|i like|i love|i enjoy|my favorite)\s+([^.!?]{5,100})/i);
    if (prefMatch) {
      facts.push({
        content: prefMatch[1].trim(),
        type: "preference",
        confidence: 0.5,
      });
    }
  }

  // If no facts found, create a general fact from the first sentence
  if (facts.length === 0) {
    const firstSentence = text.split(/(?<=[.!?])\s/)[0]?.trim();
    if (firstSentence && firstSentence.length > 10) {
      facts.push({
        content: firstSentence.slice(0, 200),
        type: "fact",
        confidence: 0.3,
      });
    }
  }

  return facts.slice(0, 10);
}

function stubExtractEntities(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  // People: capitalized words that look like names
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g;
  const stopwords = new Set([
    "I", "We", "My", "The", "A", "An", "Today", "Yesterday", "Tomorrow",
    "This", "That", "These", "Those", "Here", "There", "What", "When",
    "Where", "How", "Why", "Who", "Which", "But", "And", "Or", "So",
    "If", "Then", "Than", "Just", "Also", "Very", "Really", "Maybe",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
  ]);

  let match;
  while ((match = namePattern.exec(text)) !== null) {
    const name = match[1].trim();
    const firstWord = name.split(" ")[0];

    if (firstWord && !stopwords.has(firstWord) && name.length > 2 && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      entities.push({
        name,
        type: "person",
        confidence: 0.4,
      });
    }
  }

  // Topics: common topic keywords
  const topicKeywords = [
    "startup", "product", "design", "engineering", "health", "fitness",
    "money", "career", "travel", "research", "database", "memory",
    "ai", "machine learning", "backend", "frontend", "api", "deploy",
  ];

  const lower = text.toLowerCase();
  for (const topic of topicKeywords) {
    if (lower.includes(topic) && !seen.has(topic)) {
      seen.add(topic);
      entities.push({
        name: topic,
        type: "topic",
        confidence: 0.5,
      });
    }
  }

  return entities.slice(0, 12);
}

function stubSummarize(text: string): string {
  // Take first 1-2 sentences as summary
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const summary = sentences.slice(0, 2).join(" ");

  if (summary.length > 300) {
    return summary.slice(0, 297) + "...";
  }

  return summary || text.slice(0, 200);
}
