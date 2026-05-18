# Debo Design & Architecture

Debo is a **Privacy-First Life Intelligence System**, architected for edge-latency and deep contextual recall.

## 1. Monorepo Architecture

Debo is built as a **Bun monorepo** to ensure strict separation of concerns and optimized deployments.

### Directory Structure

```bash
debo/
├── apps/
│   ├── web/              # Public landing page (debo.life)
│   ├── app/              # Core product dashboard (app.debo.life)
│   ├── api/              # Standalone API service
│   ├── agents/           # Mastra AI agent service
│   └── voice-worker/     # Real-time voice interaction (LiveKit)
└── packages/
    ├── db/               # Drizzle schema, DB client, migrations
    ├── ai/               # AI SDK wrappers, embeddings, extraction logic
    ├── memory/           # Life graph and context retrieval
    ├── config/           # Shared environment and constants
    ├── types/            # Shared TypeScript types and Zod schemas
    └── ui/               # Shared UI components (shadcn/ui)
```

### Package Dependency Graph

```mermaid
graph TD
    App[apps/app] --> DB[@debo/db]
    App --> AI[@debo/ai]
    App --> Memory[@debo/memory]
    App --> UI[@debo/ui]
    App --> Config[@debo/config]
    
    Web[apps/web] --> UI
    Web --> Config
    
    Agents[apps/agents] --> AI
    Agents --> Memory
    Agents --> DB
    
    Memory --> AI
    Memory --> DB
```

## 2. Design Philosophy: Editorial Calm

Debo follows a design philosophy focused on reducing cognitive load and fostering reflection.

### Core Principles

- **Typography-First**: Use large, readable headings and JetBrains Mono for metadata.
- **Warm Aesthetics**: No pure blacks or whites. Use cream canvas (`#f7f7f4`) and warm ink (`#26251e`).
- **Tactile UI**: Minimal depth without heavy shadows. Use 1px hairlines for separation.
- **Generous Rhythm**: Maintain consistent vertical rhythm (80px) between major sections.

## 3. Technical Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router), React 19
- **Orchestration**: Mastra (Agents & Workflows)
- **Database**: Neon (PostgreSQL) + Qdrant (Vector)
- **Auth**: Stack Auth
- **Real-time**: LiveKit (Voice)
- **Deployment**: Cloudflare Workers (OpenNext)
