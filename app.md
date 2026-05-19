# Debo App — Full Context Documentation

> **Archived**: 2026-05-19. The original app was deleted because `@mastra/core` (57MB) exceeded Cloudflare Workers' 10MiB bundle limit. This document preserves all context for rebuilding.

---

## What It Was

A Next.js 16 personal intelligence / journaling platform called **Debo** — a Jarvis-like AI companion for journaling, memory, and life reflection. Deployed to Cloudflare Workers via OpenNext at `app.debo.life`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (React 19.1.5) |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` |
| Auth | Stack Auth (`@stackframe/stack`) |
| Database | Neon serverless Postgres via Drizzle ORM |
| Vector DB | Qdrant (semantic journal search) |
| AI/LLM | NVIDIA NIM (OpenAI-compatible API), Vercel AI SDK v6 |
| AI Agents | Mastra (`@mastra/core`, `@mastra/memory`, `@mastra/libsql`) |
| Memory | Dual: local Postgres + Mem0 cloud |
| Rich Editor | Plate.js (40+ plugins) + Tiptap |
| Voice | LiveKit (Deepgram STT, Cartesia TTS, NVIDIA LLM) |
| Integrations | Composio (1000+ tools: Gmail, Slack, GitHub, etc.) |
| File Upload | UploadThing + R2 |
| UI | Shadcn/Radix, Tailwind CSS v4, Lucide icons |
| State | Zustand |

---

## Database Schema (17 Tables)

### Auth
- `user` — profiles (id, name, email, image)
- `session` — sessions
- `account` — OAuth accounts (provider, tokens)
- `verification` — email verification tokens

### Core
- `journal` — text entries (id, userId, title, content, tags[], timestamps)
- `chat` — threads (id, userId, title, timestamps)
- `message` — messages (id, chatId, role, content JSON, metadata)
- `user_preference` — settings (openaiKey, anthropicKey, ollamaUrl, mcpUrl, mcpKey, activeProvider)
- `ai_provider` — provider configs per user (providerId, apiKey encrypted, baseUrl, isEnabled)

### Memory
- `memory_node` — graph nodes (type, name, weight, firstSeenAt, lastSeenAt)
- `memory_edge` — graph edges (fromKey, toKey, relation, weight)
- `memory_fact` — durable facts (content, type, weight)
- `memory_entity` — named entities (name, type, frequency)

### Characters
- `character_profile` — people from journals/chat (displayName, aliases, relationship, summary, confidence, mentionCount)
- `character_reference` — source refs (sourceType, sourceId, excerpt)

### Connectors
- `connector` — external service connections (type, apiKey, webhookUrl, syncStatus)
- `connector_event` — incoming events

### Media
- `google_drive_credential` — Google Drive OAuth tokens
- `video_journal` — video metadata (driveFileId, transcript, duration)
- `audio_journal` — audio metadata (driveFileId, transcript, duration)

---

## Mastra Agents

| Agent | Purpose |
|---|---|
| `debo` | Main Jarvis-like companion. Full tool set: journals, memories, timeline, graph, Mem0. |
| `debo-companion` | Empathetic heart. Active listening, journal creation, memory capture. |
| `debo-librarian` | Memory/retrieval specialist. Semantic + keyword search. |
| `debo-analyst` | Deep pattern analysis across journals and memories. |
| `weather-agent` | Weather info and activity suggestions. |

## Mastra Tools

| Tool | Purpose |
|---|---|
| `create_journal` | Create journal (requires explicit user request) |
| `delete_journal` | Delete by ID |
| `get_journals` | List recent |
| `search_journals` | Semantic vector search |
| `add_memory` | Add to local store |
| `get_memories` | Query local store |
| `get_timeline` | Chronological life events |
| `detect_patterns` | Analyze for recurring themes |
| `ask_debo` | Chat through Debo (MCP only) |
| `import_ai_context` | Import ChatGPT/Claude/Cursor exports |
| `list_chat_threads` / `get_chat_thread` | Thread management |
| `add_mem0_memory` / `search_mem0_memory` | Mem0 cloud memory |
| `get-weather` | Open-Meteo API |
| Composio tools | Dynamic: Gmail, Slack, GitHub, etc. |

## Mastra Workflows

| Workflow | Steps |
|---|---|
| `journal-processing` | (1) Vector index in Qdrant, (2) Memory graph update, (3) AI memory extraction |
| `daily-analysis` | (1) Fetch recent journals, (2) Analyze patterns, (3) Store significant facts |
| `weather-workflow` | (1) Fetch forecast, (2) Plan activities |

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing / redirect |
| `/join` | Sign-in / waitlist |
| `/handler/[...stack]` | Stack Auth handler |
| `/editor` | Plate.js rich text editor |
| `/talk` | LiveKit voice room |
| `/dashboard` | Home — journal grid with search/filter/sort |
| `/dashboard/chat` | AI chat (Assistant component) |
| `/dashboard/ask` | Redirects to /chat |
| `/dashboard/talk` | LiveKit voice agent |
| `/dashboard/capture` | Audio/video capture studio |
| `/dashboard/journals` | Journal list |
| `/dashboard/journal/[id]` | Journal detail (legacy) |
| `/dashboard/journal/text/[id]` | Text journal detail |
| `/dashboard/journal/audio/[id]` | Audio journal detail |
| `/dashboard/journal/video/[id]` | Video journal detail |
| `/dashboard/memories` | Memory manager |
| `/dashboard/characters` | Character profiles |
| `/dashboard/connectors` | Connector management |
| `/dashboard/mcp` | MCP configuration |
| `/dashboard/settings` | AI providers, Debo personality |
| `/dashboard/insights` | Life insights |

---

## API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/chat` | POST | Main chat — streams Mastra agent with memory context |
| `/api/chat/threads` | GET/POST/DELETE/PATCH | Thread CRUD |
| `/api/chat/history` | GET/POST | Message persistence |
| `/api/chat/import` | POST | Import from ChatGPT/Claude/Cursor |
| `/api/connectors` | GET/POST | Connector list/create |
| `/api/connectors/[id]` | GET/POST | Webhook receiver (HMAC) |
| `/api/connectors/[id]/sync` | DELETE/POST | Sync trigger |
| `/api/capture/media` | POST | R2 upload (max 150MB) |
| `/api/capture/media/[...key]` | GET/HEAD | R2 read (range requests) |
| `/api/ai/copilot` | POST | Simple AI text gen |
| `/api/ai/command` | POST | Plate.js editor AI commands |
| `/api/livekit/token` | GET | LiveKit access token |
| `/api/mcp` | GET/POST | MCP SSE server (Bearer auth) |
| `/api/mcp/messages` | POST | MCP message endpoint |
| `/api/uploadthing` | POST | File upload |
| `/api/webhooks/stack` | POST | Stack Auth webhook |

