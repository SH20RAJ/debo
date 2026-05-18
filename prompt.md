You are working inside the Debo repository.

Goal:
Convert this existing single Debo repo into a clean production-ready Bun monorepo with separated deployable apps and shared packages.

The final result must support:

- `debo.life` as the public landing page.
- Cloudflare Worker/project default name for the landing page must be `debo`.
- Product dashboard/app must be separated from landing page.
- Backend/API/agents/voice services must be separated as much as safely possible.
- Shared DB, AI, memory, config, types, and UI code must live in packages.
- `bun run deploy` at the repo root must deploy all deployable services in the correct order.
- Services must be securely coupled, preferably through Cloudflare service bindings where possible.
- Do not expose internal services publicly unless necessary.
- Do not break existing auth, dashboard, routes, API routes, Mastra agents, DB schema, Cloudflare/OpenNext deploy flow, or env handling.
- Make every change carefully, test after each major step, and commit after every stable phase.

Use all available OpenClaude / Claude Code capabilities:
- Use multiple parallel subagents.
- Use codebase search aggressively.
- Use planning mode before editing.
- Use git diff after every phase.
- Use validation agents after migration.
- Use specialized agents for architecture, migration, Cloudflare deployment, Mastra, DB/env, frontend routes, and QA.
- Do not guess APIs. Inspect files first.
- Read `AGENTS.md`, `CLAUDE.md`, `package.json`, `next.config.ts`, `open-next.config.ts`, `wrangler.jsonc`, `drizzle.config.ts`, `.env.example`, `src/app`, `src/components`, `src/actions`, `src/db`, `src/lib`, `src/mastra`, `src/workers`, and `scripts` before changing anything.
- Follow all repo rules from `AGENTS.md`.
- For Mastra work, load and follow the Mastra skill before touching Mastra files.
- Never commit secrets or `.env` files.
- Never hardcode API keys.
- Preserve behavior first, then improve structure.

Target monorepo structure:

debo/
├── apps/
│   ├── web/              # public landing page for debo.life, worker name "debo"
│   ├── app/              # product dashboard/app, app.debo.life, worker name "debo-app"
│   ├── api/              # backend API service, worker name "debo-api" if safe to extract now
│   ├── agents/           # Mastra agents/workflows/tools, worker/service name "debo-agents" if safe
│   └── voice-worker/     # LiveKit/voice worker, worker name "debo-voice" if safe
│
├── packages/
│   ├── ui/               # shared UI components/design system
│   ├── db/               # Drizzle schema, DB client, migrations/config helpers
│   ├── ai/               # model provider helpers, embeddings, ranking, AI utils
│   ├── memory/           # memory graph, vector search, Qdrant helpers
│   ├── config/           # env validation, shared constants, runtime config
│   └── types/            # shared TypeScript types and Zod schemas
│
├── docs/
├── scripts/
├── package.json
├── bun.lock
├── tsconfig.base.json
└── turbo.json or equivalent task runner config if useful

Important migration strategy:
Do this in safe phases. Do not over-extract everything in one risky move.

Phase 0 — Audit and plan:
1. Inspect the current repo structure.
2. Identify all current scripts, dependencies, path aliases, Cloudflare/OpenNext config, env variables, and route groups.
3. Write a short `docs/MONOREPO_MIGRATION_PLAN.md` with:
   - Current architecture summary
   - Target architecture
   - Migration phases
   - Risk areas
   - Validation checklist

Create subagents:
- Architecture Agent: maps current structure and decides exact package/app boundaries.
- Frontend Migration Agent: handles landing/dashboard separation.
- Backend/API Agent: handles API routes and server actions safely.
- Cloudflare Deploy Agent: handles OpenNext, Wrangler, service bindings, routes, deploy scripts.
- Mastra Agent: handles Mastra extraction only after loading Mastra skill/docs.
- DB/Env Agent: handles Drizzle/env/schema/package config.
- QA Agent: runs build/typecheck/lint and fixes breakages.

Phase 1 — Create monorepo foundation:
1. Create root Bun workspace package.json:
   - name: "debo"
   - private: true
   - workspaces: ["apps/*", "packages/*"]
