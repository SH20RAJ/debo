/**
 * Memory extraction using NVIDIA NIM (OpenAI-compatible API).
 *
 * Extracts structured memory items, entities, and people from raw text.
 * Uses meta/llama-3.3-70b-instruct via https://integrate.api.nvidia.com/v1
 *
 * Per backend.md section 8.9 / 11.6 / 11.7:
 * - memory_items types: fact, preference, task_hint, decision, idea, promise, reminder, summary
 * - entity types: person, project, company, date, topic, file, url, location, product
 * - people: name, aliases, relationship, company, role, notes
 */

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_MODEL = "meta/llama-3.3-70b-instruct";
const PROMPT_VERSION = "v1";

// ── Types matching DB schema ────────────────────────────────────────────────

export type MemoryItemType =
  | "fact"
  | "preference"
  | "task_hint"
  | "decision"
  | "idea"
  | "promise"
  | "reminder"
  | "summary";

export type EntityType =
  | "person"
  | "project"
  | "company"
  | "date"
  | "topic"
  | "file"
  | "url"
  | "location"
  | "product";

export type ExtractedItem = {
  type: MemoryItemType;
  title: string;
  content: string;
  confidence: number;
  importance: "low" | "medium" | "high";
  reviewStatus: "auto_saved" | "needs_review";
};

export type ExtractedEntity = {
  type: EntityType;
  value: string;
  normalizedValue: string;
  confidence: number;
};

export type ExtractedPerson = {
  name: string;
  aliases: string[];
  relationship: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
};

// ── NIM client ──────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing NVIDIA_API_KEY or OPENAI_API_KEY");
  return key;
}

async function callNim(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(NIM_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: NIM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NIM API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content ?? "{}";
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function clampConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : 0.7;
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}

function normalizeEntity(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    // Handle markdown code fences the model may wrap around JSON
    const cleaned = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// ── Prompt templates ────────────────────────────────────────────────────────

const MEMORY_ITEMS_SYSTEM = `You are a memory extraction engine. Given raw text, extract structured memory items.

Return a JSON object with a single key "items" containing an array. Each item has:
- "type": one of "fact", "preference", "task_hint", "decision", "idea", "promise", "reminder", "summary"
- "title": short title (max 100 chars)
- "content": the extracted content
- "confidence": 0.0-1.0
- "importance": "low", "medium", or "high"
- "needs_review": boolean, true if the extraction is uncertain

Guidelines:
- "fact": objective statements or information the user stated
- "preference": things the user likes, dislikes, or prefers
- "task_hint": implied tasks, to-dos, or action items (not full task records)
- "decision": conclusions or choices the user made
- "idea": creative thoughts, brainstorm items, or proposals
- "promise": commitments the user made to someone
- "reminder": time-sensitive items, deadlines, scheduled events
- "summary": a 1-2 sentence summary of the overall text

Extract 1-15 items. Prefer quality over quantity. Set confidence < 0.6 for ambiguous items.
Always include exactly one "summary" item.`;

const ENTITIES_SYSTEM = `You are an entity extraction engine. Given raw text, extract named entities.

Return a JSON object with a single key "entities" containing an array. Each entity has:
- "type": one of "person", "project", "company", "date", "topic", "file", "url", "location", "product"
- "value": the entity as it appears in text
- "confidence": 0.0-1.0

Guidelines:
- "person": real people mentioned by name
- "project": project names, product names, initiatives
- "company": organizations, businesses, teams
- "date": specific dates, deadlines, time references
- "topic": subject matters, technologies, domains
- "file": filenames, documents
- "url": URLs, links
- "location": places, cities, countries, addresses
- "product": software products, services, tools

Extract 1-20 entities. Skip generic words. Only include actual named entities.`;

const PEOPLE_SYSTEM = `You are a people extraction engine. Given raw text, extract information about people mentioned.

Return a JSON object with a single key "people" containing an array. Each person has:
- "name": full name as mentioned
- "aliases": array of other names/nicknames used (empty array if none)
- "relationship": their relationship to the user (e.g., "colleague", "friend", "client", "boss", null if unknown)
- "company": their company or organization (null if not mentioned)
- "role": their job title or role (null if not mentioned)
- "notes": brief context about this person from the text (null if nothing notable)

Only extract real people. Do not extract the user themselves unless they refer to themselves by name.
Extract 0-15 people. If no people are mentioned, return an empty array.`;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Extract structured memory items from raw text.
 * Returns items matching the memory_items DB schema types.
 */
export async function extractMemoryItems(
  text: string,
  sourceId: string,
): Promise<ExtractedItem[]> {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length < 20) {
    return [
      {
        type: "summary",
        title: "Short input",
        content: normalized.slice(0, 200),
        confidence: 0.5,
        importance: "low",
        reviewStatus: "auto_saved",
      },
    ];
  }

  const raw = await callNim(MEMORY_ITEMS_SYSTEM, `Extract memory items from this text:\n\n${normalized}`);
  const parsed = safeJsonParse<{ items?: unknown[] }>(raw, { items: [] });
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  return items
    .filter((i): i is Record<string, unknown> => typeof i === "object" && i !== null)
    .map((item) => ({
      type: validateItemType(item.type),
      title: String(item.title ?? "").slice(0, 200),
      content: String(item.content ?? "").slice(0, 2000),
      confidence: clampConfidence(item.confidence),
      importance: validateImportance(item.importance),
      reviewStatus: item.needs_review === true ? "needs_review" as const : "auto_saved" as const,
    }))
    .filter((i) => i.content.length > 0);
}

/**
 * Extract named entities from raw text.
 * Returns entities matching the entities DB schema types.
 */
export async function extractEntities(
  text: string,
  sourceId: string,
): Promise<ExtractedEntity[]> {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length < 20) return [];

  const raw = await callNim(ENTITIES_SYSTEM, `Extract entities from this text:\n\n${normalized}`);
  const parsed = safeJsonParse<{ entities?: unknown[] }>(raw, { entities: [] });
  const entities = Array.isArray(parsed.entities) ? parsed.entities : [];

  return entities
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .map((entity) => {
      const value = String(entity.value ?? "").trim();
      return {
        type: validateEntityType(entity.type),
        value: value.slice(0, 500),
        normalizedValue: normalizeEntity(value).slice(0, 500),
        confidence: clampConfidence(entity.confidence),
      };
    })
    .filter((e) => e.value.length > 0);
}

