import "server-only";

export type ExtractedEntities = {
  people: string[];
  topics: string[];
  emotions: string[];
  keyPhrases: string[];
};

const EMOTIONS = [
  "anxious",
  "burned out",
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
];

const TOPICS = [
  "startup",
  "business",
  "product",
  "design",
  "engineering",
  "code",
  "exam",
  "family",
  "relationship",
  "health",
  "fitness",
  "habit",
  "money",
  "career",
  "research",
  "travel",
  "journal",
  "mcp",
  "qdrant",
];

const IGNORED_CAPITALIZED_WORDS = new Set([
  "I",
  "We",
  "My",
  "The",
  "A",
  "An",
  "This",
  "That",
  "Today",
  "Yesterday",
  "Tomorrow",
]);

function normalizePhrase(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => normalizePhrase(value)).filter(Boolean)));
}

export function extractEntities(text: string): ExtractedEntities {
  const normalized = normalizePhrase(text).toLowerCase();
  const original = normalizePhrase(text);

  const people = unique(
    Array.from(original.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g), (match) => match[1])
      .filter((value) => !IGNORED_CAPITALIZED_WORDS.has(value.split(" ")[0] || ""))
      .filter((value) => value.length > 2)
  );

  const topics = unique(TOPICS.filter((topic) => normalized.includes(topic.toLowerCase())));
  const emotions = unique(EMOTIONS.filter((emotion) => normalized.includes(emotion.toLowerCase())));

  const keyPhrases = unique(
    Array.from(
      original.matchAll(/(?:"([^"]{4,80})"|'([^']{4,80})'|\b([A-Za-z][A-Za-z0-9-]{2,}(?:\s+[A-Za-z][A-Za-z0-9-]{2,}){0,3})\b)/g),
      (match) => match[1] || match[2] || match[3]
    )
      .filter((value) => value.length > 5)
      .filter((value) => !IGNORED_CAPITALIZED_WORDS.has(value))
  ).slice(0, 8);

  return {
    people,
    topics,
    emotions,
    keyPhrases,
  };
}

export function summarizeEntities(entities: ExtractedEntities) {
  return [...entities.people, ...entities.topics, ...entities.emotions].slice(0, 6);
}