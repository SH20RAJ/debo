# Debo — Your Private Memory OS

<p align="center">
  <img src="./public/logo-text.png" alt="Debo" width="200" />
</p>

> Capture anything. Ask your past. Trust every answer.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Hono](https://img.shields.io/badge/API-Hono-E36002?logo=hono)](https://hono.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## What is Debo?

Debo is a **private AI memory operating system**. It turns your writing, voice notes, files, and connected apps into a source-backed memory graph. When you ask Debo a question, every answer links back to the exact source — a voice note, journal entry, email, or document.

### Core Features

- **Source-Backed Answers** — Every answer Debo gives has citations you can verify
- **Multimodal Capture** — Process text, voice, files (PDF/images), and connected apps
- **Voice Capture** — Real-time voice interface powered by LiveKit
- **Character Graph** — People mentioned in your memories become editable profiles
- **Connectors** — Import from Gmail, Calendar, Notion (manual/explicit import only)
- **Debo Mail** — Internal Debo-to-Debo messaging with memory integration
- **Private by Design** — Your data stays yours. No training on your memories.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Dashboard** | Next.js 16 (App Router), React 19 |
| **API Backend** | Hono (Bun) |
| **AI Providers** | NVIDIA NIM / OpenAI / Anthropic via Vercel AI SDK |
| **Database** | Neon (PostgreSQL) via Drizzle ORM |
| **Vector DB** | Qdrant |
| **Media Storage** | Cloudflare R2 |
| **Auth** | Stack Auth |
| **Voice** | LiveKit |
| **Deployment** | Cloudflare Workers (web/app), Railway (API/agents) |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  apps/web   │     │  apps/app    │     │ apps/agents  │
│  Landing    │     │  Dashboard   │────▶│ AI Service   │
│  (CF Worker)│     │  (CF Worker) │     │ (Railway)    │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │ HTTP
                    ┌──────▼───────┐
                    │  apps/api    │
                    │  Hono Backend│
                    │  (Bun)       │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼────┐ ┌────▼─────┐ ┌────▼────┐
        │ Neon PG  │ │ Qdrant   │ │ R2      │
        │ (Drizzle)│ │ (Vector) │ │ (Media) │
        └──────────┘ └──────────┘ └─────────┘
```

**Key rule:** `apps/app` (Cloudflare Worker) is lightweight UI only. All product logic, DB access, and AI orchestration goes through `apps/api` or `apps/agents`.

## Monorepo Structure

```bash
debo/
├── apps/
│   ├── web/              # Public landing page (debo.life)
│   ├── app/              # Dashboard UI (app.debo.life) — CF Worker
│   ├── api/              # Product backend — Hono, auth, DB, APIs
│   ├── agents/           # AI intelligence service (standalone)
│   └── voice-worker/     # Real-time voice agent (LiveKit)
└── packages/
    ├── db/               # Drizzle schema, Neon DB client, migrations
    ├── ai/               # AI SDK wrappers, embeddings, extraction
    ├── memory/           # Source-backed retrieval, citations, chunking
    ├── storage/          # Cloudflare R2 upload/download helpers
    ├── config/           # Environment validation, constants
    ├── types/            # Shared TypeScript types and Zod schemas
    ├── shared/           # Shared validators and error classes
    └── ui/               # Shared React components (shadcn/ui)
```

## Getting Started

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env.local

# Run dashboard
bun run dev

# Run API backend
bun run dev:api

# Run landing page
bun run dev:web
```

Then open [http://localhost:3000](http://localhost:3000)

## Data Flow

1. **Capture** → Source created (journal, voice, file, connector import)
2. **Process** → Chunked, parsed, entities extracted, summarized
3. **Store** → Chunks in Neon + embeddings in Qdrant
4. **Ask** → Semantic + structured retrieval from both stores
5. **Answer** → Grounded response with source citations

## Design Philosophy: Editorial Calm

- **Typography-First** — Large, readable headings; warm aesthetics
- **Warm Canvas** — Cream (`#f7f7f4`) and warm ink (`#26251e`), no pure black/white
- **Minimal UI** — 1px hairlines, generous whitespace, no heavy shadows
- **Source Trust** — Every answer shows where it came from

## License

MIT © [SH20RAJ](https://github.com/SH20RAJ)
