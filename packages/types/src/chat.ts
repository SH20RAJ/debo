// @debo/types - Chat and message types

export type ChatThread = {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageRow = {
  id: string;
  chatId: string;
  role: string;
  content: string;
  metadata: string | null;
  createdAt: Date;
};

export type ChatHistoryStorageRow = {
  id: string;
  parent_id: string | null;
  format: string;
  content: Record<string, unknown>;
};

export type ChatRole = "system" | "user" | "assistant" | "tool";
