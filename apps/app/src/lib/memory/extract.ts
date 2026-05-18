import "server-only";

export type ExtractedMemory = {
  facts: string[];
  entities: string[];
  emotions: string[];
  topics: string[];
};

const EMOTIONS = [
  "anxious",
  "calm",
  "confident",
  "curious",
  "excited",
  "frustrated",
  "focused",
  "grateful",
  "hopeful",
  "motivated",
  "overwhelmed",
  "peaceful",
  "stressed",
  "tired",
  "worried",
  "burned out",
  "joyful",
];

const TOPICS = [
  "startup",
  "product",
  "design",
  "engineering",
  "school",
  "exam",
  "family",
  "relationship",
  "health",
  "fitness",
  "habit",
  "money",
  "career",
  "travel",
  "writing",
  "research",
  "qdrant",
  "database",
  "journal",
  "memory",
  "debо",
];

const FACT_PATTERNS = [
  /\b(?:i am|i'm|im)\s+([^.!?]{3,120})/i,
  /\b(?:i work on|i'm working on|i am building)\s+([^.!?]{3,120})/i,
  /\b(?:i feel|i'm feeling|i felt)\s+([^.!?]{3,120})/i,
  /\b(?:i live in|i moved to|i own|i have)\s+([^.!?]{3,120})/i,
];

export async function extractMemory(text: string): Promise<ExtractedMemory> {
  const value = normalizeText(text);

  if (!value) {
    return {
      facts: [],
      entities: [],
      emotions: [],
      topics: [],
    };
  }

  return fallbackExtract(value);
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function fallbackExtract(text: string): ExtractedMemory {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const facts = Array.from(
    new Set(
      sentences
        .flatMap((sentence) => FACT_PATTERNS.map((pattern) => sentence.match(pattern)?.[1]).filter(Boolean) as string[])
        .map((value) => value.replace(/\s+/g, " ").trim())
        .filter((value) => value.length >= 4)
        .map((value) => value.replace(/^[a-z]/, (char) => char.toLowerCase()))
    )
  ).slice(0, 8);

  const lower = text.toLowerCase();
  const emotions = uniqueMatch(lower, EMOTIONS);
  const topics = uniqueMatch(lower, TOPICS);
  const entities = uniqueEntities(text);

  return {
    facts: facts.length > 0 ? facts : [sentenceSummary(sentences)],
    entities,
    emotions,
    topics,
  };
}

function uniqueMatch(text: string, candidates: string[]) {
  return Array.from(new Set(candidates.filter((candidate) => text.includes(candidate.toLowerCase())))).slice(0, 8);
}

function uniqueEntities(text: string) {
  const stopwords = new Set(["I", "We", "My", "The", "A", "An", "Today", "Yesterday", "Tomorrow"]);
  const matches = Array.from(text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g), (match) => match[1])
    .filter((value) => !stopwords.has(value.split(" ")[0] || ""));

  return Array.from(new Set(matches)).slice(0, 8);
}

function sentenceSummary(sentences: string[]) {
  return sentences.slice(0, 2).join(" ").trim() || "User shared a new memory.";
}
