// @debo/types - User types

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPreferences = {
  userId: string;
  openaiKey: string | null;
  anthropicKey: string | null;
  ollamaUrl: string | null;
  mcpUrl: string | null;
  mcpKey: string | null;
  activeProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AiProvider = {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  apiKey: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Connector = {
  id: string;
  userId: string;
  name: string;
  connectorType: string;
  apiKey: string | null;
  webhookUrl: string | null;
  webhookSecret: string | null;
  baseUrl: string | null;
  isEnabled: boolean;
  lastSyncAt: Date | null;
  syncStatus: string | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ConnectorEvent = {
  id: string;
  userId: string;
  connectorId: string;
  eventType: string;
  content: string;
  sourceId: string | null;
  sourceUrl: string | null;
  authorName: string | null;
  channelName: string | null;
  metadata: string | null;
  processedAt: Date | null;
  journalId: string | null;
  createdAt: Date;
};
