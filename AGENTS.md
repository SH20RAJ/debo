# AGENTS.md

You are a TypeScript developer working on the Debo monorepo. You follow strict TypeScript practices and consult up-to-date documentation before making changes.

## CRITICAL ARCHITECTURE RULES

1. **NEVER add Mastra, LangChain, LangGraph, Composio SDK, Mem0 SDK, CrewAI, or any heavy AI orchestration framework to `apps/app`.** The `apps/app` dashboard is deployed to Cloudflare Workers with a strict ~10MiB bundle limit. Heavy AI frameworks (like `@mastra/core` at 57MB) will break the build.

2. **`apps/app`** is a lightweight Next.js dashboard that calls `apps/api` via HTTP. It contains UI, route pages, and lightweight server actions only.

3. **`apps/api`** is the real product backend (Hono). It owns auth, DB access, permissions, and all product APIs.

4. **`apps/agents`** is the standalone AI intelligence service. If heavy orchestration is needed, it belongs here — deployed to Railway/Fly.io, NOT Cloudflare.

5. **`apps/app` should NOT directly import from `@debo/db`, `@debo/memory`, or `@debo/ai`** in production API routes. It should call `apps/api` instead.

## Project Overview

Debo is a **private AI memory OS** — a system that captures voice, text, files, and connectors into a source-backed memory graph. Every answer Debo gives links back to the exact source. The product motto: "Capture anything. Ask your past. Trust every answer."

## Commands

```bash
bun install          # Install all workspace dependencies
bun run dev          # Start dashboard dev server
bun run dev:web      # Start landing page dev server
bun run dev:api      # Start API dev server
bun run build:web    # Build landing page
bun run build:app    # Build dashboard
bun run deploy:web   # Deploy landing to Cloudflare
bun run deploy:app   # Deploy dashboard to Cloudflare
bun run deploy:all   # Deploy all services
bun run db:push      # Push DB schema changes
```

## Monorepo Structure

This is a **Bun monorepo** with apps and shared packages.

### Apps

| Folder              | Description                                                        | Deployment          |
| ------------------- | ------------------------------------------------------------------ | ------------------- |
| `apps/web`          | Public landing page (debo.life)                                    | Cloudflare Worker   |
| `apps/app`          | Product dashboard — lightweight UI only                            | Cloudflare Worker   |
| `apps/api`          | Product backend — Hono, auth, DB, all product APIs                 | Bun / Railway       |
| `apps/agents`       | AI intelligence service — heavy orchestration if needed            | Railway / Fly.io    |
| `apps/voice-worker` | LiveKit real-time voice worker                                     | Dedicated server    |

### Shared Packages

| Package           | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `@debo/db`        | Drizzle schema, Neon DB client, migrations             |
| `@debo/ai`        | AI SDK wrappers, embeddings, extraction helpers        |
| `@debo/memory`    | Source-backed retrieval, citations, chunking            |
| `@debo/storage`   | Cloudflare R2 upload/download helpers                  |
| `@debo/config`    | Env validation, shared constants, runtime config       |
| `@debo/types`     | Shared TypeScript types and Zod schemas                |
| `@debo/shared`    | Shared validators, error classes, constants            |
| `@debo/ui`        | Shared React UI components (shadcn/ui)                 |

### Workspace Package Usage

When writing backend code in `apps/api`, import shared packages:
```ts
import { db } from "@debo/db";
import { sources, memoryChunks } from "@debo/db/schema";
import { getRelevantContext, buildCitation } from "@debo/memory";
import { getPresignedUploadUrl } from "@debo/storage";
```

### Models

- **Model format:** Use the `provider/model-name` format (e.g. `openai/gpt-4o`).
- **Provider list:** See `packages/config/src/providers.ts`.
- **Default models:** See `packages/ai/src/openai.ts`.
- **User provider storage:** DB schema at `packages/db/src/schema.ts`, managed by `apps/app/src/actions/settings.ts`.

## Boundaries

### Always do

- Keep `apps/app` lightweight (no heavy AI deps)
- Put API logic in `apps/api`
- Put heavy AI orchestration in `apps/agents`
- Use schemas for tool inputs and outputs
- Scope all DB queries by `userId` / `workspaceId`
- Run `bun run typecheck` to verify changes compile

### Never do

- Never add Mastra/LangChain/CrewAI to `apps/app`
- Never commit `.env` files or secrets
- Never modify `node_modules`
- Never hardcode API keys
- Never bypass auth in API routes
- Never let AI decide permissions
- Never expose private R2 files with permanent public URLs

## Resources

- [Hono Documentation](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Stack Auth](https://stack-auth.com)

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "debo".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project.
<!-- stripe-projects-cli managed:agents-md:end -->
