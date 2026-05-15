import { pgTable, text, timestamp, boolean, index, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const journals = pgTable("journal", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    title: text("title"),
    content: text("content").notNull(),
    tags: text("tags").array().default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("journal_user_id_idx").on(table.userId),
    createdAtIdx: index("journal_created_at_idx").on(table.createdAt),
}));

export const userPreferences = pgTable("user_preference", {
    userId: text("user_id").primaryKey().references(() => user.id),
    openaiKey: text("openai_key"),
    anthropicKey: text("anthropic_key"),
    ollamaUrl: text("ollama_url"),
    mcpUrl: text("mcp_url"),
    mcpKey: text("mcp_key"),
    activeProvider: text("active_provider").default("cloudflare"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiProviders = pgTable("ai_provider", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    providerId: text("provider_id").notNull(), // slug: 'openai', 'anthropic', 'custom-1'
    providerName: text("provider_name").notNull(),
    apiKey: text("api_key"), // Encrypted
    baseUrl: text("base_url"),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chats = pgTable("chat", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("chat_user_id_idx").on(table.userId),
}));

export const messages = pgTable("message", {
    id: text("id").primaryKey(),
    chatId: text("chat_id").notNull().references(() => chats.id),
    role: text("role").notNull(), // 'user', 'assistant', 'system', 'tool'
    content: text("content").notNull(), // JSON string for complex content
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    chatIdIdx: index("message_chat_id_idx").on(table.chatId),
    createdAtIdx: index("message_created_at_idx").on(table.createdAt),
}));

export const memoryNodes = pgTable("memory_node", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    type: text("type").notNull(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    weight: text("weight").notNull().default("1"),
    firstSeenAt: timestamp("first_seen_at").notNull(),
    lastSeenAt: timestamp("last_seen_at").notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("memory_node_user_id_idx").on(table.userId),
    typeIdx: index("memory_node_type_idx").on(table.type),
    uniqueNodeIdx: uniqueIndex("memory_node_unique_idx").on(table.userId, table.type, table.normalizedName),
}));

export const memoryEdges = pgTable("memory_edge", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    fromKey: text("from_key").notNull(),
    toKey: text("to_key").notNull(),
    relation: text("relation").notNull(),
    weight: text("weight").notNull().default("1"),
    lastSeenAt: timestamp("last_seen_at").notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("memory_edge_user_id_idx").on(table.userId),
    relationIdx: index("memory_edge_relation_idx").on(table.relation),
    uniqueEdgeIdx: uniqueIndex("memory_edge_unique_idx").on(table.userId, table.fromKey, table.toKey, table.relation),
}));

export const memoryFacts = pgTable("memory_fact", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    content: text("content").notNull(),
    type: text("type").notNull(),
    weight: integer("weight").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("memory_fact_user_id_idx").on(table.userId),
    typeIdx: index("memory_fact_type_idx").on(table.type),
    uniqueFactIdx: uniqueIndex("memory_fact_unique_idx").on(table.userId, table.type, table.content),
}));

export const memoryEntities = pgTable("memory_entity", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    type: text("type").notNull(),
    frequency: integer("frequency").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("memory_entity_user_id_idx").on(table.userId),
    typeIdx: index("memory_entity_type_idx").on(table.type),
    uniqueEntityIdx: uniqueIndex("memory_entity_unique_idx").on(table.userId, table.type, table.normalizedName),
}));

export const characterProfiles = pgTable("character_profile", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    customId: text("custom_id"),
    avatarUrl: text("avatar_url"),
    aliases: text("aliases").array().default(sql`'{}'::text[]`),
    relationship: text("relationship"),
    summary: text("summary"),
    context: text("context"),
    source: text("source").default("manual").notNull(),
    confidence: integer("confidence").default(1).notNull(),
    mentionCount: integer("mention_count").default(0).notNull(),
    firstSeenAt: timestamp("first_seen_at"),
    lastSeenAt: timestamp("last_seen_at"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("character_profile_user_id_idx").on(table.userId),
    normalizedNameIdx: index("character_profile_normalized_name_idx").on(table.normalizedName),
    uniqueCharacterIdx: uniqueIndex("character_profile_unique_idx").on(table.userId, table.normalizedName),
    uniqueCustomIdIdx: uniqueIndex("character_profile_custom_id_idx").on(table.userId, table.customId),
}));