/**
 * Extract people from raw text.
 * Returns person records matching the people DB schema.
 */
export async function extractPeople(
  text: string,
  sourceId: string,
): Promise<ExtractedPerson[]> {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length < 20) return [];

  const raw = await callNim(PEOPLE_SYSTEM, `Extract people mentioned in this text:\n\n${normalized}`);
  const parsed = safeJsonParse<{ people?: unknown[] }>(raw, { people: [] });
  const people = Array.isArray(parsed.people) ? parsed.people : [];

  return people
    .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
    .map((person) => ({
      name: String(person.name ?? "").trim().slice(0, 200),
      aliases: Array.isArray(person.aliases)
        ? person.aliases.map((a: unknown) => String(a).trim()).filter(Boolean)
        : [],
      relationship: person.relationship ? String(person.relationship).slice(0, 100) : null,
      company: person.company ? String(person.company).slice(0, 200) : null,
      role: person.role ? String(person.role).slice(0, 200) : null,
      notes: person.notes ? String(person.notes).slice(0, 500) : null,
    }))
    .filter((p) => p.name.length > 0);
}

// ── Validators ──────────────────────────────────────────────────────────────

const VALID_ITEM_TYPES: MemoryItemType[] = [
  "fact", "preference", "task_hint", "decision", "idea", "promise", "reminder", "summary",
];

const VALID_ENTITY_TYPES: EntityType[] = [
  "person", "project", "company", "date", "topic", "file", "url", "location", "product",
];

function validateItemType(v: unknown): MemoryItemType {
  return VALID_ITEM_TYPES.includes(v as MemoryItemType) ? (v as MemoryItemType) : "fact";
}

function validateEntityType(v: unknown): EntityType {
  return VALID_ENTITY_TYPES.includes(v as EntityType) ? (v as EntityType) : "topic";
}

function validateImportance(v: unknown): "low" | "medium" | "high" {
  if (v === "low" || v === "medium" || v === "high") return v;
  return "medium";
}
