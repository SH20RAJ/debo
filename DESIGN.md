# Debo Design & Architecture

Debo is a private AI memory operating system, architected for source-backed contextual recall with a calm, focused interface.

## 1. Monorepo Architecture

Debo has two deployable applications:

```bash
debo/
├── apps/
│   ├── landing-page/     # Public landing page (debo.life) - Cloudflare Worker
│   └── website/          # Full-stack product (app.debo.life) - Netlify Node runtime
└── packages/
    ├── db/               # Drizzle schema, Neon DB client, migrations
    ├── config/           # Shared environment and constants
    ├── types/            # Shared TypeScript types and Zod schemas
    ├── shared/           # Shared validators and error classes
    └── ui/               # Shared UI components
```

Deprecated split services (`apps/api`, `apps/agents`, and `apps/voice-worker`) have been merged into `apps/website`.

## 2. Runtime Boundaries

```mermaid
graph TD
    Landing[apps/landing-page] --> UI[@debo/ui]
    Website[apps/website] --> UI
    Website --> DB[@debo/db]
    Website --> LangGraph[LangChain + LangGraph]
    Website --> R2[Cloudflare R2]
    Website --> Qdrant[Qdrant]
```

`apps/landing-page` is the only Cloudflare Worker deployable. It uses OpenNext Cloudflare and Wrangler.

`apps/website` is the full product. It owns UI, Next.js route handlers, auth, server modules, LangChain/LangGraph orchestration, mail, voice, connectors, and memory retrieval. It must deploy to a Node runtime such as Netlify, Vercel, Railway, or Fly.io.

## 3. Design Philosophy: Editorial Calm

Debo should reduce cognitive load and support reflection.

- **Typography-first**: readable headings, clear hierarchy, restrained metadata.
- **Warm aesthetics**: cream canvas (`#f7f7f4`) and warm ink (`#26251e`), no harsh pure black/white.
- **Minimal depth**: 1px hairlines and restrained shadows.
- **Generous rhythm**: consistent vertical spacing between major sections.

## 4. Technical Stack

- **Runtime**: Bun and Node.js 22 for the product website
- **Landing page**: Next.js 16, React 19, OpenNext Cloudflare, Wrangler
- **Product website**: Next.js 16 App Router, React 19, Netlify
- **Backend API**: Next.js route handlers in `apps/website`
- **AI orchestration**: LangChain + LangGraph
- **AI providers**: NVIDIA NIM and OpenAI-compatible APIs
- **Database**: Neon PostgreSQL via Drizzle ORM
- **Vector search**: Qdrant
- **Media storage**: Cloudflare R2
- **Auth**: Stack Auth
- **Realtime voice**: LiveKit
