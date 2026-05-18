// @debo/types - Memory, vector search, and citation types

export type QdrantVectorPayload = {
  userId: string;
  journalId: string;
  content: string;
  createdAt: string;
  title?: string | null;
  chunkIndex?: number;
  chunkCount?: number;
};

export type QdrantMatch = {
  id: string | number;
  score: number;
  payload?: QdrantVectorPayload;
};

export type CitationSource = {
  id: string;
  sourceType: "journal" | "memory";
  content: string;
  snippet: string;
  snippets?: string[];
  date?: string;
  title?: string | null;
  journalId?: string;
  score?: number;
  source?: string;
  chunkIndex?: number;
  chunkCount?: number;
  semanticScore?: number;
  recencyScore?: number;
  importanceScore?: number;
};

export type MemoryNodeType = "person" | "topic" | "emotion" | "event" | "place";

export type MemoryNode = {
  id: string;
  userId: string;
  type: MemoryNodeType;
  name: string;
  normalizedName: string;
  weight: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MemoryEdge = {
  id: string;
  userId: string;
  fromKey: string;
  toKey: string;
  relation: string;
  weight: string;
  lastSeenAt: Date;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MemoryFact = {
  id: string;
  userId: string;
  content: string;
  type: string;
  weight: number;
  createdAt: Date;
};
