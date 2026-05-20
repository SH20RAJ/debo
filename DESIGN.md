# Debo Design & Architecture

Debo is a **private AI memory operating system**, architected for source-backed contextual recall with edge-fast UI.

## 1. Monorepo Architecture

Debo is built as a **Bun monorepo** with strict separation of concerns.

### Directory Structure

```bash
debo/
├── apps/
│   ├── web/              # Public landing page (debo.life) — CF Worker
│   ├── app/              # Product dashboard UI (app.debo.life) — CF Worker
│   ├── api/              # Product backend — Hono, auth, DB, APIs
│   ├── agents/           # AI intelligence service (standalone)
│   └── voice-worker/     # Real-time voice interaction (LiveKit)
└── packages/
    ├── db/               # Drizzle schema, Neon DB client, migrations
    ├── ai/               # AI SDK wrappers, embeddings, extraction
    ├── memory/           # Source-backed retrieval, citations, chunking
    ├── storage/          # Cloudflare R2 upload/download helpers
    ├── config/           # Shared environment and constants
    ├── types/            # Shared TypeScript types and Zod schemas
    ├── shared/           # Shared validators and error classes
    └── ui/               # Shared UI components (shadcn/ui)
```

### Package Dependency Graph

```mermaid
graph TD
    App[apps/app] -->|HTTP| API[apps/api]
    
    API --> DB[@debo/db]
    API --> Memory[@debo/memory]
    API --> Storage[@debo/storage]
    API -->|optional| Agents[apps/agents]
    
    Agents --> AI[@debo/ai]
    Agents --> Memory
    Agents --> DB
    
    Memory --> DB
    
    App --> UI[@debo/ui]
    Web[apps/web] --> UI
```

**Critical:** `apps/app` does NOT directly import `@debo/db`, `@debo/memory`, or `@debo/ai` for production API logic. It calls `apps/api` via HTTP. This keeps the Cloudflare Worker bundle under 10MiB.

## 2. Design Philosophy: Editorial Calm

Debo follows a design philosophy focused on reducing cognitive load and fostering reflection.

### Core Principles

- **Typography-First**: Use large, readable headings and JetBrains Mono for metadata.
- **Warm Aesthetics**: No pure blacks or whites. Use cream canvas (`#f7f7f4`) and warm ink (`#26251e`).
- **Tactile UI**: Minimal depth without heavy shadows. Use 1px hairlines for separation.
- **Generous Rhythm**: Maintain consistent vertical rhythm (80px) between major sections.

## 3. Technical Stack

- **Runtime**: Bun
- **Dashboard**: Next.js 16 (App Router), React 19
- **Backend API**: Hono
- **AI Providers**: NVIDIA NIM / OpenAI / Anthropic via Vercel AI SDK
- **Database**: Neon (PostgreSQL) via Drizzle ORM + Qdrant (Vector)
- **Media Storage**: Cloudflare R2
- **Auth**: Stack Auth
- **Real-time Voice**: LiveKit
- **Deployment**: Cloudflare Workers (web/app), Railway/Fly.io (API/agents)
