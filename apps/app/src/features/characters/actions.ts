"use server";

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";

import { resolveUserId } from "@/actions/auth-sync";
import { db } from "@debo/db";
import {
  audioJournals,
  characterProfiles,
  characterReferences,
  chats,
  journals,
  memoryEntities,
  messages,
  videoJournals,
} from "@debo/db/schema";
import { logDatabaseIssue } from "@debo/db/errors";

import { composeCharacterSummary, extractCharacterMentions } from "./extract";
import {
  displayCharacterName,
  mergeUniqueAliases,
  normalizeAliases,
  normalizeCharacterName,
  sourceHref,
  stableId,
} from "./normalize";
import type { CharacterInput, CharacterProfile, CharacterReference, CharacterSyncResult } from "./types";

const characterInputSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(120),
  customId: z.string().max(80).nullable().optional(),
  avatarUrl: z.string().url("Use a valid image URL").or(z.literal("")).nullable().optional(),
  aliases: z.array(z.string().max(120)).max(12).optional(),
  relationship: z.string().max(160).nullable().optional(),
  summary: z.string().max(1200).nullable().optional(),
  context: z.string().max(4000).nullable().optional(),
});

type SourceRecord = {
  sourceType: "text" | "audio" | "video" | "chat";
  sourceId: string;
  title: string | null;
  text: string;
  occurredAt: Date | null;
};

function cleanOptional(value?: string | null) {
  const text = value?.replace(/\s+/g, " ").trim() || "";
  return text || null;
}

function parseAliases(value: string[] | null | undefined) {
  return normalizeAliases(Array.isArray(value) ? value : []);
}

function mapReference(row: typeof characterReferences.$inferSelect): CharacterReference {
  return {
    id: row.id,
    characterId: row.characterId,
    sourceType: row.sourceType as CharacterReference["sourceType"],
    sourceId: row.sourceId,
    sourceTitle: row.sourceTitle,
    sourceHref: row.sourceHref,
    excerpt: row.excerpt,
    occurredAt: row.occurredAt,
    createdAt: row.createdAt,
  };
}

function mapProfile(
  row: typeof characterProfiles.$inferSelect,
  references: CharacterReference[] = []
): CharacterProfile {
  return {
    id: row.id,
    displayName: row.displayName,
    normalizedName: row.normalizedName,
    customId: row.customId,
    avatarUrl: row.avatarUrl,
    aliases: parseAliases(row.aliases),
    relationship: row.relationship,
    summary: row.summary,
    context: row.context,
    source: row.source,
    confidence: row.confidence,
    mentionCount: row.mentionCount,
    firstSeenAt: row.firstSeenAt,
    lastSeenAt: row.lastSeenAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    references,
  };
}

function referenceId(userId: string, normalizedName: string, sourceType: string, sourceId: string) {
  return `charref_${stableId([userId, normalizedName, sourceType, sourceId])}`;
}

function characterId(userId: string, normalizedName: string) {
  return `char_${stableId([userId, normalizedName])}`;
}

function revalidateCharacters() {
  revalidatePath("/dashboard/characters");
  revalidatePath("/dashboard");
}