2. Add root scripts:
   - dev
   - dev:web
   - dev:app
   - dev:api
   - build
   - build:web
   - build:app
   - build:api
   - typecheck
   - lint
   - db:push
   - deploy
   - deploy:web
   - deploy:app
   - deploy:api
   - deploy:agents
   - deploy:voice
3. Add `tsconfig.base.json`.
4. Update TypeScript path aliases to use:
   - `@debo/ui`
   - `@debo/db`
   - `@debo/ai`
   - `@debo/memory`
   - `@debo/config`
   - `@debo/types`
5. Keep backwards compatibility aliases temporarily if needed.

Phase 2 — Split landing page into `apps/web`:
Move the marketing-only surface into `apps/web`.

Move:
- `src/app/(marketing)` → `apps/web/src/app`
- landing components → `apps/web/src/components/landing`
- global CSS/theme files needed by landing
- public assets needed by landing
- privacy/terms/about/foundation/pitch pages if they are public marketing pages

Rules:
- `apps/web` should be public-only.
- No dashboard code.
- No private DB code unless absolutely required.
- No auth-heavy app logic unless currently required by waitlist.
- Keep SEO files: sitemap, robots, metadata.
- Ensure `debo.life` root renders landing page.

Create `apps/web/package.json` with scripts:
- dev
- build
- preview
- deploy

Create/update `apps/web/wrangler.jsonc`:
- Cloudflare worker name must be `debo`
- route/custom domain should target `debo.life` and optionally `www.debo.life`
- use OpenNext Cloudflare setup if current repo already uses it
- preserve compatibility flags needed by existing code

Phase 3 — Split product dashboard into `apps/app`:
Move product/auth/dashboard/chat/editor app into `apps/app`.

Move:
- `src/app/(dashboard)` → `apps/app/src/app/(dashboard)`
- `src/app/(auth)` → `apps/app/src/app/(auth)`
- `src/app/(chat)` → `apps/app/src/app/(chat)`
- `src/app/editor` → `apps/app/src/app/editor`
- dashboard/chat/journal/editor components → `apps/app/src/components`
- auth stack helpers if app-specific
- product-specific layouts/loading pages

Keep API routes temporarily inside `apps/app/src/app/api` if moving them to `apps/api` would break cookies, auth, server actions, or route handlers. Mark remaining extraction work in docs.

Create `apps/app/wrangler.jsonc`:
- worker name `debo-app`
- route/custom domain `app.debo.life`
- if API is extracted, bind `API` service to `debo-api`

Phase 4 — Create shared packages:
Create packages and move code gradually.

`packages/ui`:
- shared primitive UI components
- theme provider/toggle if shared
- shadcn/ui config if needed

`packages/db`:
- Drizzle schema
- DB client
- migrations/helpers
- drizzle config if possible

`packages/ai`:
- model provider config
- OpenAI/NVIDIA/Anthropic helpers
- embeddings
- ranking
- extraction helpers

`packages/memory`:
- memory extraction/query/store logic
- vector/Qdrant search helpers
- life graph/timeline logic if shared

`packages/config`:
- env validation
- runtime constants
- Cloudflare/env typing helpers

`packages/types`:
- shared TS types
- Zod schemas
- insight/chat/journal/memory types

Each package must have:
- package.json
- tsconfig.json
- exports field
- build/typecheck script where needed

Update imports everywhere to use package imports instead of fragile relative imports.

Phase 5 — Extract backend/API only if safe:
Analyze `src/app/api` routes.

If safe:
- Create `apps/api`
- Move route logic into Hono/itty-router/standard Worker handlers or keep Next route handlers if Cloudflare/OpenNext is needed.
- Worker name: `debo-api`
- Public route only if required: `api.debo.life`
- Prefer private internal service binding for app → api.
- Implement CORS only for known origins:
  - `https://debo.life`
  - `https://www.debo.life`
  - `https://app.debo.life`
- Add auth checks at API boundary.
- Never expose internal admin/agent endpoints publicly.

If unsafe:
- Keep API in `apps/app`
- Create `docs/API_EXTRACTION_TODO.md`
- Add root scripts that skip deploy:api safely or print a helpful message.

Phase 6 — Extract Mastra agents safely:
Before touching Mastra:
- Load the Mastra skill.
- Read current Mastra files.
- Read provider registry instructions.
- Run provider registry scripts if present.
- Do not guess model names.
- Do not hardcode providers or keys.