---

## Server Actions

| Action | Purpose |
|---|---|
| `auth-sync.ts` | Stack Auth → local DB user sync |
| `chat.ts` | Chat/message CRUD |
| `composio.ts` | Composio OAuth connect/disconnect |
| `connectors.ts` | Connector CRUD, sync, event processing |
| `journals.ts` | Journal CRUD + post-processing (vector, graph, characters) |
| `mcp.ts` | MCP key management |
| `media-journals.ts` | Video/audio journal CRUD, Google Drive upload |
| `memories.ts` | Memory CRUD (Mem0 + local dual store) |
| `search.ts` | Semantic + lexical journal search |
| `settings.ts` | Debo settings + AI provider management |

---

## Key Libraries (src/lib/)

| File | Purpose |
|---|---|
| `ai/openai.ts` | NVIDIA NIM via OpenAI-compatible API |
| `ai/embeddings.ts` | Embedding generation |
| `ai/extract.ts` | Memory extraction from text |
| `ai/ranking.ts` | Relevance ranking |
| `ai/chunking.ts` | Text chunking |
| `chat/server.ts` | Thread/message persistence |
| `chat/debo-tools.ts` | Runtime tool definitions + DEBO_SYSTEM_PROMPT |
| `chat/context-import.ts` | AI context import |
| `memory/extract.ts` | Memory extraction |
| `memory/store.ts` | Memory storage |
| `memory/query.ts` | Memory retrieval |
| `vector/qdrant.ts` | Qdrant client |
| `vector/search.ts` | Semantic search |
| `life/graph.ts` | Memory graph (pattern analysis) |
| `life/timeline.ts` | Timeline generation |
| `encryption.ts` | AES-256-GCM (Web Crypto API) |
| `composio.ts` | Composio SDK client |
| `cloudflare.ts` | getCloudflareContext helper |