async function upsertCharacterFromMention(
  userId: string,
  mention: {
    name: string;
    normalizedName: string;
    aliases: string[];
    relationship?: string;
    excerpt: string;
  },
  source: SourceRecord
) {
  const now = new Date();
  const existing = await db.query.characterProfiles.findFirst({
    where: and(
      eq(characterProfiles.userId, userId),
      eq(characterProfiles.normalizedName, mention.normalizedName)
    ),
  });

  const aliases = mergeUniqueAliases(existing?.aliases, mention.aliases, [mention.name]);
  const existingContext = existing?.context?.trim();
  const contextLine = `${source.title || "Untitled"}: ${mention.excerpt}`;
  const nextContext = existingContext
    ? Array.from(new Set([existingContext, contextLine])).join("\n").slice(0, 4000)
    : contextLine;

  const profileId = existing?.id || characterId(userId, mention.normalizedName);
  const displayName = existing?.displayName || displayCharacterName(mention.name);

  if (existing) {
    await db
      .update(characterProfiles)
      .set({
        aliases,
        relationship: existing.relationship || mention.relationship || null,
        summary: existing.summary || composeCharacterSummary(displayName, existing.mentionCount + 1, mention.excerpt),
        context: nextContext,
        mentionCount: sql`${characterProfiles.mentionCount} + 1`,
        confidence: Math.min(100, Math.max(existing.confidence || 1, 45)),
        firstSeenAt: existing.firstSeenAt || source.occurredAt || now,
        lastSeenAt: source.occurredAt || now,
        updatedAt: now,
      })
      .where(eq(characterProfiles.id, existing.id));
  } else {
    await db.insert(characterProfiles).values({
      id: profileId,
      userId,
      displayName,
      normalizedName: mention.normalizedName,
      aliases,
      relationship: mention.relationship || null,
      summary: composeCharacterSummary(displayName, 1, mention.excerpt),
      context: nextContext,
      source: "sync",
      confidence: 45,
      mentionCount: 1,
      firstSeenAt: source.occurredAt || now,
      lastSeenAt: source.occurredAt || now,
    });
  }

  await db
    .insert(characterReferences)
    .values({
      id: referenceId(userId, mention.normalizedName, source.sourceType, source.sourceId),
      userId,
      characterId: profileId,
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      sourceTitle: source.title,
      sourceHref: sourceHref(source.sourceType, source.sourceId),
      excerpt: mention.excerpt,
      occurredAt: source.occurredAt,
    })
    .onConflictDoUpdate({
      target: [
        characterReferences.userId,
        characterReferences.characterId,
        characterReferences.sourceType,
        characterReferences.sourceId,
      ],
      set: {
        sourceTitle: source.title,
        sourceHref: sourceHref(source.sourceType, source.sourceId),
        excerpt: mention.excerpt,
        occurredAt: source.occurredAt,
      },
    });
}

async function collectSources(userId: string): Promise<SourceRecord[]> {
  const [textEntries, audioEntries, videoEntries, userChats, chatMessages] = await Promise.all([
    db.query.journals.findMany({
      where: eq(journals.userId, userId),
      orderBy: [desc(journals.createdAt)],
      limit: 300,
    }),
    db.query.audioJournals.findMany({
      where: eq(audioJournals.userId, userId),
      orderBy: [desc(audioJournals.createdAt)],
      limit: 200,
    }),
    db.query.videoJournals.findMany({
      where: eq(videoJournals.userId, userId),
      orderBy: [desc(videoJournals.createdAt)],
      limit: 200,
    }),
    db.query.chats.findMany({
      where: eq(chats.userId, userId),
      orderBy: [desc(chats.updatedAt)],
      limit: 80,
    }),
    db
      .select({
        id: messages.id,
        chatId: messages.chatId,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
        chatTitle: chats.title,
      })
      .from(messages)
      .innerJoin(chats, eq(messages.chatId, chats.id))
      .where(and(eq(chats.userId, userId), or(eq(messages.role, "user"), eq(messages.role, "assistant"))))
      .orderBy(desc(messages.createdAt))
      .limit(400),
  ]);

  const chatTitleById = new Map(userChats.map((chat) => [chat.id, chat.title || "Debo chat"]));

  return [
    ...textEntries.map((entry) => ({
      sourceType: "text" as const,
      sourceId: entry.id,
      title: entry.title || "Text journal",
      text: entry.content,
      occurredAt: entry.createdAt,
    })),
    ...audioEntries.map((entry) => ({
      sourceType: "audio" as const,
      sourceId: entry.id,
      title: entry.title || "Audio journal",
      text: entry.transcript || entry.title || "",
      occurredAt: entry.createdAt,
    })),
    ...videoEntries.map((entry) => ({
      sourceType: "video" as const,
      sourceId: entry.id,
      title: entry.title || "Video journal",
      text: entry.transcript || entry.title || "",
      occurredAt: entry.createdAt,
    })),
    ...chatMessages.map((message) => ({
      sourceType: "chat" as const,
      sourceId: message.chatId,
      title: message.chatTitle || chatTitleById.get(message.chatId) || "Debo chat",
      text: message.content,
      occurredAt: message.createdAt,
    })),
  ].filter((source) => source.text.trim().length > 0);
}

