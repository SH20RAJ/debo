import { pgTable, text, timestamp, boolean, index, uniqueIndex, integer } from "drizzle-orm/pg-core";

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