If safe:
- Move `src/mastra` → `apps/agents/src/mastra`
- Worker/service name: `debo-agents`
- Preserve registration in `src/mastra/index.ts` equivalent.
- Create package/app scripts:
  - dev
  - build
  - deploy
- Connect API/app to agents using Cloudflare service binding where possible.

If unsafe:
- Keep Mastra in `apps/app` or package location temporarily.
- Document exact blockers.

Phase 7 — Extract voice worker if safe:
Move:
- `src/workers/voice-agent.ts` → `apps/voice-worker/src/index.ts`

Create:
- `apps/voice-worker/package.json`
- `apps/voice-worker/wrangler.jsonc`
- worker name `debo-voice`

Preserve LiveKit env handling and security.

Phase 8 — Cloudflare/OpenNext deployment:
Preserve existing OpenNext Cloudflare behavior.

Root `bun run deploy` must deploy in correct order:
1. packages build/typecheck
2. web
3. app
4. api if present
5. agents if present
6. voice if present

If one optional service is not extracted yet, script should not fail unnecessarily. It should either skip with a clear message or only deploy existing workspaces.

Add root scripts similar to:

"deploy": "bun run build && bun run deploy:web && bun run deploy:app && bun run deploy:api && bun run deploy:agents && bun run deploy:voice"

But implement it robustly so missing optional apps do not break deployment during phased migration.

Create `scripts/deploy-all.mjs` if needed:
- Detect existing apps.
- Run each deploy script.
- Stop on real failures.
- Print clear logs.

Phase 9 — Update config and docs:
Update:
- README.md
- AGENTS.md if paths changed
- CLAUDE.md if needed
- docs/ARCHITECTURE.md
- docs/DEPLOYMENT.md or create it
- `.env.example`
- Cloudflare env docs
- path alias docs

Document:
- How to run landing locally
- How to run app locally
- How to run all services
- How to deploy all services
- Domain mapping
- Service binding architecture
- Env variable ownership by app/package
- Which services are public vs private

Phase 10 — Validation:
Run these commands and fix all errors:

- `bun install`
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- `bun run build:web`
- `bun run build:app`
- `bun run db:push` only if safe and non-destructive
- `bun run deploy --dry-run` or equivalent if supported
- `wrangler deploy --dry-run` where possible
- `git diff --stat`
- `git status`

Also verify manually:
- Landing page works at `/`
- Marketing pages work
- Dashboard routes still resolve
- Auth pages still resolve
- API routes still compile
- DB imports still work
- Mastra still builds
- No secret is committed
- No `.env` file is committed
- No broken package import exists
- No duplicate incompatible React/Next versions across workspaces

Commit policy:
Create commits after stable phases:

1. `chore: add bun monorepo workspace foundation`
2. `refactor: split landing page into web app`
3. `refactor: split product app from marketing site`
4. `refactor: extract shared packages`
5. `refactor: prepare api and worker service boundaries`
6. `chore: add monorepo deploy orchestration`
7. `docs: document monorepo architecture and deployment`

Only commit if build/typecheck passes for that phase.

Important constraints:
- Do not delete existing working code unless it has been moved and imports are updated.
- Use `git mv` where possible.
- Preserve existing UI and content.
- Preserve existing landing design.
- Preserve current product behavior.
- Do not rewrite the whole app.
- Do not introduce unnecessary frameworks.
- Do not expose private services publicly.
- Do not change product copy unless needed for routes/imports.
- Do not change database schema unless required for imports/config.
- Do not run destructive DB migrations.
- Do not deploy to production unless credentials exist and scripts are already expected to deploy.
- If a deploy requires manual Cloudflare domain binding or secrets, create clear docs and leave safe scripts.

Expected final output:
At the end, provide:

1. Summary of the new monorepo structure.
2. List of files moved.
3. List of packages created.
4. List of apps created.
5. Final root commands:
   - `bun install`
   - `bun run dev:web`
   - `bun run dev:app`
   - `bun run build`
   - `bun run deploy`
6. Any manual Cloudflare/domain/env steps still required.
7. Any services intentionally left unextracted and why.
8. Test/build results.
9. Git commits created.