async function importPersonEntities(userId: string) {
  const people = await db.query.memoryEntities.findMany({
    where: and(eq(memoryEntities.userId, userId), eq(memoryEntities.type, "person")),
    orderBy: [desc(memoryEntities.frequency), desc(memoryEntities.updatedAt)],
    limit: 200,
  });

  for (const person of people) {
    const normalizedName = normalizeCharacterName(person.name);
    if (!normalizedName) continue;

    await db
      .insert(characterProfiles)
      .values({
        id: characterId(userId, normalizedName),
        userId,
        displayName: displayCharacterName(person.name),
        normalizedName,
        aliases: [displayCharacterName(person.name)],
        relationship: null,
        summary: composeCharacterSummary(person.name, person.frequency),
        context: "Imported from the memory entity graph.",
        source: "memory",
        confidence: Math.min(100, 30 + person.frequency * 5),
        mentionCount: person.frequency,
        firstSeenAt: person.createdAt,
        lastSeenAt: person.updatedAt,
      })
      .onConflictDoNothing({
        target: [characterProfiles.userId, characterProfiles.normalizedName],
      });
  }
}

async function dedupeCharactersForUser(userId: string) {
  const rows = await db.query.characterProfiles.findMany({
    where: eq(characterProfiles.userId, userId),
    orderBy: [desc(characterProfiles.mentionCount), asc(characterProfiles.createdAt)],
  });

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const keys = new Set([row.normalizedName, ...parseAliases(row.aliases).map(normalizeCharacterName)]);
    const key = Array.from(keys).sort()[0] || row.normalizedName;
    groups.set(key, [...(groups.get(key) || []), row]);
  }

  let merged = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const [master, ...duplicates] = group.sort((left, right) => right.mentionCount - left.mentionCount);
    if (!master) continue;

    for (const duplicate of duplicates) {
      await db
        .update(characterReferences)
        .set({ characterId: master.id })
        .where(and(eq(characterReferences.userId, userId), eq(characterReferences.characterId, duplicate.id)));

      await db
        .update(characterProfiles)
        .set({
          aliases: mergeUniqueAliases(master.aliases, duplicate.aliases, [duplicate.displayName]),
          relationship: master.relationship || duplicate.relationship,
          summary: master.summary || duplicate.summary,
          context: [master.context, duplicate.context].filter(Boolean).join("\n").slice(0, 4000) || null,
          mentionCount: master.mentionCount + duplicate.mentionCount,
          confidence: Math.max(master.confidence, duplicate.confidence),
          firstSeenAt: master.firstSeenAt || duplicate.firstSeenAt,
          lastSeenAt: duplicate.lastSeenAt && (!master.lastSeenAt || duplicate.lastSeenAt > master.lastSeenAt)
            ? duplicate.lastSeenAt
            : master.lastSeenAt,
          updatedAt: new Date(),
        })
        .where(eq(characterProfiles.id, master.id));

      await db.delete(characterProfiles).where(eq(characterProfiles.id, duplicate.id));
      merged += 1;
    }
  }

  return merged;
}

