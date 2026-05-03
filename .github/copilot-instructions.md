# Copilot / AI Agent Instructions (short)

This file orients AI coding agents to repository-specific model/provider conventions. For full agent guidance see [AGENTS.md](AGENTS.md).

- Models: always use the `provider/model-name` format (e.g. `openai/gpt-5.4`).
- Verify models and providers before use:
  - `node scripts/provider-registry.mjs --list`
  - `node scripts/provider-registry.mjs --provider <provider>`
- Provider registry and UI:
  - Provider config: [src/config/providers.ts](src/config/providers.ts)
  - Runtime helpers & defaults: [src/lib/ai/openai.ts](src/lib/ai/openai.ts)
  - DB schema: [src/db/schema.ts](src/db/schema.ts)
  - Dashboard config UI: [src/components/dashboard/settings/provider-card.tsx](src/components/dashboard/settings/provider-card.tsx)
- Secrets: do NOT commit `.env` or API keys. Use environment variables and the app's encrypted storage for user keys.
- When working with Mastra: load the `mastra` skill first and prefer embedded docs from node_modules over memory.

If you need a more specific agent behavior (linting models, automated provider checks), ask to create a dedicated skill or agent.