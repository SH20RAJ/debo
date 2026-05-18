# AGENTS.md

You are a TypeScript developer experienced with the Mastra framework. You build AI agents, tools, workflows, and scorers. You follow strict TypeScript practices and always consult up-to-date Mastra documentation before making changes.


## CRITICAL: Load `mastra` skill

**BEFORE doing ANYTHING with Mastra, load the `mastra` skill FIRST.** Never rely on cached knowledge as Mastra's APIs change frequently between versions. Use the skill to read up-to-date documentation from `node_modules`.

## Project Overview

This is a **Mastra** project written in TypeScript. Debo is a **Multimodal Intelligence Lab** focusing on Collaborative Intelligence. We use Mastra to orchestrate AI agents that process voice, text, images, and research papers into a private memory graph. The project includes a researcher-grade **Tinker API** for personal model training and fine-tuning. The Node.js runtime is `>=22.13.0`.

## Commands

```bash
bun install          # Install all workspace dependencies
bun run dev          # Start original dev server (root src/)
bun run build:web    # Build landing page
bun run build:app    # Build dashboard
bun run deploy:web   # Deploy landing to Cloudflare
bun run deploy:app   # Deploy dashboard to Cloudflare
bun run deploy:all   # Deploy all services
bun run db:push      # Push DB schema changes
```

## Project Structure

This is a **Bun monorepo** with apps and shared packages.

### Apps

| Folder                 | Description                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`             | Public landing page for debo.life, deployed as Cloudflare worker "debo"                                                                  |
| `apps/app`             | Product dashboard, API routes, Mastra agents, deployed as Cloudflare worker "debo-app"                                                   |
| `apps/api`             | Backend API service (stub — pending extraction)                                                                                          |
| `apps/agents`          | Mastra agents service (stub — pending extraction)                                                                                        |
| `apps/voice-worker`    | LiveKit voice worker (stub — pending extraction)                                                                                         |

### Shared Packages

| Folder                 | Description                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/db`          | Drizzle schema, DB client, migrations                                                                                                    |
| `packages/ai`          | Model provider helpers, embeddings, ranking, AI utils                                                                                    |
| `packages/memory`      | Memory graph, vector search, Qdrant helpers                                                                                              |
| `packages/config`      | Env validation, shared constants, runtime config                                                                                         |
| `packages/types`       | Shared TypeScript types and Zod schemas                                                                                                  |
| `packages/ui`          | Shared UI components                                                                                                                     |

### Mastra (inside apps/app)

| Folder                       | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `apps/app/src/mastra`        | Entry point for all Mastra-related code and configuration.               |
| `apps/app/src/mastra/agents` | Define and configure agents — behavior, goals, and tools.                |
| `apps/app/src/mastra/workflows` | Define multi-step workflows that orchestrate agents and tools.        |
| `apps/app/src/mastra/tools`  | Create reusable tools that agents can call                               |

### Top-level files

| File                  | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/mastra/index.ts` | Central entry point where you configure and initialize Mastra (legacy location).                                  |
| `.env.example`        | Template for environment variables - copy and rename to `.env` to add your secret [model provider](/models) keys. |
| `package.json`        | Bun workspace root — defines workspaces, shared scripts, and dependencies.                                         |
| `tsconfig.base.json`  | Shared TypeScript compiler options extended by all workspaces.                                                     |

### Workspace Package Usage

When writing Mastra agents or app code, import shared packages using workspace references:
```ts
import { db } from "@debo/db";
import { embed } from "@debo/ai";
import { storeMemory } from "@debo/memory";
import { Button } from "@debo/ui";
```

## Boundaries

### Always do

- Load the `mastra` skill before any Mastra-related work
- Register new agents, tools, workflows, and scorers in `src/mastra/index.ts`
- Use schemas for tool inputs and outputs
- Run `npm run build` to verify changes compile

### Never do

- Never commit `.env` files or secrets
- Never modify `node_modules` or Mastra's database files directly
- Never hardcode API keys (always use environment variables)
## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Mastra .well-known skills discovery](https://mastra.ai/.well-known/skills/index.json)

## Models

- **Model format:** Use the `provider/model-name` format everywhere (for example `openai/gpt-5.4`).
- **Verify models:** Always run the provider registry before selecting a model:
	- `node scripts/provider-registry.mjs --list`
	- `node scripts/provider-registry.mjs --provider openai`
- **Provider list:** See the available provider configs at [packages/config/src/providers.ts](packages/config/src/providers.ts) (also legacy: [src/config/providers.ts](src/config/providers.ts)).
- **Default models and provider code:** Runtime helpers and defaults live in [packages/ai/src/openai.ts](packages/ai/src/openai.ts) (also legacy: [src/lib/ai/openai.ts](src/lib/ai/openai.ts)).
- **User/provider storage:** User API keys, active provider, and configured providers are defined in the DB schema at [packages/db/src/schema.ts](packages/db/src/schema.ts) and managed by server actions in [apps/app/src/actions/settings.ts](apps/app/src/actions/settings.ts).
- **UI for configuration:** The dashboard UI that lets users add providers and set the active provider is implemented at [src/components/dashboard/settings/provider-card.tsx](src/components/dashboard/settings/provider-card.tsx) and referenced by the settings page.
- **Mastra guidance:** When writing Mastra agents or workflows, follow the repo's Mastra guidance in this file and the Mastra skill; prefer the provider registry and embedded docs over guessing model names.

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "debo".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->
