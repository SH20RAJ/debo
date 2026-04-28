import "server-only";

import { detectRecurringPatterns, dedupeRankedSources, scoreContextSource, type RankedContextSource } from "@/lib/ai/ranking";
import { getRelevantMemories } from "@/lib/memory/query";
import { searchJournals, type CitationSource } from "@/lib/vector/search";

export type RetrievedContext = {
  items: RankedContextSource[];
  contextText: string;
  citations: CitationSource[];
  patterns: Array<{ entity: string; count: number }>;
};

function toRankedJournalSource(citation: CitationSource) {
  return scoreContextSource({
    content: citation.snippets?.join("\n\n") || citation.content,
    semanticScore: citation.score,
    date: citation.date,
    repeatedMentions: citation.snippets?.length || 1,
    source: "journal",
    title: citation.title,
    journalId: citation.journalId,
    snippets: citation.snippets,
  });
}

function toRankedMemorySource(citation: CitationSource, question: string) {
  const normalizedQuestion = question.toLowerCase().trim();
  const queryBoost = normalizedQuestion
    ? citation.content.toLowerCase().includes(normalizedQuestion)
      ? 0.25
      : 0.1
    : 0.15;

  return scoreContextSource({
    content: citation.content,
    semanticScore: Math.max(citation.score || 0, queryBoost),
    date: citation.date,
    repeatedMentions: 1,
    source: "memory",
    snippets: citation.snippets,
  });
}

function memoryItemToCitation(item: Awaited<ReturnType<typeof getRelevantMemories>>["items"][number]): CitationSource {
  return {
    id: item.id,
    sourceType: "memory",
    content: item.content,
    snippet: item.content,
    snippets: [item.content],
    date: item.date,
    score: item.score,
    source: item.label || item.sourceType,
  };
}

function formatContext(items: RankedContextSource[]) {
  return items
    .map((item, index) => {
      const date = item.date
        ? new Date(item.date).toLocaleDateString("en", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Unknown date";

      const snippets = item.snippets?.length ? item.snippets : [item.content];

      return `[${index + 1}] ${item.source.toUpperCase()}${item.title ? ` - ${item.title}` : ""}
Date: ${date}
Score: ${item.score.toFixed(2)}
Snippets:
${snippets.map((snippet) => `- ${snippet}`).join("\n")}`;
    })
    .join("\n\n");
}

export async function buildRetrievedContext(question: string, userId: string) {
  const [journalsResult, memoriesResult] = await Promise.allSettled([
    searchJournals(question, userId, 10),
    getRelevantMemories(userId, question),
  ]);

  const journals = journalsResult.status === "fulfilled" ? journalsResult.value : [];
  const memories = memoriesResult.status === "fulfilled" ? memoriesResult.value.items.map(memoryItemToCitation) : [];

  if (journalsResult.status === "rejected") {
    console.error("Journal retrieval failed:", journalsResult.reason);
  }

  if (memoriesResult.status === "rejected") {
    console.error("Memory retrieval failed:", memoriesResult.reason);
  }

  const rankedJournals = journals.map(toRankedJournalSource);
  const rankedMemories = memories.map((memory) => toRankedMemorySource(memory, question));

  const reservedMemoryCount = Math.min(rankedMemories.length, 2);
  const journalSlots = Math.max(0, 8 - reservedMemoryCount);
  const selectedJournals = rankedJournals.slice(0, journalSlots);
  const selectedMemories = rankedMemories.slice(0, reservedMemoryCount);

  const merged = dedupeRankedSources([
    ...selectedMemories,
    ...selectedJournals,
    ...rankedMemories.slice(reservedMemoryCount),
  ])
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);

  return {
    items: merged,
    citations: [...journals, ...memories],
    patterns: detectRecurringPatterns(merged),
    contextText: formatContext(merged),
  } satisfies RetrievedContext;
}