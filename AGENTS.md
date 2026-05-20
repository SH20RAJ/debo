# AGENTS.md

You are a TypeScript developer working on the Debo monorepo. You follow strict TypeScript practices and consult up-to-date documentation before making changes.

## ARCHITECTURE (Simplified)

Debo has **two deployables**:

| App | URL | Description | Deploy Target |
|-----|-----|-------------|---------------|
| `apps/web` | debo.life | Public landing page | Cloudflare / Vercel |
| `apps/app` | app.debo.life | Full-stack product: UI + API + AI | Vercel / Railway |

**`apps/app` is the full product** — it contains:
- Dashboard UI (Next.js pages + components)
- Backend API routes (`/api/*`)
- LangChain + LangGraph intelligence (`src/server/langgraph/`)
- Memory retrieval, ingestion, citations
- Debo Mail, Voice, Connectors, Vault
- Auth (Stack Auth)
- DB access (`@debo/db`)

**`apps/app` is NOT a Cloudflare Worker.** LangChain/LangGraph are too large for CF Worker bundle limits. Deploy on Vercel, Railway, or Fly.io with Node runtime.

## DEPRECATED — Do Not Use

- **Mastra** — removed, replaced by LangChain/LangGraph
- **CopilotKit** — removed, replaced by custom UI
- **apps/api** — merged into `apps/app` API routes
- **apps/agents** — merged into `apps/app/src/server/langgraph/`
- **apps/voice-worker** — merged into `apps/app/api/voice/`

## Project Overview

Debo is a **private AI memory OS** — captures voice, text, files, and connectors into a source-backed memory graph. Every answer links back to the exact source.

**Motto:** "Capture anything. Ask your past. Trust every answer."

## AI Stack

```
LangChain  = tools, model providers, retrievers, document loaders
LangGraph  = agent orchestration, memory flows, Ask Debo pipeline
NVIDIA NIM = primary LLM inference (Nemotron 70B, Llama 3.3, DeepSeek V4)
```

LangGraph powers:
- Ask Debo (classify → retrieve → generate → cite)
- Memory extraction
- Connector actions
- Post-call summarization

## Commands

```bash
bun install          # Install all workspace dependencies
bun run dev          # Start dashboard dev server
bun run dev:web      # Start landing page dev server
bun run build:web    # Build landing page
bun run build:app    # Build dashboard
bun run db:push      # Push DB schema changes
```

## Key Directories

```
apps/app/src/
  app/                    # Next.js pages + API routes
    dashboard/            # Dashboard pages
    api/                  # Backend API routes
  components/             # React components
  server/                 # Server-side logic
    langgraph/            # LangGraph intelligence
      graphs/             # Compiled graphs
      nodes/              # Individual nodes
      tools/              # LangChain tools
      schemas/            # Zod schemas
  lib/                    # Utilities, auth, API client
  stack/                  # Stack Auth config
```

## Shared Packages

| Package | Description |
|---------|-------------|
| `@debo/db` | Drizzle schema, Neon DB client |
| `@debo/ui` | Shared React UI components |
| `@debo/types` | Shared TypeScript types |

## Boundaries

### Always do
- Keep all product logic in `apps/app`
- Use LangGraph for AI orchestration
- Scope all DB queries by `userId`
- Use Zod for validation
- Run `bun run typecheck` to verify

### Never do
- Never add Mastra or CopilotKit
- Never deploy `apps/app` as a CF Worker
- Never commit `.env` files
- Never hardcode API keys
- Never bypass auth in API routes
- Never let AI decide permissions
- Never expose private R2 URLs permanently

## Resources
- [LangGraph JS](https://docs.langchain.com/oss/javascript/langgraph)
- [LangChain JS](https://js.langchain.com)
- [Next.js](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Stack Auth](https://stack-auth.com)
- [NVIDIA NIM](https://integrate.api.nvidia.com)

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "debo".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project.
<!-- stripe-projects-cli managed:agents-md:end -->
