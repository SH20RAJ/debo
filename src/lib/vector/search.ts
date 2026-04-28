import "server-only";

import { db } from "@/db";
import { journals } from "@/db/schema";
import { embed } from "@/lib/ai/embeddings";
import {
  deleteVector,
  searchVector as searchQdrantVector,
  upsertVector,
  type QdrantMatch,
} from "@/lib/vector/qdrant";
import { and, desc, eq, gte, inArray } from "drizzle-orm";

export type CitationSource = {
  id: string;
  sourceType: "journal" | "memory";
  content: string;
  snippet: string;
  date?: string;
  title?: string | null;
  journalId?: string;
  score?: number;
  source?: string;
};

type JournalForIndex = {
  id: string;
  userId: string;
  title?: string | null;
  content: string;
  createdAt: Date | string;
};

export function createSnippet(content: string, maxLength = 320) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function toDateString(value: Date | string | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function citationFromJournal(
  journal: JournalForIndex,
  match?: QdrantMatch
): CitationSource {
  return {
    id: journal.id,
    sourceType: "journal",
    journalId: journal.id,
    title: journal.title,
    content: journal.content,
    snippet: createSnippet(journal.content),
    date: toDateString(journal.createdAt),
    score: match?.score,
  };
}

export async function indexJournal(journal: JournalForIndex) {
  const vector = await embed(journal.content);

  await upsertVector({
    id: journal.id,
    vector,
    payload: {
      userId: journal.userId,
      journalId: journal.id,
      title: journal.title,
      content: journal.content,
      createdAt: toDateString(journal.createdAt) || new Date().toISOString(),
    },
  });
}

export async function removeJournalFromIndex(journalId: string) {
  await deleteVector(journalId);
}

export async function searchJournals(
  query: string,
  userId: string,
  limit = 5
): Promise<CitationSource[]> {
  const vector = await embed(query);
  const matches = await searchQdrantVector(vector, userId, limit);

  if (matches.length === 0) {
    return [];
  }

  const journalIds = Array.from(
    new Set(matches.map((match) => match.payload?.journalId).filter(Boolean))
  ) as string[];

  if (journalIds.length === 0) {
    return matches
      .map((match) => citationFromMatchPayload(match))
      .filter(Boolean) as CitationSource[];
  }

  const rows = await db.query.journals.findMany({
    where: and(eq(journals.userId, userId), inArray(journals.id, journalIds)),
  });

  const journalById = new Map(rows.map((journal) => [journal.id, journal]));

  return matches
    .map((match) => {
      const journalId = match.payload?.journalId;
      const journal = journalId ? journalById.get(journalId) : undefined;

      if (journal) {
        return citationFromJournal(journal, match);
      }

      return citationFromMatchPayload(match);
    })
    .filter(Boolean) as CitationSource[];
}

export async function getRecentJournalCitations(
  userId: string,
  days = 7,
  limit = 5
): Promise<CitationSource[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rows = await db.query.journals.findMany({
    where: and(eq(journals.userId, userId), gte(journals.createdAt, cutoff)),
    orderBy: [desc(journals.createdAt)],
    limit: Math.min(Math.max(limit, 1), 20),
  });

  return rows.map((journal) => citationFromJournal(journal));
}

function citationFromMatchPayload(match: QdrantMatch): CitationSource | null {
  const payload = match.payload;

  if (!payload?.journalId || !payload.content) {
    return null;
  }

  return {
    id: payload.journalId,
    sourceType: "journal",
    journalId: payload.journalId,
    title: payload.title,
    content: payload.content,
    snippet: createSnippet(payload.content),
    date: payload.createdAt,
    score: match.score,
  };
}
