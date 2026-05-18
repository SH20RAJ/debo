# Debo Monorepo Migration Plan

## Current Architecture

- **Single Next.js 16 app** with App Router
- **Deployed to Cloudflare Workers** via OpenNext (`@opennextjs/cloudflare`)
- **Single path alias:** `@/*` → `./src/*` (581 usages, 250 files)
- **Auth:** Stack Auth (`@stackframe/stack`)
- **DB:** Drizzle ORM + PostgreSQL (Neon)
- **AI:** Mastra framework, OpenAI/Anthropic/NVIDIA providers
- **Voice:** LiveKit (standalone `voice/` project + in-app voice agent)
- **Rich Text:** Plate.js + TipTap editors

### Route Groups
| Group | URLs | Auth | Purpose |
|---|---|---|---|
| `(marketing)` | `/`, `/about`, `/foundation`, `/pitch`, `/privacy`, `/terms` | Public | Landing pages |
| `(auth)` | `/join` | Public | Waitlist / sign-in |
| `(chat)` | `/talk` | Public (blocked prod) | Standalone voice chat |
| `(dashboard)` | `/dashboard/*` | Private | Full app |
| `editor` | `/editor` | Public (blocked prod) | Rich text editor |
| `handler` | `/handler/*` | Public | Stack Auth callbacks |
| `api` | `/api/*` | Mixed | Server APIs |

### Dependencies
- 80+ npm packages including heavy ones: Next.js, React 19, Plate.js (60+ plugins), TipTap (20+ extensions), Mastra, LiveKit, AI SDKs, Drizzle, etc.

## Target Architecture

```
debo/
├── apps/
│   ├── web/              # Public landing page (debo.life), worker: "debo"
│   ├── app/              # Product dashboard (app.debo.life), worker: "debo-app"
│   ├── api/              # Backend API (api.debo.life), worker: "debo-api" [Phase 5]
│   ├── agents/           # Mastra agents (private), worker: "debo-agents" [Phase 6]
│   └── voice-worker/     # LiveKit voice (private), worker: "debo-voice" [Phase 7]
│
├── packages/
│   ├── ui/               # Shared UI components + design system
│   ├── db/               # Drizzle schema, client, migrations
│   ├── ai/               # Model providers, embeddings, ranking
│   ├── memory/           # Memory graph, vector search, Qdrant
│   ├── config/           # Env validation, shared constants
│   └── types/            # Shared TS types and Zod schemas
│
├── docs/
├── scripts/
├── package.json          # Bun workspace root
├── bun.lock
├── tsconfig.base.json
└── bun.build.ts          # (optional) Bun build config
```

## Migration Phases

### Phase 0 — Audit & Plan ✅
- [x] Inspect repo structure
- [x] Map routes, configs, dependencies, imports
- [x] Write this migration plan

### Phase 1 — Create Monorepo Foundation
- [ ] Root `package.json` with Bun workspaces
- [ ] Root `tsconfig.base.json`
- [ ] Root scripts (dev, build, deploy per app)
- [ ] Stub app/package directories with `package.json` files
- [ ] Verify `bun install` resolves workspaces

### Phase 2 — Extract Shared Packages
- [ ] `packages/db` — schema, client, migrations
- [ ] `packages/ai` — model providers, embeddings, ranking
- [ ] `packages/memory` — memory extraction, vector search
- [ ] `packages/config` — env, constants
- [ ] `packages/types` — shared types
- [ ] `packages/ui` — shared UI components
- [ ] Update imports across codebase

### Phase 3 — Split Landing Page (`apps/web`)
- [ ] Move `(marketing)` route group
- [ ] Move landing components
- [ ] Move SEO files (sitemap, robots)
- [ ] Move public assets
- [ ] Create `wrangler.jsonc` (worker name: `debo`)
- [ ] Verify landing page builds

### Phase 4 — Split Product App (`apps/app`)
- [ ] Move `(dashboard)`, `(auth)`, `(chat)`, `editor`, `handler` route groups
- [ ] Move dashboard components
- [ ] Move server actions
- [ ] Move API routes (temporarily)
- [ ] Create `wrangler.jsonc` (worker name: `debo-app`)
- [ ] Verify app builds

### Phase 5 — Extract API (`apps/api`) [if safe]
- [ ] Analyze API route dependencies
- [ ] Move API routes to standalone service
- [ ] Service bindings from app → api
- [ ] CORS config for known origins

### Phase 6 — Extract Mastra Agents (`apps/agents`) [if safe]
- [ ] Load Mastra skill
- [ ] Move `src/mastra` → `apps/agents`
- [ ] Preserve agent registration
- [ ] Service bindings

### Phase 7 — Extract Voice Worker (`apps/voice-worker`) [if safe]
- [ ] Move `src/workers/voice-agent.ts`
- [ ] Create wrangler config
- [ ] Preserve LiveKit env handling

### Phase 8 — Deployment Orchestration
- [ ] Root deploy script with correct ordering
- [ ] `scripts/deploy-all.mjs` for phased deploys
- [ ] Optional service handling (skip missing apps)

### Phase 9 — Documentation
- [ ] Update README, AGENTS.md
- [ ] Architecture docs
- [ ] Deployment docs
- [ ] Env variable ownership

### Phase 10 — Validation
- [ ] `bun install` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run build` passes
- [ ] All app builds pass individually
- [ ] No secrets committed
- [ ] No broken imports

## Risk Areas

1. **Import alias migration** — 581 `@/` imports need updating per-app
2. **OpenNext Cloudflare config** — Each app needs its own OpenNext setup
3. **Server actions** — Currently tightly coupled to Next.js route handlers
4. **Auth flow** — Stack Auth handler must work across both apps
5. **Mastra dependencies** — `serverExternalPackages` in next.config.ts
6. **Shared state** — DB client, env vars used across all layers
7. **Production gating** — `isPublicPreviewDeploy` pattern needs preserving

## Validation Checklist

- [ ] `bun install` resolves all workspaces
- [ ] `bun run build:web` builds landing page
- [ ] `bun run build:app` builds dashboard
- [ ] `bun run typecheck` passes across all packages
- [ ] Landing page renders at `/`
- [ ] Dashboard routes resolve
- [ ] Auth flow works
- [ ] API routes compile
- [ ] DB imports work
- [ ] Mastra builds
- [ ] No `.env` committed
- [ ] No broken package imports
- [ ] No duplicate React/Next versions