export const getCharacters = cache(async (query = "", providedUserId?: string) => {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return { success: false, error: "Unauthorized", data: [] as CharacterProfile[] };

  try {
    const trimmedQuery = query.replace(/\s+/g, " ").trim();
    const where = trimmedQuery
      ? and(
          eq(characterProfiles.userId, userId),
          or(
            ilike(characterProfiles.displayName, `%${trimmedQuery}%`),
            ilike(characterProfiles.relationship, `%${trimmedQuery}%`),
            ilike(characterProfiles.summary, `%${trimmedQuery}%`),
            ilike(characterProfiles.context, `%${trimmedQuery}%`)
          )
        )
      : eq(characterProfiles.userId, userId);

    const rows = await db.query.characterProfiles.findMany({
      where,
      orderBy: [desc(characterProfiles.mentionCount), desc(characterProfiles.lastSeenAt), asc(characterProfiles.displayName)],
      limit: 120,
    });

    if (rows.length === 0) return { success: true, data: [] as CharacterProfile[] };

    const references = await db.query.characterReferences.findMany({
      where: and(
        eq(characterReferences.userId, userId),
        inArray(characterReferences.characterId, rows.map((row) => row.id))
      ),
      orderBy: [desc(characterReferences.occurredAt), desc(characterReferences.createdAt)],
      limit: 500,
    });

    const refsByCharacter = new Map<string, CharacterReference[]>();
    for (const reference of references) {
      const mapped = mapReference(reference);
      refsByCharacter.set(reference.characterId, [...(refsByCharacter.get(reference.characterId) || []), mapped]);
    }

    return {
      success: true,
      data: rows.map((row) => mapProfile(row, refsByCharacter.get(row.id) || [])),
    };
  } catch (error) {
    logDatabaseIssue("characters list", error);
    return { success: false, error: "Failed to load characters", data: [] as CharacterProfile[] };
  }
});

export async function createCharacter(input: CharacterInput, providedUserId?: string) {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = characterInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid character" };

  try {
    const displayName = displayCharacterName(parsed.data.displayName);
    const normalizedName = normalizeCharacterName(displayName);
    const aliases = mergeUniqueAliases(parsed.data.aliases, [displayName]);

    const id = characterId(userId, normalizedName);
    await db
      .insert(characterProfiles)
      .values({
        id,
        userId,
        displayName,
        normalizedName,
        customId: cleanOptional(parsed.data.customId),
        avatarUrl: cleanOptional(parsed.data.avatarUrl),
        aliases,
        relationship: cleanOptional(parsed.data.relationship),
        summary: cleanOptional(parsed.data.summary) || composeCharacterSummary(displayName, 0),
        context: cleanOptional(parsed.data.context),
        source: "manual",
        confidence: 100,
        mentionCount: 0,
      })
      .onConflictDoUpdate({
        target: [characterProfiles.userId, characterProfiles.normalizedName],
        set: {
          displayName,
          customId: cleanOptional(parsed.data.customId),
          avatarUrl: cleanOptional(parsed.data.avatarUrl),
          aliases,
          relationship: cleanOptional(parsed.data.relationship),
          summary: cleanOptional(parsed.data.summary),
          context: cleanOptional(parsed.data.context),
          confidence: 100,
          updatedAt: new Date(),
        },
      });

    revalidateCharacters();
    return { success: true, data: id };
  } catch (error) {
    logDatabaseIssue("character create", error);
    return { success: false, error: "Failed to create character" };
  }
}

export async function updateCharacter(characterIdValue: string, input: CharacterInput, providedUserId?: string) {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = characterInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid character" };

  try {
    const existing = await db.query.characterProfiles.findFirst({
      where: and(eq(characterProfiles.id, characterIdValue), eq(characterProfiles.userId, userId)),
    });
    if (!existing) return { success: false, error: "Character not found" };

    const displayName = displayCharacterName(parsed.data.displayName);
    const normalizedName = normalizeCharacterName(displayName);

    await db
      .update(characterProfiles)
      .set({
        displayName,
        normalizedName,
        customId: cleanOptional(parsed.data.customId),
        avatarUrl: cleanOptional(parsed.data.avatarUrl),
        aliases: mergeUniqueAliases(parsed.data.aliases, [displayName]),
        relationship: cleanOptional(parsed.data.relationship),
        summary: cleanOptional(parsed.data.summary),
        context: cleanOptional(parsed.data.context),
        updatedAt: new Date(),
      })
      .where(and(eq(characterProfiles.id, characterIdValue), eq(characterProfiles.userId, userId)));

    revalidateCharacters();
    return { success: true, data: characterIdValue };
  } catch (error) {
    logDatabaseIssue("character update", error);
    return { success: false, error: "Failed to update character" };
  }
}

