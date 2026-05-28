# Debo — Your Private Memory OS

<p align="center">
  <img src="./apps/landing-page/public/debo.png" alt="Debo" width="200" />
</p>

> Capture anything. Ask your past. Trust every answer.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/AI-LangGraph-1C3C3C)](https://docs.langchain.com/oss/javascript/langgraph)
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
| **Landing** | `apps/landing-page` — Next.js 16 (App Router), React 19 |
| **Product App** | `apps/website` — Next.js 16 full-stack UI + API routes |
| **AI Orchestration** | LangChain + LangGraph |
| **AI Providers** | NVIDIA NIM primary, OpenAI-compatible APIs |
| **Database** | Neon (PostgreSQL) via Drizzle ORM |
| **Vector DB** | Qdrant |
| **Media Storage** | Cloudflare R2 |
| **Auth** | Stack Auth |
| **Voice** | LiveKit |
| **Deployment** | `apps/landing-page` on Cloudflare Workers; `apps/website` on Vercel |

## Architecture

```
┌───────────────────────┐       ┌─────────────────────────────┐
│ apps/landing-page     │       │ apps/website                │
│ Landing               │       │ Full-stack Next.js product  │
│ debo.life             │       │ app.debo.life               │
└───────────────────────┘       │ UI + API routes + AI        │
                         │  LangChain/LangGraph        │
                         │  Node runtime               │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                   ┌─────▼────┐  ┌─────▼────┐   ┌─────▼────┐
                   │ Neon PG  │  │ Qdrant   │   │ R2       │
                   │ Drizzle  │  │ Vector   │   │ Media    │
                   └──────────┘  └──────────┘   └──────────┘
```

**Key rule:** `apps/website` is the full product and must run on Vercel's Node runtime. Do not deploy it as a Cloudflare Worker or to Netlify; LangChain/LangGraph and the product API surface live inside its Next.js app and route handlers.

## Monorepo Structure

```bash
debo/
├── apps/
│   ├── landing-page/     # Public landing page (debo.life) — Cloudflare Worker
│   └── website/          # Full-stack product (app.debo.life) — Vercel
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

# Run landing page
bun run dev:landing

# Run product website explicitly
bun run dev:website
```

Then open [http://localhost:3000](http://localhost:3000)

## Deployment

```bash
# Required for apps/website Vercel deploys
export VERCEL_TOKEN="your-vercel-token"        # https://vercel.com/account/settings/tokens
# Optional explicit project link (otherwise apps/website/.vercel/project.json is used)
export VERCEL_ORG_ID="team_xxx"
export VERCEL_PROJECT_ID="prj_xxx"

# Deploy landing page to Cloudflare and website to Vercel
bun run deploy
```

First-time setup (per machine):

```bash
cd apps/website
bun run vercel:link        # picks an existing project or creates a new one
bun run vercel:env:pull    # writes .env.local from project env
```

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
