# Debo Deployment Guide

## Quick Reference

```bash
# Deploy everything (packages → web → app)
bun run deploy

# Deploy individual services
bun run deploy:web    # Landing page → debo.life
bun run deploy:app    # Dashboard → app.debo.life

# Build only (no deploy)
bun run build:web
bun run build:app
```

## Deployment Order

The `deploy` script runs in this order:

1. **Build packages** — shared code must compile first
2. **Deploy web** — landing page (worker: `debo`)
3. **Deploy app** — dashboard (worker: `debo-app`)
4. **Deploy api** — API service (optional, not yet extracted)
5. **Deploy agents** — Mastra agents (optional, not yet extracted)
6. **Deploy voice** — Voice worker (optional, not yet extracted)

Optional services are skipped gracefully if not yet extracted.

## Cloudflare Workers

| Worker | App | Domain | wrangler.jsonc |
|--------|-----|--------|----------------|
| `debo` | `apps/web` | `debo.life` | `apps/web/wrangler.jsonc` |
| `debo-app` | `apps/app` | `app.debo.life` | `apps/app/wrangler.jsonc` |

## Prerequisites

- Bun installed
- Wrangler CLI authenticated (`wrangler login`)
- Cloudflare account with Workers enabled
- R2 bucket `debo-opennext-cache` created
- Neon PostgreSQL database provisioned

## Environment Variables

Each app has its own `.env.example`. Copy and fill in:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/app/.env.example apps/app/.env.local
```

### Required for `apps/web`
- `NEXT_PUBLIC_STACK_PROJECT_ID` — Stack Auth project
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` — Stack Auth key
- `STACK_SECRET_SERVER_KEY` — Stack Auth secret

### Required for `apps/app`
- `DATABASE_URL` — Neon PostgreSQL connection string
- `OPENAI_API_KEY` or `NVIDIA_API_KEY` — AI provider
- `QDRANT_URL` + `QDRANT_API_KEY` — Vector database
- `NEXT_PUBLIC_STACK_PROJECT_ID` — Stack Auth
- `STACK_SECRET_SERVER_KEY` — Stack Auth
- `LIVEKIT_URL` + `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET` — Voice

## Manual Cloudflare Steps

After first deploy, you may need to:

1. **Add custom domain** in Cloudflare dashboard:
   - Worker `debo` → Route: `debo.life/*`
   - Worker `debo-app` → Route: `app.debo.life/*`

2. **Create R2 bucket** if not exists:
   ```bash
   wrangler r2 bucket create debo-opennext-cache
   ```

3. **Set secrets** (never commit these):
   ```bash
   # For apps/app
   cd apps/app
   wrangler secret put DATABASE_URL
   wrangler secret put OPENAI_API_KEY
   wrangler secret put STACK_SECRET_SERVER_KEY
   # ... etc
   ```

## Service Bindings (Future)

When API/agents are extracted as separate workers, add service bindings in wrangler.jsonc:

```jsonc
{
  "services": [
    { "binding": "API", "service": "debo-api" },
    { "binding": "AGENTS", "service": "debo-agents" }
  ]
}
```

This keeps internal services private — only the app worker is publicly accessible.
