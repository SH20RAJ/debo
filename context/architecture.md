# Architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router, standalone output) |
| Language | TypeScript 5.7+ |
| React | 19.1.5 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Database | PostgreSQL (Neon Serverless) via Drizzle ORM |
| Vector DB | Qdrant (cloud) |
| Auth | Stack Auth (@stackframe/stack) |
| AI/LLM | Vercel AI SDK 6 + OpenAI-compatible providers (NVIDIA NIM default) |
| Voice | LiveKit (WebRTC) + Deepgram STT + Cartesia TTS |
| Memory | Mem0 API + local Postgres (memory_nodes, memory_edges, memory_facts) |
| Agent Framework | Mastra (agents, tools, workflows) |
| Integrations | Composio (Google Drive, external services) |
| Rich Editor | Plate.js 53 + Tiptap 3 |
| File Upload | UploadThing |
| Deployment | Cloudflare Workers (OpenNext) |
| Package Manager | Bun (bun.lock) |

## Directory Structure

```
src/
  actions/          # Server actions (Next.js)
  app/              # Next.js App Router pages and API routes
    (auth)/         # Auth layout group (login/signup)
    (chat)/         # Chat layout group (talk/voice)
    (dashboard)/    # Dashboard layout group (main app)
    (marketing)/    # Marketing pages (landing, pitch, legal)
    api/            # API route handlers
    editor/         # Standalone editor page
  components/       # React components
    dashboard/      # Dashboard-specific components
    editor/         # Editor components
    journal/        # Journal components
    landing/        # Marketing/landing components
    ui/             # Shared UI primitives (shadcn)
  config/           # Configuration files
  db/               # Drizzle schema and migrations
  features/         # Feature modules (characters)
  hooks/            # Custom React hooks
  lib/              # Core libraries
    ai/             # AI utilities (embeddings, extraction, chunking)
    memory/         # Memory engine (extract, query, store)
    mcp/            # MCP server instructions
    vector/         # Qdrant vector search
  mastra/           # Mastra framework (agents, tools, workflows)
  scripts/          # Build/deploy scripts
  stack/            # Stack Auth client config
  types/            # TypeScript type definitions
  workers/          # Background workers (voice agent)
```

## Data Flow

1. **Capture** → User creates journal (text/audio/video)
2. **Process** → Memory extraction runs (facts, entities, topics)
3. **Store** → Content saved to Postgres, vectors to Qdrant, media to Google Drive
4. **Index** → Character Graph updated with people mentions
5. **Retrieve** → Chat/Talk queries memory engine for relevant context
6. **Respond** → AI generates cited answers using retrieved memory

## Environment Variables

See `.env.example` for required keys. Key services:
- `DATABASE_URL` - Neon PostgreSQL
- `QDRANT_URL` / `QDRANT_API_KEY` - Vector database
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` - LLM provider (NVIDIA NIM)
- `MEM0_API_KEY` - Memory service
- `LIVEKIT_*` - Voice infrastructure
- `COMPOSIO_API_KEY` - Integration platform
- Stack Auth keys (`NEXT_PUBLIC_STACK_*`, `STACK_SECRET_SERVER_KEY`)
