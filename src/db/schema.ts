import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

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
    content: text("content").notNull(),
    vectorizeId: text("vectorize_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preference", {
    userId: text("user_id").primaryKey().references(() => user.id),
    openaiKey: text("openai_key"),
    anthropicKey: text("anthropic_key"),
    ollamaUrl: text("ollama_url"),
    mcpUrl: text("mcp_url"),
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
});

export const messages = pgTable("message", {
    id: text("id").primaryKey(),
    chatId: text("chat_id").notNull().references(() => chats.id),
    role: text("role").notNull(), // 'user', 'assistant', 'system', 'tool'
    content: text("content").notNull(), // JSON string for complex content
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


