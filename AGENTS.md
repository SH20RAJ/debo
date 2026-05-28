# AGENTS.md

You are a TypeScript developer working on the Debo monorepo. You follow strict TypeScript practices and consult up-to-date documentation before making changes.

## ARCHITECTURE (Simplified)

Debo has **two deployables**:

| App | URL | Description | Deploy Target |
|-----|-----|-------------|---------------|
| `apps/landing-page` | debo.life | Public landing page | Cloudflare Worker |
| `apps/website` | app.debo.life | Full-stack product: UI + API + AI | Netlify |

**`apps/website` is the full product** — it contains:
- Dashboard UI (Next.js pages + components)
- Backend API routes (`/api/*`)
- LangChain + LangGraph intelligence (`src/server/langgraph/`)
- Memory retrieval, ingestion, citations
- Debo Mail, Voice, Connectors, Vault
- Auth (Stack Auth)
- DB access (`@debo/db`)

**`apps/website` is NOT a Cloudflare Worker.** LangChain/LangGraph are too large for CF Worker bundle limits. Deploy it on Netlify with a Node runtime.

## DEPRECATED — Do Not Use

- **Mastra** — removed, replaced by LangChain/LangGraph
- **CopilotKit** — removed, replaced by custom UI
- **apps/api** — merged into `apps/website` API routes
- **apps/agents** — merged into `apps/website/src/server/langgraph/`
- **apps/voice-worker** — merged into `apps/website/src/app/api/voice/`

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
bun run dev          # Start product website dev server
bun run dev:landing  # Start landing page dev server
bun run dev:website  # Start product website dev server
bun run build:landing # Build landing page
bun run build:website # Build product website
bun run db:push      # Push DB schema changes
```

## Key Directories

```
apps/website/src/
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
- Keep all product logic in `apps/website`
- Use LangGraph for AI orchestration
- Scope all DB queries by `userId`
- Use Zod for validation
- Run `bun run typecheck` to verify

### Never do
- Never add Mastra or CopilotKit
- Never deploy `apps/website` as a CF Worker
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
