import "server-only";

import { cache } from "react";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { journals } from "@/db/schema";
import { extractEntities, summarizeEntities } from "@/lib/ai/extract";

export type TimelineGrouping = "daily" | "weekly" | "monthly";

export type LifeTimelineEntry = {
  date: string;
  label: string;
  summary: string;
  events: string[];
  emotions: string[];
  topics: string[];
  journalIds: string[];
  grouping: TimelineGrouping;
};

type JournalRow = Awaited<ReturnType<typeof db.query.journals.findMany>>[number];

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string) {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(normalizeText).filter(Boolean)));
}

function formatDateKey(date: Date, grouping: TimelineGrouping) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  if (grouping === "monthly") {
    return `${year}-${month}`;
  }

  if (grouping === "weekly") {
    const utcDate = new Date(Date.UTC(year, date.getUTCMonth(), date.getUTCDate()));
    const dayOfWeek = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() - dayOfWeek + 1);
    return utcDate.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function labelDateKey(dateKey: string, grouping: TimelineGrouping) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  if (grouping === "monthly") {
    return date.toLocaleDateString("en", { month: "long", year: "numeric" });
  }

  if (grouping === "weekly") {
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 6);
    return `${date.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en", { month: "short", day: "numeric" })}`;
  }

  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function extractEvents(journal: JournalRow) {
  const text = [journal.title, journal.content].filter(Boolean).join(". ");
  const sentences = splitSentences(text);
  const actionVerbs = /\b(worked|met|built|planned|called|shipped|studied|launched|wrote|visited|exercised|traveled|discussed|reflected|decided|finished|started|helped|debugged|design|focus|felt)\b/i;

  const events = sentences.filter((sentence) => actionVerbs.test(sentence)).slice(0, 4);

  if (events.length > 0) {
    return unique(events);
  }

  return unique(sentences.slice(0, 2));
}

function summarizeGroup(entries: JournalRow[]) {
  const combinedText = entries
    .map((entry) => [entry.title, entry.content].filter(Boolean).join(". "))
    .join(" ");
  const entities = extractEntities(combinedText);
  const summaryAnchors = summarizeEntities(entities);

  if (summaryAnchors.length > 0) {
    const topic = entities.topics[0] || summaryAnchors[0];
    const emotion = entities.emotions[0];
    const person = entities.people[0];

    return unique([
      emotion ? `You felt ${emotion}` : "You had a full day",
      topic ? `and spent time around ${topic}` : "and worked through important thoughts",
      person ? `with ${person}` : "",
    ].filter(Boolean)).join(" ") + ".";
  }

  const fallback = splitSentences(combinedText).slice(0, 2).join(" ");
  return fallback || "You captured a meaningful moment.";
}

function groupJournals(entries: JournalRow[], grouping: TimelineGrouping) {
  const grouped = new Map<string, JournalRow[]>();

  for (const entry of entries) {
    const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
    const key = formatDateKey(date, grouping);
    const current = grouped.get(key) || [];
    current.push(entry);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateKey, groupedEntries]) => {
      const events = unique(groupedEntries.flatMap(extractEvents)).slice(0, 6);
      const entities = groupedEntries.map((entry) => extractEntities(entry.content));
      const emotions = unique(entities.flatMap((entity) => entity.emotions)).slice(0, 5);
      const topics = unique(entities.flatMap((entity) => entity.topics)).slice(0, 5);

      return {
        date: dateKey,
        label: labelDateKey(dateKey, grouping),
        summary: summarizeGroup(groupedEntries),
        events,
        emotions,
        topics,
        journalIds: groupedEntries.map((entry) => entry.id),
        grouping,
      };
    });
}

export const getLifeTimeline = cache(async (userId: string, grouping: TimelineGrouping = "daily") => {
  const entries = await db.query.journals.findMany({
    where: eq(journals.userId, userId),
    orderBy: [asc(journals.createdAt)],
  });

  return groupJournals(entries, grouping);
});