---

## Config

| File | Purpose |
|---|---|
| `config/connectors.ts` | Google Calendar, Gmail, Photos, Drive, Slack, Notion, Tasks, YouTube |
| `config/providers.ts` | OpenAI, Anthropic, Groq, Ollama, Perplexity, OpenRouter, Cloudflare, Custom |

---

## Environment Variables

### AI / LLM
- `NVIDIA_API_KEY` — Primary LLM key
- `OPENAI_API_KEY` — Fallback
- `OPENAI_BASE_URL` — Default: `https://integrate.api.nvidia.com/v1`
- `OPENAI_MODEL` — Default: `meta/llama-3.3-70b-instruct`
- `DEBO_CHAT_MODEL` / `DEBO_EMBEDDING_MODEL` — Overrides
- `AI_GATEWAY_API_KEY` — For copilot

### Database
- `DATABASE_URL` — Neon Postgres
- `NEON_FETCH_TIMEOUT_MS` — 3000 dev / 2500 prod

### Vector DB
- `QDRANT_URL` / `QDRANT_API_KEY` / `QDRANT_COLLECTION`

### Memory
- `MEM0_API_KEY`

### Auth (Stack)
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`
- `STACK_WEBHOOK_SECRET`

### Integrations
- `COMPOSIO_API_KEY`
- `NANGO_SECRET_KEY` (legacy)

### Voice (LiveKit)
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`
- `CARTESIA_API_KEY` / `DEEPGRAM_API_KEY`

### Storage
- `R2_PUBLIC_BASE_URL`
- `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (Internet Archive)

### App
- `NEXT_PUBLIC_APP_URL`
- `ENCRYPTION_KEY` — 64-char hex for AES-256-GCM
- `CHAT_CONTEXT_TIMEOUT_MS` / `CHAT_CONTEXT_DEBUG`

---

## Wrangler Bindings

| Binding | Type | Purpose |
|---|---|---|
| `ASSETS` | Static | OpenNext static files |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 | Next.js incremental cache |
| `IMAGES` | Images | Cloudflare Images |
| `WORKER_SELF_REFERENCE` | Service | Self-reference |
| `MEDIA` | R2 | User media (code refs but not in wrangler.jsonc) |

---

## Why It Failed

`@mastra/core` is **57MB**. The OpenNext Cloudflare bundler (`bundle-server.js`) uses esbuild with `bundle: true` and no way to externalize npm packages. Everything gets inlined into a single `handler.mjs`. Cloudflare Workers have a hard **10 MiB** limit. No configuration change can fix this.

---

## Rebuild Strategy

The new app should:
1. Use Next.js 16 on Cloudflare (lightweight, no Mastra)
2. Keep Stack Auth, Drizzle/Neon, Tailwind
3. Use Vercel AI SDK directly (no Mastra wrapper) for chat
4. Lazy-load heavy dependencies only when needed
5. Move Mastra agents to a separate deployment (Railway/Fly.io) or use Mastra's own Cloudflare deployer
6. Keep all pages and API routes but simplify the agent layer