export const characterReferences = pgTable("character_reference", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    characterId: text("character_id").notNull().references(() => characterProfiles.id),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    sourceTitle: text("source_title"),
    sourceHref: text("source_href"),
    excerpt: text("excerpt").notNull(),
    occurredAt: timestamp("occurred_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("character_reference_user_id_idx").on(table.userId),
    characterIdIdx: index("character_reference_character_id_idx").on(table.characterId),
    sourceIdx: index("character_reference_source_idx").on(table.sourceType, table.sourceId),
    uniqueReferenceIdx: uniqueIndex("character_reference_unique_idx").on(table.userId, table.characterId, table.sourceType, table.sourceId),
}));

// Connectors - apps/services that connect to Debo MCP
export const connectors = pgTable("connector", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    name: text("name").notNull(),
    connectorType: text("connector_type").notNull(), // 'slack', 'discord', 'notion', 'linear', 'gmail', 'calendar', 'custom'
    apiKey: text("api_key"), // Encrypted connector-specific API key
    webhookUrl: text("webhook_url"),
    webhookSecret: text("webhook_secret"),
    baseUrl: text("base_url"), // For custom connectors
    isEnabled: boolean("is_enabled").default(true).notNull(),
    lastSyncAt: timestamp("last_sync_at"),
    syncStatus: text("sync_status").default("idle"), // 'idle', 'syncing', 'error', 'success'
    metadata: text("metadata"), // JSON for connector-specific config
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("connector_user_id_idx").on(table.userId),
    typeIdx: index("connector_type_idx").on(table.connectorType),
}));

// Connector events - incoming messages/events from connectors
export const connectorEvents = pgTable("connector_event", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    connectorId: text("connector_id").notNull().references(() => connectors.id),
    eventType: text("event_type").notNull(), // 'message', 'mention', 'file', 'reaction', 'webhook'
    content: text("content").notNull(),
    sourceId: text("source_id"), // External ID (message ID, channel ID, etc.)
    sourceUrl: text("source_url"), // Link to original message
    authorName: text("author_name"),
    channelName: text("channel_name"),
    metadata: text("metadata"), // JSON for event-specific data
    processedAt: timestamp("processed_at"),
    journalId: text("journal_id").references(() => journals.id), // Linked journal if auto-created
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("connector_event_user_id_idx").on(table.userId),
    connectorIdIdx: index("connector_event_connector_id_idx").on(table.connectorId),
    createdAtIdx: index("connector_event_created_at_idx").on(table.createdAt),
}));

// Google Drive credentials for storing media
export const googleDriveCredentials = pgTable("google_drive_credential", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id).unique(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiryDate: timestamp("expiry_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("gdc_user_id_idx").on(table.userId),
}));

// Video journals stored on Google Drive
export const videoJournals = pgTable("video_journal", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    title: text("title").notNull(),
    driveFileId: text("drive_file_id").notNull(),
    driveWebUrl: text("drive_web_url"),
    thumbnailUrl: text("thumbnail_url"),
    duration: integer("duration"), // seconds
    transcript: text("transcript"),
    folderId: text("folder_id"), // Google Drive folder ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("video_journal_user_id_idx").on(table.userId),
    createdAtIdx: index("video_journal_created_at_idx").on(table.createdAt),
}));

// Audio journals stored on Google Drive
export const audioJournals = pgTable("audio_journal", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    title: text("title").notNull(),
    driveFileId: text("drive_file_id").notNull(),
    driveWebUrl: text("drive_web_url"),
    transcript: text("transcript"),
    duration: integer("duration"), // seconds
    folderId: text("folder_id"), // Google Drive folder ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("audio_journal_user_id_idx").on(table.userId),
    createdAtIdx: index("audio_journal_created_at_idx").on(table.createdAt),
}));
