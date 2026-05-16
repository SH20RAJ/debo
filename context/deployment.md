# Deployment

## Platform

**Primary**: Cloudflare Workers via OpenNext
**Framework**: Next.js 16 with standalone output

## Build Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production build
npm run build        # Standard Next.js build (webpack)

# Cloudflare deployment
npm run deploy       # Build + patch + deploy to Cloudflare Workers
npm run upload       # Build + patch + upload to Cloudflare
npm run preview      # Build + patch + preview locally
```

## Deployment Pipeline

1. `opennextjs-cloudflare build` - Builds OpenNext-compatible output
2. `node scripts/patch-opennext-worker.mjs` - Patches worker for compatibility
3. `node scripts/deploy-opennext-workers.mjs` - Deploys to Cloudflare

## Wrangler Configs

### `wrangler.jsonc`
Main worker configuration.

### `wrangler.api.jsonc`
API-specific worker config.

### `wrangler.dashboard.jsonc`
Dashboard-specific worker config.

## Environment Variables

### Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `QDRANT_URL` + `QDRANT_API_KEY` - Vector database
- `OPENAI_API_KEY` + `OPENAI_BASE_URL` - LLM provider
- `MEM0_API_KEY` - Memory service
- `COMPOSIO_API_KEY` - Integration platform
- Stack Auth keys

### Optional
- `LIVEKIT_URL` + `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET` - Voice
- `DEEPGRAM_API_KEY` - STT
- `CARTESIA_API_KEY` - TTS
- `UPLOADTHING_TOKEN` - File uploads

## Secrets Management

- `.env.local` for local development (gitignored)
- `.dev.vars` for Wrangler local dev
- Cloudflare dashboard for production secrets
- Never commit `.env` files

## Scripts

### `scripts/deploy-opennext-workers.mjs`
Custom deployment script for Cloudflare Workers.

### `scripts/patch-opennext-worker.mjs`
Patches OpenNext output for Cloudflare compatibility.

### `scripts/register-opennext-ast-patch.mjs`
AST patch registration for OpenNext builds.

### `scripts/provider-registry.mjs`
AI provider registry utility.
