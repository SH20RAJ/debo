import "server-only";
import { mastra } from "@/mastra";
import { z } from "zod";

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

  try {
    const agent = mastra.getAgent('deboAnalyst');
    const result = await agent.generate(
      [
        {
          role: 'user',
          content: `Extract durable personal memory from the input. Return a structured object with facts, entities, emotions, and topics.
          
          Input:
          ${value}`,
        },
      ],
      {
        structuredOutput: {
          schema: z.object({
            facts: z.array(z.string()),
            entities: z.array(z.string()),
            emotions: z.array(z.string()),
            topics: z.array(z.string()),
          }),
        },
      }
    );

    if (result.object) {
      return normalizeExtraction(result.object);
    }
  } catch (error) {
    console.warn("Mastra memory extraction failed, using fallback heuristics:", error);
  }

  return fallbackExtract(value);
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeList(values: unknown) {
  if (!Array.isArray(values)) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? normalizeText(value) : ""))
        .filter(Boolean)
    )
  ).slice(0, 12);
}

function normalizeExtraction(value: Partial<ExtractedMemory>): ExtractedMemory {
  return {
    facts: normalizeList(value.facts),
    entities: normalizeList(value.entities),
    emotions: normalizeList(value.emotions),
    topics: normalizeList(value.topics),
  };
}

function parseExtractionResult(raw: string) {
  const trimmed = raw.trim();

  const candidates = [
    trimmed,
    trimmed.replace(/```json|```/g, ""),
    trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as Partial<ExtractedMemory>;
    } catch {
      continue;
    }
  }

  return null;
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
