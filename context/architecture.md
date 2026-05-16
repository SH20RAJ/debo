# Architecture - Multimodal Intelligence Lab

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router, standalone output) |
| Language | TypeScript 5.7+ |
| Intelligence | Mastra Framework (Agents, Tools, Workflows, Scorers) |
| LLM Ops | Vercel AI SDK 6 + Adaptive Memory LLM |
| Database | PostgreSQL (Neon) via Drizzle ORM |
| Vector Engine | Qdrant (Semantic Search) |
| Real-time | LiveKit (WebRTC) + Deepgram STT + Cartesia TTS |
| Integrations | Composio MCP (1000+ App Connections) |
| UI/UX | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Auth | Stack Auth |
| Deployment | Cloudflare Workers (OpenNext) |

## Research Protocols (Data Flow)

1. **Multimodal Ingestion**
   - Source: Voice, Text, Images, PDF Research Papers, App Streams (Slack/Linear).
   - Capture: Raw logs stored in Postgres; Media in Google Drive.

2. **Neural Connectionism (Mastra Agents)**
   - Extraction: Latent facts, entities, emotions, and relationship manifolds.
   - Indexing: Vector embeddings in Qdrant; Semantic graph in Postgres.

3. **Collaborative Synthesis**
   - Retrieval: Semantic similarity + Relationship graph walking.
   - Interaction: Chat/Voice with cited evidence and proactive memory.

## Key Modules

- **`src/mastra`**: The neural core. Agents for extraction, synthesis, and research.
- **`src/lib/memory`**: The memory graph architecture.
- **`src/lib/mcp`**: Server/Client for Model Context Protocol.
- **`src/workers`**: Real-time voice and multimodal processing agents.

## Strategic Infrastructure

- **Cloudflare Edge**: Global sub-second deployment.
- **OpenNext**: Next.js bridging for edge runtimes.
- **Drizzle**: Type-safe relational data management.
- **Composio**: The action layer connecting Debo to the world.