export async function deleteCharacter(characterIdValue: string, providedUserId?: string) {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db
      .delete(characterReferences)
      .where(and(eq(characterReferences.userId, userId), eq(characterReferences.characterId, characterIdValue)));
    await db
      .delete(characterProfiles)
      .where(and(eq(characterProfiles.userId, userId), eq(characterProfiles.id, characterIdValue)));

    revalidateCharacters();
    return { success: true };
  } catch (error) {
    logDatabaseIssue("character delete", error);
    return { success: false, error: "Failed to delete character" };
  }
}

export async function addCharacterNote(characterIdValue: string, note: string, providedUserId?: string) {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return { success: false, error: "Unauthorized" };

  const cleanNote = note.replace(/\s+/g, " ").trim();
  if (cleanNote.length < 2) return { success: false, error: "Note is too short" };

  try {
    const profile = await db.query.characterProfiles.findFirst({
      where: and(eq(characterProfiles.id, characterIdValue), eq(characterProfiles.userId, userId)),
    });
    if (!profile) return { success: false, error: "Character not found" };

    const sourceId = `manual-${Date.now()}`;
    await db.insert(characterReferences).values({
      id: referenceId(userId, profile.normalizedName, "manual", sourceId),
      userId,
      characterId: profile.id,
      sourceType: "manual",
      sourceId,
      sourceTitle: "Manual note",
      sourceHref: null,
      excerpt: cleanNote,
      occurredAt: new Date(),
    });

    await db
      .update(characterProfiles)
      .set({
        context: [profile.context, cleanNote].filter(Boolean).join("\n").slice(0, 4000),
        mentionCount: profile.mentionCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(characterProfiles.id, profile.id));

    revalidateCharacters();
    return { success: true };
  } catch (error) {
    logDatabaseIssue("character note add", error);
    return { success: false, error: "Failed to add note" };
  }
}

export async function syncCharacters(providedUserId?: string): Promise<{ success: boolean; error?: string; data?: CharacterSyncResult }> {
  const userId = await resolveUserId(providedUserId, true);
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    let charactersProcessed = 0;
    let referencesProcessed = 0;

    const sources = await collectSources(userId);
    for (const source of sources) {
      const mentions = extractCharacterMentions(source.text, source.title);
      for (const mention of mentions) {
        await upsertCharacterFromMention(userId, mention, source);
        charactersProcessed += 1;
        referencesProcessed += 1;
      }
    }

    await importPersonEntities(userId);
    const duplicatesMerged = await dedupeCharactersForUser(userId);

    revalidateCharacters();
    return {
      success: true,
      data: {
        charactersProcessed,
        referencesProcessed,
        duplicatesMerged,
      },
    };
  } catch (error) {
    logDatabaseIssue("characters sync", error);
    return { success: false, error: "Failed to sync characters" };
  }
}

export async function captureCharacterMentionsFromText(params: {
  userId: string;
  text: string;
  title?: string;
  sourceType?: "chat" | "text" | "audio" | "video";
  sourceId?: string;
}) {
  try {
    const text = params.text.replace(/\s+/g, " ").trim();
    if (text.length < 3) return { success: true, data: { mentions: 0 } };

    const source: SourceRecord = {
      sourceType: params.sourceType || "chat",
      sourceId: params.sourceId || `message-${Date.now()}`,
      title: params.title || "Debo chat",
      text,
      occurredAt: new Date(),
    };

    const mentions = extractCharacterMentions(text, source.title);
    for (const mention of mentions) {
      await upsertCharacterFromMention(params.userId, mention, source);
    }

    if (mentions.length > 1) {
      await dedupeCharactersForUser(params.userId);
    }

    revalidateCharacters();
    return { success: true, data: { mentions: mentions.length } };
  } catch (error) {
    logDatabaseIssue("character chat capture", error);
    return { success: false, error: "Failed to capture character mentions" };
  }
}
