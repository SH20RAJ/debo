export type CharacterSourceType = "text" | "audio" | "video" | "chat" | "memory" | "manual";

export type CharacterReference = {
  id: string;
  characterId: string;
  sourceType: CharacterSourceType;
  sourceId: string;
  sourceTitle: string | null;
  sourceHref: string | null;
  excerpt: string;
  occurredAt: Date | null;
  createdAt: Date;
};

export type CharacterProfile = {
  id: string;
  displayName: string;
  normalizedName: string;
  customId: string | null;
  avatarUrl: string | null;
  aliases: string[];
  relationship: string | null;
  summary: string | null;
  context: string | null;
  source: string;
  confidence: number;
  mentionCount: number;
  firstSeenAt: Date | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  references: CharacterReference[];
};

export type CharacterInput = {
  displayName: string;
  customId?: string | null;
  avatarUrl?: string | null;
  aliases?: string[];
  relationship?: string | null;
  summary?: string | null;
  context?: string | null;
};

export type CharacterSyncResult = {
  charactersProcessed: number;
  referencesProcessed: number;
  duplicatesMerged: number;
};
