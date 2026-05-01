# Debo — Full Codebase Ingest

> **Generated automatically. Contains every source file in the repository for AI context ingestion.**
> Last updated: 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Environment & Configuration Files](#3-environment--configuration-files)
4. [Database Layer](#4-database-layer)
5. [Authentication & Middleware](#5-authentication--middleware)
6. [AI & Intelligence Layer](#6-ai--intelligence-layer)
7. [Memory Engine](#7-memory-engine)
8. [Vector Search (Qdrant)](#8-vector-search-qdrant)
9. [Life Graph & Timeline](#9-life-graph--timeline)
10. [Server Actions](#10-server-actions)
11. [API Routes](#11-api-routes)
12. [App Pages & Layouts](#12-app-pages--layouts)
13. [Components — Dashboard](#13-components--dashboard)
14. [Components — Chat & Copilot](#14-components--chat--copilot)
15. [Components — Journal Editor](#15-components--journal-editor)
16. [Components — Landing](#16-components--landing)
17. [Components — UI Primitives](#17-components--ui-primitives)
18. [Utilities & Hooks](#18-utilities--hooks)
19. [DB Migrations](#19-db-migrations)
20. [Agent Skills & Docs](#20-agent-skills--docs)

---

## 1. Project Overview

**Debo** is a next-generation AI-powered life companion journal. It is not a simple journaling app — it is a private personal memory engine that learns from your writing, retrieves your history with citations, detects patterns across time, and provides contextual AI-generated insights.

### Core Principles
- **Memory Sovereignty**: User data is never sold or used to train global models.
- **Privacy by Default**: Every journal entry, extracted memory, and life graph is fully isolated per user.
- **Edge-First**: Deployed on Cloudflare Workers via OpenNext, with edge-compatible AI inference via Cloudflare AI Gateway.
- **Citations-Grounded**: Every AI answer is backed by journal evidence with traceable citations.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Styling | Tailwind CSS v4, shadcn/ui (radix-nova) |
| Auth | Better Auth (Google OAuth) + Stack Auth |
| Database | Neon Serverless Postgres (Drizzle ORM) |
| Vector DB | Qdrant (semantic journal search) |
| AI SDK | Vercel AI SDK (`ai` package) |
| AI Models | Cloudflare Workers AI (Llama 3.3-70b, Qwen Embedding) |
| AI Agents | CopilotKit (frontend agentic framework) |
| MCP | Model Context Protocol server at `/api/mcp` |
| Voice | LiveKit real-time voice agent |
| Integrations | Nango (Google Calendar, Gmail, Slack, Notion) |
| Encryption | AES-256-GCM (Web Crypto API, edge-compatible) |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` |

### AGENTS.md Coding Directives (strict)
1. `page.tsx` and `layout.tsx` **must always be server components** — never add `"use client"` to them.
2. Interactive code requiring `"use client"` must be encapsulated in `/components` and imported into server pages.
3. Use **pure Tailwind CSS V4 / Shadcn styles** only — no custom CSS files.
4. Apply **DRY principles** — repeated UI states must be abstracted into reusable components.
5. **Backend logic** runs edge-first via Cloudflare Worker bindings. Data mutations use Next.js server actions → Drizzle ORM → Neon.

---

## 2. Architecture Summary

```
User Browser
    │
    ▼
Next.js App Router (Cloudflare Workers via OpenNext)
    ├── (marketing)/       — Landing, Privacy, Terms
    ├── (auth)/join        — Google OAuth via Better Auth
    └── (dashboard)/
            ├── dashboard/           — Main hub
            ├── dashboard/ask        — CopilotKit chat (AskLife RAG)
            ├── dashboard/journal/[id] — TipTap block editor
            ├── dashboard/journals   — Journal archive + search
            ├── dashboard/memories   — Memory facts + entities
            ├── dashboard/insights   — Life graph insights
            ├── dashboard/timeline   — Chronological life timeline
            └── dashboard/settings  — AI providers + integrations

API Routes
    ├── /api/auth/[...all]  — Better Auth catch-all
    ├── /api/chat           — askQuestionAction (RAG streaming)
    ├── /api/copilotkit     — CopilotKit runtime (agent tools)
    ├── /api/mcp            — MCP server (Bearer token auth)
    ├── /api/livekit/token  — LiveKit JWT generation
    └── /api/webhooks/stack — Stack Auth user sync webhook

Server Actions (src/actions/)
    ├── ask.ts      — askQuestionAction with streaming + memory processing
    ├── chat.ts     — CRUD for chats and messages
    ├── journals.ts — CRUD + Qdrant indexing + memory graph upsert
    ├── memories.ts — CRUD for facts and entities
    ├── mcp.ts      — MCP key rotation and config
    ├── search.ts   — Semantic journal search via Qdrant
    └── settings.ts — AI provider config, Nango integration management

Intelligence Pipeline (src/lib/)
    ├── ai/
    │   ├── openai.ts    — AI model client (Cloudflare AI Gateway)
    │   ├── embeddings.ts — Embedding via AI SDK
    │   ├── extract.ts   — Heuristic entity/emotion/topic extraction
    │   ├── chunking.ts  — Sentence-aware text chunking for RAG
    │   ├── context.ts   — RAG context builder (journal + memory fusion)
    │   ├── ranking.ts   — Multi-factor scoring (semantic + recency + importance)
    │   ├── askLife.ts   — Core askLife stream + RAG pipeline
    │   ├── tools.ts     — Vercel AI SDK tools (for /api/chat)
    │   └── agent-tools.ts — CopilotKit frontend agent tools
    ├── memory/
    │   ├── extract.ts   — LLM-powered memory extraction
    │   ├── store.ts     — Upsert facts + entities to Postgres
    │   └── query.ts     — Retrieve + rank relevant memories
    ├── vector/
    │   ├── qdrant.ts    — Qdrant REST client (edge-compatible)
    │   └── search.ts    — Journal indexing, chunking, and semantic search
    ├── life/
    │   ├── graph.ts     — Memory graph: nodes (person/topic/emotion/event) + edges
    │   └── timeline.ts  — Group journals by daily/weekly/monthly
    └── chat/
        └── process.ts   — Post-conversation memory extraction + storage

Database (Neon Postgres via Drizzle ORM)
    Tables:
    ├── user              — Auth user profile
    ├── session           — Better Auth sessions
    ├── account           — OAuth provider accounts
    ├── verification      — Email verification tokens
    ├── journal           — User journal entries
    ├── user_preference   — Provider settings, MCP config
    ├── ai_provider       — Per-user AI provider credentials (encrypted)
    ├── chat              — Chat conversation records
    ├── message           — Individual chat messages
    ├── memory_node       — Life graph nodes (entity graph)
    ├── memory_edge       — Life graph edges (relationships)
    ├── memory_fact       — Extracted durable facts
    └── memory_entity     — Named entity frequency tracking

Vector DB (Qdrant)
    Collection: debo_journals
    ├── Chunked journal embeddings (Qwen 0.6B)
    ├── Filtered by userId
    └── Returns scored matches for RAG retrieval
```

---

## 3. Environment & Configuration Files

### `package.json`

```json
{
  "name": "debo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^3.0.71",
    "@ai-sdk/openai": "^3.0.53",
    "@ai-sdk/react": "^3.0.170",
    "@copilotkit/react-core": "^1.56.4",
    "@copilotkit/react-ui": "^1.56.4",
    "@copilotkit/runtime": "^1.56.4",
    "@livekit/components-react": "^2.9.20",
    "@modelcontextprotocol/sdk": "^1.29.0",
    "@nangohq/frontend": "^0.70.1",
    "@neondatabase/serverless": "^0.10.4",
    "@opennextjs/cloudflare": "^1.19.1",
    "@stackframe/stack": "^2.8.85",
    "@tiptap/core": "^3.22.4",
    "ai": "^6.0.168",
    "better-auth": "^1.6.9",
    "drizzle-orm": "^0.39.3",
    "next": "16.2.3",
    "react": "19.1.5",
    "react-dom": "19.1.5",
    "zustand": "^5.0.12"
  }
}
```

### `next.config.ts`

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
```

### `wrangler.jsonc`

- Worker name: `debo`
- Main entry: `.open-next/worker.js`
- Compatibility date: `2026-04-20`
- Flags: `nodejs_compat`, `global_fetch_strictly_public`
- Assets binding: `ASSETS` → `.open-next/assets`
- Images binding: `IMAGES`
- Self-reference service: `WORKER_SELF_REFERENCE`
- Observability: enabled
- Source maps upload: enabled

### `drizzle.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### `tsconfig.json` (key settings)

- Target: `es2022`
- Module resolution: `bundler`
- Path alias: `@/*` → `./src/*`
- Types: `cloudflare-env.d.ts`, `node`
- Strict: `true`

### `components.json`

- Style: `radix-nova`
- RSC: `true`
- Tailwind CSS: `src/app/globals.css`
- Base color: `neutral`
- CSS variables: `true`
- Icon library: `lucide`

### `open-next.config.ts`

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig({
  // R2 incremental cache disabled (commented out)
});
```

### Required Environment Variables

```
DATABASE_URL                 — Neon Postgres connection string
BETTER_AUTH_SECRET           — Better Auth signing secret
BETTER_AUTH_URL              — App base URL for Better Auth
NEXT_PUBLIC_APP_URL          — Public app URL
GOOGLE_CLIENT_ID             — Google OAuth client ID
GOOGLE_CLIENT_SECRET         — Google OAuth client secret
OPENAI_BASE_URL              — Cloudflare AI Gateway base URL
OPENAI_API_KEY               — Gateway API key
OPENAI_MODEL                 — Chat model ID (default: workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast)
OPENAI_EMBEDDING_MODEL       — Embedding model ID (default: workers-ai/@cf/qwen/qwen3-embedding-0.6b)
QDRANT_URL                   — Qdrant cloud instance URL
QDRANT_API_KEY               — Qdrant API key
QDRANT_COLLECTION            — Qdrant collection name (default: debo_journals)
ENCRYPTION_KEY               — 64-char hex string (32 bytes) for AES-256-GCM
NANGO_SECRET_KEY             — Nango secret key for integrations
NEXT_PUBLIC_NANGO_PUBLIC_KEY — Nango public key (client-side OAuth flow)
LIVEKIT_API_KEY              — LiveKit API key
LIVEKIT_API_SECRET           — LiveKit API secret
NEXT_PUBLIC_LIVEKIT_URL      — LiveKit WebSocket server URL
STACK_WEBHOOK_SECRET         — Stack Auth webhook verification secret
```

---

## 4. Database Layer

### `src/db/index.ts`

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### `src/db/schema.ts`

All tables with their columns, indexes, and foreign keys:

**`user`** — Auth user profile
- `id` (PK), `name`, `email` (unique), `emailVerified`, `image`, `createdAt`, `updatedAt`

**`session`** — Better Auth sessions
- `id` (PK), `expiresAt`, `token` (unique), `createdAt`, `updatedAt`, `ipAddress`, `userAgent`, `userId` (FK → user)

**`account`** — OAuth provider accounts
- `id` (PK), `accountId`, `providerId`, `userId` (FK → user), `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `scope`, `password`, `createdAt`, `updatedAt`

**`verification`** — Email verification tokens
- `id` (PK), `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`

**`journals`** — User journal entries
- `id` (PK), `userId` (FK → user), `title`, `content`, `createdAt`, `updatedAt`
- Indexes: `journal_user_id_idx`, `journal_created_at_idx`

**`userPreferences`** — Per-user AI and MCP settings
- `userId` (PK, FK → user), `openaiKey`, `anthropicKey`, `ollamaUrl`, `mcpUrl`, `mcpKey`, `activeProvider` (default: `"cloudflare"`), `createdAt`, `updatedAt`

**`aiProviders`** — Per-user AI provider credentials
- `id` (PK), `userId` (FK → user), `providerId`, `providerName`, `apiKey` (encrypted), `baseUrl`, `isEnabled`, `createdAt`, `updatedAt`

**`chats`** — Chat conversation records
- `id` (PK), `userId` (FK → user), `title`, `createdAt`, `updatedAt`
- Index: `chat_user_id_idx`

**`messages`** — Individual chat messages
- `id` (PK), `chatId` (FK → chats), `role`, `content`, `metadata` (JSON), `createdAt`
- Indexes: `message_chat_id_idx`, `message_created_at_idx`

**`memoryNodes`** — Life graph nodes (person/topic/emotion/event)
- `id` (PK), `userId` (FK → user), `type`, `name`, `normalizedName`, `weight`, `firstSeenAt`, `lastSeenAt`, `metadata` (JSON), `createdAt`, `updatedAt`
- Indexes: `memory_node_user_id_idx`, `memory_node_type_idx`
- Unique: `(userId, type, normalizedName)`

**`memoryEdges`** — Life graph edges (relationships between nodes)
- `id` (PK), `userId` (FK → user), `fromKey`, `toKey`, `relation`, `weight`, `lastSeenAt`, `metadata` (JSON), `createdAt`, `updatedAt`
- Indexes: `memory_edge_user_id_idx`, `memory_edge_relation_idx`
- Unique: `(userId, fromKey, toKey, relation)`

**`memoryFacts`** — Extracted durable facts
- `id` (PK), `userId` (FK → user), `content`, `type`, `weight` (integer), `createdAt`
- Indexes: `memory_fact_user_id_idx`, `memory_fact_type_idx`
- Unique: `(userId, content)`

**`memoryEntities`** — Named entity frequency tracking
- `id` (PK), `userId` (FK → user), `name`, `normalizedName`, `type`, `frequency` (integer), `createdAt`, `updatedAt`
- Indexes: `memory_entity_user_id_idx`, `memory_entity_type_idx`
- Unique: `(userId, type, normalizedName)`

---

## 5. Authentication & Middleware

### `src/lib/auth.ts`

Better Auth configuration. Uses Drizzle adapter with Postgres, Google OAuth social provider.

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  }
});
```

### `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
});
```

### `src/stack/client.ts`

```typescript
import { StackClientApp } from "@stackframe/stack";
export const stackClientApp = new StackClientApp({ tokenStore: "nextjs-cookie" });
```

### `src/stack/server.ts`

```typescript
import "server-only";
import { StackServerApp } from "@stackframe/stack";
import { stackClientApp } from "./client";
export const stackServerApp = new StackServerApp({ inheritsFrom: stackClientApp });
```

### `src/middleware.ts`

Route protection middleware. Redirects unauthenticated users away from `/dashboard/*` to `/join`. Redirects authenticated users away from `/join`/`/login` to `/dashboard`.

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { stackServerApp } from "./stack/server";

export default async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  const isAuthPage = request.nextUrl.pathname === "/join" || request.nextUrl.pathname === "/login";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (!user) {
    if (isDashboardPage) return NextResponse.redirect(new URL("/join", request.url));
  } else {
    if (isAuthPage) return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/join", "/login"],
};
```

### `src/lib/encryption.ts`

AES-256-GCM encryption/decryption using Web Crypto API (edge-compatible). Used to encrypt API keys stored in `ai_provider` table.

- `encrypt(text: string): Promise<string>` — Encrypts using 12-byte IV, returns `iv:encryptedHex`
- `decrypt(hash: string): Promise<string>` — Decrypts both old (`iv:tag:enc`) and new (`iv:data`) formats
- Requires `ENCRYPTION_KEY` env var: 64-char hex string (32 bytes)

---

## 6. AI & Intelligence Layer

### `src/lib/ai/openai.ts`

Central AI model factory. Routes through Cloudflare AI Gateway (or any OpenAI-compatible endpoint).

```typescript
export const DEFAULT_CHAT_MODEL = "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const DEFAULT_EMBEDDING_MODEL = "workers-ai/@cf/qwen/qwen3-embedding-0.6b";

export function getOpenAIClient() // Returns createOpenAI() client from OPENAI_BASE_URL + OPENAI_API_KEY
export function getChatModel()     // Returns chat model (OPENAI_MODEL env or default)
export function getEmbeddingModel() // Returns embedding model
export function getEmbeddingModelId() // Returns embedding model ID string
```

### `src/lib/ai/embeddings.ts`

```typescript
// Embeds text using the configured embedding model
export async function embed(text: string): Promise<number[]>
// - Normalizes whitespace
// - Throws on empty input
// - Throws if embedding returned is empty
```

### `src/lib/ai/chunking.ts`

Sentence-aware text chunker for RAG indexing. Uses `Intl.Segmenter` when available, falls back to regex sentence splitting.

```typescript
export type ChunkOptions = {
  minWords?: number;   // default: 200
  maxWords?: number;   // default: 400
  overlapWords?: number; // default: 60
};

export function splitIntoChunks(text: string, options?: ChunkOptions): string[]
// - Returns single-element array for texts under maxWords
// - Produces overlapping chunks for longer texts
// - Overlap ensures cross-boundary context is preserved
```

### `src/lib/ai/extract.ts`

Heuristic entity, topic, emotion, and key-phrase extraction (no LLM required — used as fast fallback).

```typescript
export type ExtractedEntities = {
  people: string[];    // Capitalized n-grams (name detection)
  topics: string[];    // Matched against TOPICS list
  emotions: string[];  // Matched against EMOTIONS list
  keyPhrases: string[]; // Quoted or multi-word phrases
};

export function extractEntities(text: string): ExtractedEntities
export function summarizeEntities(entities: ExtractedEntities): string[]
// Returns top 6 entities merged from people + topics + emotions
```

Predefined lists:
- **EMOTIONS**: anxious, burned out, calm, confident, curious, excited, frustrated, focused, grateful, hopeful, motivated, overwhelmed, peaceful, stressed, tired, worried
- **TOPICS**: startup, business, product, design, engineering, code, exam, family, relationship, health, fitness, habit, money, career, research, travel, journal, mcp, qdrant

### `src/lib/ai/ranking.ts`

Multi-factor context source scoring used in RAG retrieval.

```typescript
export type RankedContextSource = {
  content: string;
  source: "journal" | "memory";
  score: number;       // Final composite score
  date?: string;
  journalId?: string;
  title?: string | null;
  snippets?: string[];
  semanticScore?: number;  // From vector similarity
  recencyScore?: number;   // Time-decay: 1/(days+1)
  importanceScore?: number; // Entity/emotion density
};

export function calculateRecencyScore(date?: string): number
// Returns 1/(daysSince+1), clamped 0-1

export function calculateImportanceScore(content: string, repeatedMentions?: number): number
// Combines entity density: emotions (0.12/each), people (0.08), topics (0.05), phrases (0.03), repetitions (0.1)

export function scoreContextSource(input): RankedContextSource
// Final score = semantic*0.6 + recency*0.2 + importance*0.2 + memoryFloor(0.15 for memory)

export function dedupeRankedSources(sources: RankedContextSource[]): RankedContextSource[]
// Dedupes by source+journalId/content key, keeps highest-scored

export function detectRecurringPatterns(sources: RankedContextSource[]): Array<{entity: string; count: number}>
// Counts entity occurrences across sources, returns top 5 with count > 1
```

### `src/lib/ai/context.ts`

RAG context builder that fuses journal search results and memory retrieval into a ranked, formatted context string.

```typescript
export type RetrievedContext = {
  items: RankedContextSource[];
  contextText: string;    // Formatted context for LLM system prompt
  citations: CitationSource[];
  patterns: Array<{ entity: string; count: number }>;
};

export async function buildRetrievedContext(question: string, userId: string): Promise<RetrievedContext>
// - Parallel search: Qdrant journal search + memory query
// - Allocates 2 memory slots minimum, up to 8 total sources
// - Dedupes, re-ranks, and formats as [N] SOURCE - Title\nDate\nSnippets
```

### `src/lib/ai/askLife.ts`

Core AI pipeline entry points. Used by `/api/chat` route.

```typescript
// One-shot (non-streaming) — used by MCP and direct calls
export async function askLife(question: string, userId: string): Promise<{ answer: string; citations: CitationSource[] }>

// Streaming — used by the main chat interface
export async function askLifeStream(
  messages: UIMessage[],
  userId: string,
  options?: { onFinish?: StreamTextOnFinishCallback }
): Promise<{ result: StreamTextResult; citations: CitationSource[] }>
// - Pre-builds RAG context before streaming
// - Creates AI SDK tools for the stream
// - Uses stopWhen: stepCountIs(4) to limit tool calls
// - System prompt includes: retrieved context, patterns, current date, Debo persona
```

**System prompt template:**
```
You are Debo, the user's private AI life companion and journal analyst.
Use retrieved private context first. Be warm, precise, and grounded.
Never invent journal facts, dates, people, or memories.
When recurring patterns are visible, highlight them.
Current date: {ISO date}
Recurring patterns: {pattern list}
Retrieved context: {formatted context from RAG}
```

### `src/lib/ai/tools.ts`

Vercel AI SDK tool definitions for the streaming chat route. All tools are user-scoped and execute server-side.

| Tool | Description |
|---|---|
| `create_journal` | Creates journal + indexes in Qdrant + updates memory graph |
| `update_journal` | Updates existing journal entry |
| `delete_journal` | Deletes journal + removes from Qdrant |
| `get_journals` | Lists user's journals (paginated) |
| `search_journals` | Semantic search via Qdrant |
| `add_memory` | Stores a new persistent fact |
| `update_memory` | Updates existing memory by ID |
| `delete_memory` | Removes a memory or entity |
| `get_memory` | Fetches single memory by ID |
| `get_memories` | Retrieves ranked memories with optional query |
| `get_timeline` | Gets life timeline grouped daily/weekly/monthly |
| `detect_patterns` | Queries life graph for recurring patterns |
| `summarize_chat` | Summarizes a conversation transcript |
| `extract_insights` | Extracts facts/emotions/topics from text |
| `get_recent_entries` | Recent journals by date range (1-90 days) |

### `src/lib/ai/agent-tools.ts`

CopilotKit-compatible frontend agent tool definitions. Mirrors the AI SDK tools but in CopilotKit's `FrontendAction[]` format. Adds three UI render tools:

| Render Tool | Description |
|---|---|
| `render_journal_card` | Renders a styled journal entry card in the chat |
| `render_timeline_item` | Renders a timeline node with events and emotions |
| `render_insight_summary` | Renders a highlighted life insight card |

---

## 7. Memory Engine

### `src/lib/memory/extract.ts`

LLM-powered memory extraction from conversation or journal text.

```typescript
export type ExtractedMemory = {
  facts: string[];     // Short first-person statements
  entities: string[];  // People, projects, places, named things
  emotions: string[];  // Emotional states
  topics: string[];    // Subject matter
};

export async function extractMemory(text: string): Promise<ExtractedMemory>
// 1. Calls LLM with JSON extraction prompt
// 2. Falls back to regex heuristics (FACT_PATTERNS, EMOTIONS list, TOPICS list)
// 3. Caps at 12 items per category
```

Fact patterns detected:
- `"I am/I'm ..."` statements
- `"I work on/I'm working on/I am building ..."` statements
- `"I feel/I'm feeling/I felt ..."` statements
- `"I live in/I moved to/I own/I have ..."` statements

### `src/lib/memory/store.ts`

Persists extracted memory to Postgres. Uses upsert with conflict resolution.

```typescript
export async function storeMemory(userId: string, extractedData: ExtractedMemory): Promise<{
  factsInserted: number;
  entitiesUpserted: number;
}>
// - Inserts facts into memory_fact (onConflict: increment weight)
// - Upserts entities into memory_entity (onConflict: increment frequency)
// - Maps people → type:"person", emotions → type:"emotion", topics → type:"topic"
// - Detects fact type: emotion | topic | fact

function detectFactType(fact: string): "emotion" | "topic" | "fact"
```

### `src/lib/memory/query.ts`

Retrieves and ranks relevant memories from Postgres for RAG context.

```typescript
export const getRelevantMemories = cache(async (userId: string, query: string): Promise<{
  items: RelevantMemory[];
  insights: string[];
}>)
// - Queries memory_fact and memory_entity with ILIKE matching
// - Scores each item: semantic(0.5) + importance(0.3) + recency(0.2)
// - Returns top 8 combined items sorted by score
// - Generates 3 insight sentences from top results
```

### `src/lib/chat/process.ts`

Post-conversation memory processing triggered after each AI response.

```typescript
export async function processConversationMemory({
  userId,
  messages
}: ProcessConversationMemoryInput): Promise<{
  facts: number; entities: number; emotions: number; topics: number;
}>
// - Concatenates all message text into a single conversation transcript
// - Calls extractMemory() then storeMemory()
// - Returns count of stored items

export function getLatestUserMessage(messages: UIMessage[]): UIMessage | undefined
export function getMessageText(message: UIMessage | undefined): string
```

---

## 8. Vector Search (Qdrant)

### `src/lib/vector/qdrant.ts`

Edge-compatible Qdrant REST client (no Node.js SDK dependencies).

```typescript
// Configuration (from env):
// QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION (default: "debo_journals")

export async function checkQdrantConnection(): Promise<boolean>
export async function ensureCollection(vectorSize: number): Promise<void>
// Creates collection with Cosine distance if not exists; validates size on existing

export async function upsertVector({ id, vector, payload }: UpsertVectorInput): Promise<void>
// Auto-calls ensureCollection before upserting

export async function deleteVector(id: string): Promise<void>
export async function deleteVectorsByFilter(filter: Record<string, unknown>): Promise<void>

export async function searchVector(
  queryVector: number[],
  userId: string,
  limit?: number // default 5, max 20
): Promise<QdrantMatch[]>
// Filters by userId in payload, returns scored matches
```

**Payload shape:**
```typescript
type QdrantVectorPayload = {
  userId: string;
  journalId: string;
  content: string;       // Chunk text
  createdAt: string;     // ISO date
  title?: string | null;
  chunkIndex?: number;
  chunkCount?: number;
};
```

### `src/lib/vector/search.ts`

High-level journal indexing and semantic search built on top of qdrant.ts.

```typescript
// Indexes a journal: chunks it, embeds each chunk, upserts to Qdrant
export async function indexJournal(journal: JournalForIndex): Promise<void>
// - Uses splitIntoChunks for chunking
// - Deletes old vectors by journalId filter before re-indexing
// - Generates deterministic UUID v5 for each chunk point ID

export async function removeJournalFromIndex(journalId: string): Promise<void>

export async function searchJournals(
  query: string,
  userId: string,
  limit?: number // default 5
): Promise<CitationSource[]>
// - Embeds query, searches Qdrant (limit*2 raw results)
// - Fetches matching journals from Postgres
// - Groups chunks by journalId, dedupes snippets
// - Returns scored citations sorted by composite score

export async function getRecentJournalCitations(
  userId: string,
  days?: number,   // default 7
  limit?: number   // default 5
): Promise<CitationSource[]>
// - Fetches most recent journals by date (no vector search)
```

**CitationSource type:**
```typescript
type CitationSource = {
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
```

---

## 9. Life Graph & Timeline

### `src/lib/life/graph.ts`

Maintains a knowledge graph of life entities (people, topics, emotions, events) extracted from journals.

**Node types:** `"person"`, `"topic"`, `"emotion"`, `"event"`

**Edge relation types:** `"topic_journal"`, `"person_event"`, `"emotion_event"`

**Key functions:**

```typescript
// Full graph rebuild from all journals (deletes and re-indexes)
export async function refreshMemoryGraph(userId: string): Promise<void>

// Incremental upsert for a single journal save
export async function upsertMemoryGraphForJournal(userId: string, journal: JournalRow): Promise<void>

// Full rebuild + return snapshot
export async function buildMemoryGraph(userId: string): Promise<GraphSnapshot>

// Read-only snapshot
export async function getMemoryGraphSnapshot(userId: string): Promise<{
  nodes: SimpleNode[];
  edges: SimpleEdge[];
  nodeStats: Record<string, number>;
  edgeStats: Record<string, number>;
}>
// Returns empty snapshot if memory graph tables missing (pre-migration safety)

// Question-aware graph query
export async function queryGraph(question: string, userId: string): Promise<{
  nodes: ScoredNode[];
  edges: SimpleEdge[];
  insights: string[];
  topPeople: ScoredNode[];
  topTopics: ScoredNode[];
  topEmotions: ScoredNode[];
  patterns: Array<{ entity: string; count: number }>;
}>
// - Scores nodes by: name match (0.45) + entity match (0.35) + recency (0.2) + weight (0.3)
```

**Graph indexing per journal:**
1. Creates an event node for the journal (title or first action sentence)
2. Extracts people, topics, emotions via `extractEntities()`
3. Upserts nodes for each entity type
4. Creates edges: entity → journal-event node
5. Node weights increase with each mention + age factor

### `src/lib/life/timeline.ts`

Groups journals into chronological timeline entries.

```typescript
export type TimelineGrouping = "daily" | "weekly" | "monthly";

export type LifeTimelineEntry = {
  date: string;      // YYYY-MM-DD or YYYY-MM or YYYY-Www
  label: string;     // Human-readable date label
  summary: string;   // AI-generated summary sentence
  events: string[];  // Key events (action verb sentences)
  emotions: string[];
  topics: string[];
  journalIds: string[];
  grouping: TimelineGrouping;
};

export const getLifeTimeline = cache(async (
  userId: string,
  grouping?: TimelineGrouping
): Promise<LifeTimelineEntry[]>)
// - Fetches all user journals ordered by createdAt
// - Groups into daily/weekly/monthly buckets
// - Extracts events (action verb sentences), emotions, topics per group
// - Generates summary from combined entity analysis
```

---

## 10. Server Actions

### `src/actions/journals.ts`

```typescript
// Read (cached)
export const getJournals = cache(async (sortOrder, limit, offset) => ...)
export const getJournalsCount = cache(async () => ...)
export const getJournal = cache(async (id: string) => ...)

// Write
export async function saveJournal(rawContent, id?, title?): Promise<{ success: boolean; data?: string; error?: string }>
// After DB write:
// 1. indexJournal() → Qdrant
// 2. upsertMemoryGraphForJournal() → life graph
// 3. extractMemory() + storeMemory() → memory engine
// 4. revalidatePath() for journals + dashboard pages

export async function deleteJournal(id: string): Promise<{ success: boolean; error?: string }>
// After DB delete:
// 1. removeJournalFromIndex() → Qdrant
// 2. refreshMemoryGraph() → rebuilds full graph

// Validation: Zod schema, content min 1 / max 50000 chars, title max 200 chars
```

### `src/actions/ask.ts`

```typescript
export async function askQuestionAction(
  messages: UIMessage[],
  chatId?: string
): Promise<Response>
// 1. Authenticates via stackServerApp.getUser()
// 2. Creates or reuses chat record
// 3. Saves user message to DB
// 4. Calls askLifeStream() with RAG + tools
// 5. On finish: saves assistant message + processes conversation memory
// 6. Returns UIMessageStreamResponse with citations in metadata
```

### `src/actions/chat.ts`

```typescript
export async function createChat(title?: string): Promise<string>
export async function getChatHistory(chatId: string): Promise<Message[]>
export async function addChatMessage(chatId, role, content, metadata?): Promise<string>
export async function getUserChats(): Promise<Chat[]>
export async function deleteChat(chatId: string): Promise<{ success: boolean }>
```

### `src/actions/memories.ts`

```typescript
export const getMemories = cache(async (query?: string) => ...) // Returns facts + entities ranked by relevance
export async function deleteMemory(memoryId: string)   // Deletes from fact or entity table
export async function getMemory(memoryId: string)      // Fetches by ID from fact or entity table
export async function updateMemory(memoryId, content)  // Updates fact content or entity name + increments weight/frequency
export async function addMemory(fact: string)           // extract + store
export async function importMemories(jsonContent: string) // Batch import from JSON array
```

### `src/actions/settings.ts`

```typescript
export async function getUserPreferences()  // Returns prefs with masked API keys
export async function getAIProviders()      // Returns providers with masked API keys
export async function saveAIProvider(data)  // Encrypts API key, upserts provider record
export async function setActiveProvider(providerId: string)
export async function saveUserPreferences(data)  // Updates MCP URL + active provider
export async function getNangoConnections()      // Lists connected integrations via Nango API
export async function deleteNangoConnection(providerConfigKey: string)
```

### `src/actions/mcp.ts`

```typescript
export async function rotateMCPKey(): Promise<string>
// Generates 48-char hex key prefixed with "debo_", stores in userPreferences

export async function getMCPConfig()
// Returns full userPreferences row for the authenticated user
```

### `src/actions/search.ts`

```typescript
export async function searchJournals(query?: string, limit?: number): Promise<CitationSource[]>
// Validates query, delegates to lib/vector/search.ts
```

---

## 11. API Routes

### `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
```

### `src/app/api/chat/route.ts`

```typescript
export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request)
// Parses { messages, chatId } from body
// Delegates to askQuestionAction()
// Returns streaming UI message response
```

### `src/app/api/copilotkit/route.ts`

CopilotKit runtime endpoint for the agentic chat interface.

```typescript
export async function POST(req: NextRequest)
// 1. Validates session via Better Auth
// 2. Creates CopilotRuntime with getAgentTools(userId)
// 3. Uses OpenAIAdapter pointed at the internal OpenAI client
// 4. Handles the CopilotKit request and returns response
```

### `src/app/api/mcp/route.ts`

Full MCP (Model Context Protocol) server implementation. Bearer token authentication via `userPreferences.mcpKey`.

**Available MCP Tools:**

| Tool | Description |
|---|---|
| `create_journal` | Creates journal + indexes in Qdrant + updates memory graph |
| `search_journals` | Keyword search with date range and limit filters |
| `add_memory` | Extracts and stores persistent facts |
| `search_memories` | Semantic retrieval of stored memories |
| `list_my_connections` | Lists all Nango integrations for the user |
| `run_action` | Executes any API call on a connected integration (GET/POST/PUT/DELETE/PATCH) |
| `get_integration_guide` | Returns documentation hints for google-calendar, github, google-mail, slack |

Authentication: `Authorization: Bearer {mcpKey}` header required for all POST requests.

```typescript
export async function POST(req: NextRequest)  // Validates key, delegates to MCP server
export async function GET(req: NextRequest)   // Health check: returns { status: "active", version: "1.2.0" }
```

### `src/app/api/livekit/token/route.ts`

```typescript
export async function GET(req: NextRequest)
// 1. Gets session via Better Auth
// 2. Creates AccessToken with user identity
// 3. Grants roomJoin, canPublish, canSubscribe for "debo-agent-room"
// 4. Returns { token: jwt }
```

### `src/app/api/webhooks/stack/route.ts`

Stack Auth webhook for user sync (verified via Svix). Handles `user.created`, `user.updated`, `user.deleted` events to keep the local `user` table in sync.

---

## 12. App Pages & Layouts

### Root Layout — `src/app/layout.tsx`

Server component. Wraps entire app with:
- `StackProvider` + `StackTheme` (Stack Auth client)
- `ThemeProvider` (next-themes, defaults to dark mode)
- `TooltipProvider`
- `Toaster` (Sonner notifications)
- Fonts: Inter + Outfit

Metadata: `title: "Debo | Your Life's Memory Engine"`, `metadataBase: https://debo.app`

### Auth Layout — `src/app/(auth)/layout.tsx`

Server component. Centered card layout with "Back to home" arrow link.

### Join Page — `src/app/(auth)/join/page.tsx`

Server component. Renders `<JoinForm />` (client component).

### Marketing Layout — `src/app/(marketing)/layout.tsx`

Server component. Renders `<Navbar isSignedIn>` + children + `<Footer />`. Checks Better Auth session to determine if user is signed in.

### Marketing Home — `src/app/(marketing)/page.tsx`

Server component. Renders: `Hero` → `Problem` → `Solution` → `Features` → `Demo` → `CTA`

### Privacy Page — `src/app/(marketing)/privacy/page.tsx`
### Terms Page — `src/app/(marketing)/terms/page.tsx`

Both are static server components with structured content sections.

### Dashboard Layout — `src/app/(dashboard)/dashboard/layout.tsx`

Server component. Wraps dashboard with:
- Better Auth session check (redirects to `/join` if no session)
- `<CopilotKit runtimeUrl="/api/copilotkit">`
- `<SidebarProvider>` + `<AppSidebar />`
- `<SidebarInset>` with sticky header + `<SidebarTrigger />`
- `<CopilotChat />` — floating popup or inline depending on path

### Dashboard Home — `src/app/(dashboard)/dashboard/page.tsx`

Server component. Fetches `journalCount`, `getLifeTimeline`, `queryGraph`. Displays:
- Welcome header with user's first name
- Stat cards: Memories, Recent, Patterns, Signals
- `<LifeInsights>` component
- `<LifeTimeline>` (last 4 entries reversed)
- Navigation shortcuts grid

Auto-refreshes memory graph if empty with journals present.

### Ask Page — `src/app/(dashboard)/dashboard/ask/page.tsx`

Server component. Renders `<CopilotAskContainer />` (client component with full chat UI + sidebar).

### Journals Page — `src/app/(dashboard)/dashboard/journals/page.tsx`

Server component. Fetches top 100 journals, renders `<JournalListContent>`.

### Journal Editor Page — `src/app/(dashboard)/dashboard/journal/[id]/page.tsx`

Server component. Handles both `new` and existing journal IDs. Fetches journal data, renders `<JournalEditor>` with `initialContent`, `initialId`, `initialTitle`.

### Memories Page — `src/app/(dashboard)/dashboard/memories/page.tsx`

Server component. Reads `q` search param, fetches memories, renders `<MemoryManager>`.

### Insights Page — `src/app/(dashboard)/dashboard/insights/page.tsx`

Server component. Queries memory graph, renders `<LifeInsights>` with full graph data.

### Timeline Page — `src/app/(dashboard)/dashboard/timeline/page.tsx`

Server component. Reads `group` query param (daily/weekly/monthly), fetches timeline, renders `<LifeTimeline>` with grouping toggle buttons.

### Settings Page — `src/app/(dashboard)/dashboard/settings/page.tsx`

Server component. Fetches user preferences, Nango connections, and AI providers in parallel, renders `<SettingsForm>`.

---

## 13. Components — Dashboard

### `src/components/dashboard/app-sidebar.tsx`

Client component. Collapsible sidebar with:
- **Core** group: Dashboard, Ask Life, Journal (new), Timeline, Insights
- **Library** group: Archive, Memories
- **Footer**: Settings link, ThemeToggle, "Synced" status indicator

### `src/components/dashboard/life/life-insights.tsx`

Server component. Displays cognitive analysis panel:
- Intelligence Feed (LLM-generated insights)
- Top Entities (people nodes)
- Key Topics (topic nodes)
- Emotional Resonance (emotion nodes)
- Recurring Frequency table (patterns with count bar)

### `src/components/dashboard/life/life-timeline.tsx`

Server component. Renders expandable `<details>` timeline entries. Each entry shows:
- Summary + date label
- Key Events, Emotional Tone, Thematic Focus (color-coded badge lists)
- Source evidence with links to individual journals

### `src/components/dashboard/memories/memory-manager.tsx`

Client component. Full CRUD UI for memory facts and entities:
- Search with URL sync
- Add new fact input
- Export to JSON / Import from JSON file
- Delete with confirmation dialog
- Paginated list view

### `src/components/dashboard/journal/journal-editor.tsx`

Client component (dashboard version). Features:
- Title input (plain text)
- `<BlockEditor>` (dynamic import, SSR disabled)
- Auto-save with 2-second debounce via `saveJournal()` server action
- Replaces URL with new journal ID after first save
- Status indicator: "Syncing..." | "Saved at HH:MM"

### `src/components/dashboard/journal/journal-list-manager.tsx`

Client component. Advanced journal list with:
- Search + URL-synced query params
- Sort (asc/desc) selector
- Paginated grid of `<JournalCard>` components
- Delete with AlertDialog confirmation
- Mobile floating action button

### `src/components/dashboard/settings/settings-form.tsx`

Client component. Tabbed settings UI:
- **AI Providers** tab: Grid of `<ProviderCard>` for each configured provider
- **Integrations** tab: Google Calendar, Gmail, Slack, Notion connect/disconnect via Nango
- **Voice** tab: LiveKit configuration info

### `src/components/dashboard/settings/provider-card.tsx`

Client component. Per-provider card with:
- Provider icon + name + active status
- Settings Dialog: API key input (password) + base URL input
- Toggle switch to set as active provider
- Calls `saveAIProvider()` + `setActiveProvider()` server actions

### `src/components/dashboard/experimental/livekit-voice.tsx`

Client component. Simple LiveKit voice UI with connect/disconnect button and BarVisualizer.

### `src/components/dashboard/experimental/agent/voice-agent-client.tsx`

Client component. Full voice agent interface:
- Pre-session: "Talk to Intelligence" button with loader
- Active session: Agent avatar with speaking state animation, BarVisualizer, mute/hang-up controls
- Dynamic import of `LiveKitRoom` to avoid SSR issues

### `src/components/dashboard/experimental/mcp/mcp-client.tsx`

Client component. MCP configuration UI:
- API endpoint display + copy button
- Bearer token display + rotation button (`rotateMCPKey()`)
- Tool capability cards (7 tools listed with icons and descriptions)
- Quick Start guide

---

## 14. Components — Chat & Copilot

### `src/components/chat/CopilotAskContainer.tsx`

Client component. Main Ask page container:
- Loads and manages chat history from server (`getUserChats()`)
- Persists active chat ID in `localStorage`
- Renders `<ChatSidebar>` + `<CustomChatArea>` + `<AgentDataRenderer>`
- Handles create/delete chat operations

```typescript
useCopilotReadable({
  description: "The list of previous conversations and the current active conversation ID.",
  value: JSON.stringify({ activeChatId, chats }),
})
```

### `src/components/chat/ChatSidebar.tsx`

Client component. Chat history sidebar:
- Sorted list of conversations by `updatedAt`
- Active chat highlighting
- Delete button per chat (hover-reveal)
- Empty state with prompt to start first conversation

### `src/components/chat/CustomChatArea.tsx`

Client component. Custom CopilotKit chat interface:
- Uses `useCopilotChat()` hook
- Renders user and assistant text messages
- Filters out action execution messages
- Loading indicator with "Thinking..." state
- Keyboard shortcut: Enter to send, Shift+Enter for newline
- Auto-scrolls to bottom on new messages

### `src/components/copilot/CopilotChat.tsx`

Client component. Renders `<CopilotPopup>` on all dashboard pages except `/dashboard/ask` (where the full-page chat is shown). Always renders `<AgentDataRenderer>`.

### `src/components/copilot/AgentDataRenderer.tsx`

Client component. Registers three `useCopilotAction` render handlers:
1. **`render_journal_card`** — Styled card with title, content snippet, date, "Open" link
2. **`render_timeline_item`** — Timeline node card with events and emotion badges
3. **`render_insight_summary`** — Gradient insight card with sparkles icon

Returns `null` from render (effects only via hooks).

---

## 15. Components — Journal Editor

### `src/components/journal/journal-editor.tsx`

Client component (shared, used in archive page context):
- Title input
- `<BlockEditor>` with 1.5-second auto-save debounce
- Save status: idle | saving | saved (with Check icon)
- Back button → `/dashboard/journals`

### `src/components/journal/block-editor.tsx`

Client component (default export, dynamically imported with SSR disabled):
- Uses Novel's `EditorRoot` + `EditorContent`
- Extensions: `defaultExtensions` + slash command
- Updates parent via `onChange(markdown)` on every editor update
- Prose styling with primary selection color

### `src/components/journal/extensions.ts`

TipTap extension configuration:
- `StarterKit` (no built-in codeBlock/horizontalRule — overridden separately)
- `TiptapImage` (base64 allowed, styled border)
- `TiptapLink` (primary color, underline)
- `TaskList` + `TaskItem` (nested, with flex layout)
- `HorizontalRule` (muted border)
- `Placeholder` (type-aware prompts: "Heading X" or "Press '/' for commands...")
- `Typography`
- `CodeBlockLowlight` (common language highlighting)
- `Markdown` (tiptap-markdown, no HTML, tight lists)

### `src/components/journal/slash-command.tsx`

Custom slash command extension for TipTap:
- Triggered by `/` character
- Items: Text, To-do List, Heading 1-3, Bullet List, Numbered List, Divider, Code
- `<CommandList>` component with keyboard navigation (↑/↓/Enter)
- Uses Tippy.js for the floating dropdown
- `renderItems()` creates ReactRenderer for the dropdown

---

## 16. Components — Landing

### `src/components/landing/Navbar.tsx`

Sticky navbar. Shows "Enter Debo" if signed in, "Sign In" + "Get Started" if not. `isSignedIn` prop from server.

### `src/components/landing/Hero.tsx`

Landing hero section. Conditional CTA: "Enter Debo" (signed in) vs "Start free — Build my life graph" (signed out). Gradient radial background effects.

### `src/components/landing/Problem.tsx`

Three-card grid: "You forget patterns", "Notes are static", "No real intelligence".

### `src/components/landing/Solution.tsx`

Single centered section: "Meet your second brain."

### `src/components/landing/Features.tsx`

Six-card feature grid: AI Memory Engine, Ask Your Life, Pattern Detection, Life Timeline, Memory Graph, Proactive Insights.

### `src/components/landing/Demo.tsx`

Simulated chat demo with example Q&A: "What did I do last week?" and "What patterns do I repeat?".

### `src/components/landing/CTA.tsx`

Bottom CTA section with "Start free — Create my account" button + links to privacy policy and GitHub.

### `src/components/landing/Footer.tsx`

Simple footer with copyright + Privacy + Terms links.

---

## 17. Components — UI Primitives

All UI primitives are shadcn/ui components located in `src/components/ui/`. Full list:

`accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button-group`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `combobox`, `command`, `context-menu`, `dialog`, `direction`, `drawer`, `dropdown-menu`, `empty`, `field`, `hover-card`, `input-group`, `input-otp`, `input`, `item`, `kbd`, `label`, `menubar`, `native-select`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `toggle-group`, `toggle`, `tooltip`

---

## 18. Utilities & Hooks

### `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/lib/nango.ts`

Edge-compatible Nango client (`NangoEdge` class) — avoids Node.js `crypto` dependency of the official SDK.

```typescript
class NangoEdge {
  async listConnections(connectionId: string): Promise<Connection[]>
  async deleteConnection(providerConfigKey: string, connectionId: string): Promise<boolean>
  async proxy(config: {
    method: string;
    endpoint: string;
    providerConfigKey: string;
    connectionId: string;
    params?: Record<string, string>;
    data?: any;
  }): Promise<{ data: any }>
}

export const nango = new NangoEdge({ secretKey: process.env.NANGO_SECRET_KEY || "placeholder_secret_key" });
```

### `src/lib/integrations.ts`

Convenience wrappers around Nango proxy:

```typescript
export async function getCalendarEvents(userId: string)
// GET /primary/events on google-calendar, next 10 events

export async function getRecentEmails(userId: string)
// GET /messages on google-mail, last 5 messages
```

### `src/config/providers.ts`

Static configuration for the 8 supported AI providers:

| ID | Name | Notes |
|---|---|---|
| `openai` | OpenAI | GPT-4o, GPT-4 Turbo |
| `anthropic` | Anthropic | Claude 3.5 Sonnet |
| `groq` | Groq | `https://api.groq.com/openai/v1` |
| `ollama` | Ollama | `http://localhost:11434/v1` |
| `perplexity` | Perplexity | `https://api.perplexity.ai` |
| `openrouter` | OpenRouter | `https://openrouter.ai/api/v1` |
| `cloudflare` | Cloudflare Workers AI | Default provider |
| `custom-openai` | Custom OpenAI | Any compatible endpoint |

### `src/hooks/use-mobile.ts`

```typescript
export function useIsMobile(): boolean
// Tracks window.matchMedia("(max-width: 767px)") with event listener
```

### `src/components/theme-provider.tsx`

Thin wrapper around `next-themes` `ThemeProvider`.

### `src/components/theme-toggle.tsx`

Client component. Sun/Moon icon toggle button that cycles between light and dark themes.

---

## 19. DB Migrations

### `0000_faulty_tempest.sql` — Initial schema
Creates: `account`, `journal` (with `vectorize_id`), `session`, `user`, `user_preference`, `verification` + FK constraints.

### `0001_daily_psylocke.sql` — Chat + AI providers
Creates: `ai_provider`, `chat`, `message` + adds `mcp_key` to `user_preference` + FK constraints.

### `0002_parallel_shadowcat.sql` — Performance indexes
Adds btree indexes: `chat_user_id_idx`, `journal_user_id_idx`, `journal_created_at_idx`, `message_chat_id_idx`, `message_created_at_idx`.

### `0003_memory_graph_and_chunks.sql` — Life graph tables
Creates: `memory_node`, `memory_edge` + indexes including unique composite indexes on `(userId, type, normalizedName)` and `(userId, fromKey, toKey, relation)`.

### `0004_memory_engine.sql` — Memory facts + entities
Creates: `memory_fact`, `memory_entity` + indexes + unique composite indexes. Drops legacy `mem0_key` and `mem0_url` columns from `user_preference`.

### `0005_chat_message_metadata.sql` — Message metadata
Adds: `metadata text` column to `message` table.

---

## 20. Agent Skills & Docs

### `.agents/skills/next-best-practices/`

Comprehensive Next.js best practices guide covering:
- `async-patterns.md` — Async/await patterns in App Router
- `bundling.md` — Bundle optimization
- `data-patterns.md` — Data fetching patterns
- `debug-tricks.md` — Debugging techniques
- `directives.md` — `"use client"` / `"use server"` rules
- `error-handling.md` — Error boundary patterns
- `file-conventions.md` — App Router file conventions
- `font.md` — Next.js font optimization
- `functions.md` — Server/client function boundaries
- `hydration-error.md` — Hydration error prevention
- `image.md` — Image optimization
- `metadata.md` — SEO metadata API
- `parallel-routes.md` — Parallel route patterns
- `route-handlers.md` — API route handlers
- `rsc-boundaries.md` — React Server Component boundaries
- `runtime-selection.md` — Edge vs Node.js runtime
- `scripts.md` — Script loading strategies
- `self-hosting.md` — Self-hosting Next.js
- `suspense-boundaries.md` — Suspense and streaming

### `.agents/skills/frontend-design/`

Frontend design skill guidelines.

### `.agents/skills/web-design-guidelines/`

Web design guidelines for UI/UX decisions.

### `docs/` Documentation Files

- `ARCHITECTURE.md` — Deep architecture documentation
- `AI_SYSTEM.md` — AI system design documentation
- `CONNECTORS_AND_AI.md` — Connectors and AI integration guide
- `FEATURES.md` — Feature specifications
- `INGEST.md` — Previous ingest documentation
- `LANDING.md` — Landing page copy
- `MARKETING.md` — Marketing materials
- `PHASES.md` — Development phases
- `PRD.md` — Product Requirements Document
- `Privacy.md` — Privacy policy source
- `ROADMAP.md` — Product roadmap
- `Terms.md` — Terms of service source
- `VOICE.md` — Voice feature documentation
- `ai/lobehub.md` — LobeHub AI reference

---

## Data Flow Summary

### When a user writes a journal entry:
1. `JournalEditor` (client) autosaves via `saveJournal()` server action
2. `saveJournal()` writes to Neon Postgres (`journal` table)
3. `indexJournal()` → splits into chunks → embeds via Cloudflare AI → upserts to Qdrant
4. `upsertMemoryGraphForJournal()` → extracts entities → upserts to `memory_node` + `memory_edge` tables
5. `extractMemory()` + `storeMemory()` → extracts facts/entities → upserts to `memory_fact` + `memory_entity` tables
6. `revalidatePath()` → Next.js revalidates cached journal pages

### When a user asks a question:
1. `CustomChatArea` (client) appends message via `useCopilotChat()` hook → CopilotKit routes to `/api/copilotkit`
2. OR direct chat: `POST /api/chat` → `askQuestionAction()`
3. `buildRetrievedContext()` runs in parallel:
   - `searchJournals()` → embeds query → Qdrant vector search → fetch matching journals from Postgres
   - `getRelevantMemories()` → ILIKE search on facts + entities → rank by composite score
4. Merged context (max 8 sources, ≥2 memory) formatted as text for system prompt
5. `streamText()` or `generateText()` with tools enabled (max 4 steps)
6. Stream returned to client with citations in message metadata
7. `processConversationMemory()` called in `onFinish` → extracts + stores conversation memory

### When a user queries via MCP:
1. External agent sends `POST /api/mcp` with `Authorization: Bearer {mcpKey}`
2. Key validated against `userPreferences.mcpKey` in Postgres
3. Tool executed server-side with validated `userId`
4. JSON response returned (not streaming)

---

*End of Debo codebase ingest. Total source files: ~120+ TypeScript/TSX files across the full application.*
