import "server-only";

import { extractEntities } from "@/lib/ai/extract";

import { displayCharacterName, isLikelyPersonName, normalizeCharacterName } from "./normalize";

export type CharacterMention = {
  name: string;
  normalizedName: string;
  aliases: string[];
  relationship?: string;
  excerpt: string;
};

const RELATION_PATTERNS = [
  /\bmy\s+(friend|best friend|partner|girlfriend|boyfriend|wife|husband|brother|sister|mother|mom|father|dad|cousin|mentor|teacher|manager|boss|cofounder|co-founder|teammate|colleague|client|investor|doctor|therapist)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g,
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+is\s+my\s+(friend|best friend|partner|girlfriend|boyfriend|wife|husband|brother|sister|mother|mom|father|dad|cousin|mentor|teacher|manager|boss|cofounder|co-founder|teammate|colleague|client|investor|doctor|therapist)\b/g,
  /\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+(?:from|at)\s+([^.!?]{3,60})/g,
];

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function makeExcerpt(text: string, name: string) {
  const sentences = splitSentences(text);
  const lowerName = name.toLowerCase();
  const sentence = sentences.find((item) => item.toLowerCase().includes(lowerName)) || sentences[0] || text;
  return sentence.replace(/\s+/g, " ").trim().slice(0, 420);
}

function relationshipFromText(text: string, name: string) {
  const normalizedName = normalizeCharacterName(name);

  for (const pattern of RELATION_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const first = match[1] || "";
      const second = match[2] || "";
      const firstIsName = normalizeCharacterName(first) === normalizedName;
      const secondIsName = normalizeCharacterName(second) === normalizedName;

      if (pattern.source.startsWith("\\bmy") && secondIsName) return first.replace(/-/g, " ");
      if (firstIsName) return second.replace(/-/g, " ");
      if (firstIsName || secondIsName) return "mentioned contact";
    }
  }

  if (/\bteam|work|office|client|meeting|call|project|hiring|manager|founder\b/i.test(text)) {
    return "work contact";
  }

  if (/\bfamily|home|mom|dad|brother|sister|cousin|parent\b/i.test(text)) {
    return "family";
  }

  return undefined;
}

export function extractCharacterMentions(text: string, title?: string | null): CharacterMention[] {
  const sourceText = [title, text].filter(Boolean).join(". ").replace(/\s+/g, " ").trim();
  if (!sourceText) return [];

  const entities = extractEntities(sourceText);
  const candidates = new Set<string>(entities.people);

  for (const pattern of RELATION_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of sourceText.matchAll(pattern)) {
      const relationMatchName = pattern.source.startsWith("\\bmy") ? match[2] : match[1];
      if (relationMatchName) candidates.add(relationMatchName);
    }
  }

  const byName = new Map<string, CharacterMention>();

  for (const rawName of candidates) {
    if (!isLikelyPersonName(rawName)) continue;
    const name = displayCharacterName(rawName);
    const normalizedName = normalizeCharacterName(name);
    if (!normalizedName) continue;

    const existing = byName.get(normalizedName);
    const relationship = relationshipFromText(sourceText, name);
    const mention: CharacterMention = {
      name,
      normalizedName,
      aliases: [name],
      relationship,
      excerpt: makeExcerpt(sourceText, name),
    };

    byName.set(normalizedName, {
      ...mention,
      aliases: Array.from(new Set([...(existing?.aliases || []), name])),
      relationship: existing?.relationship || mention.relationship,
      excerpt: existing?.excerpt || mention.excerpt,
    });
  }

  return Array.from(byName.values()).slice(0, 12);
}

export function composeCharacterSummary(name: string, referenceCount: number, latestExcerpt?: string) {
  if (latestExcerpt) {
    return `${name} appears in ${referenceCount} saved reference${referenceCount === 1 ? "" : "s"}. Latest context: ${latestExcerpt}`;
  }

  return `${name} is a person mentioned in your Debo memory graph. Add context here as you learn more.`;
}
