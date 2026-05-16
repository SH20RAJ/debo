# External Integrations

## Composio

**Purpose**: OAuth integration platform for external services
**SDK**: `@composio/core` + `@composio/mastra`
**API Key**: `COMPOSIO_API_KEY`

### Capabilities
- Google Drive file operations (upload, folder management, permissions)
- External service connections (Slack, Discord, Notion, Linear, Gmail, Calendar)
- Proxy requests to third-party APIs with OAuth handling

### Usage
- Google Drive media upload for audio/video journals
- Connector sync for external services
- MCP tool integration

### Key Files
- `src/actions/composio.ts` - Composio server actions
- `src/lib/composio.ts` - Composio client setup
- `src/mastra/tools/composio-tools.ts` - Mastra tools

---

## Google Drive

**Via**: Composio integration
**Purpose**: Store audio/video journal media files

### Folder Structure
```
Debo/
  Audio Journals/
    2026-05/
      recording1.webm
      recording2.webm
  Video Journals/
    2026-05/
      video1.webm
```

### Permissions
- Folders and files set to `anyone: reader` after creation
- Enables public embedding without sign-in

### Key Files
- `src/actions/media-journals.ts` - Upload and permission logic

---

## Stack Auth

**Purpose**: User authentication and management
**SDK**: `@stackframe/stack`

### Features
- Email/password auth
- OAuth providers
- Session management
- Webhook events

### Key Files
- `src/stack/client.ts` - Stack client config
- `src/app/api/webhooks/stack/route.ts` - Webhook handler
- `src/components/stack-event-tracker-guard.tsx` - Event tracking

---

## LiveKit

**Purpose**: Real-time voice/video communication
**SDK**: `livekit-server-sdk` + `@livekit/components-react`

### Architecture
- LiveKit Cloud for WebRTC transport
- Deepgram for STT
- Cartesia for TTS
- NVIDIA LLM for responses

### Key Files
- `src/workers/voice-agent.ts` - Agent worker
- `src/app/api/livekit/token/route.ts` - Token generation
- `src/components/dashboard/experimental/agent/voice-agent-client.tsx` - Client UI

---

## Qdrant

**Purpose**: Vector database for semantic search
**SDK**: REST API via fetch

### Collections
- `debo_journals` - Journal embeddings

### Usage
- Index journal content after save
- Semantic search across journals
- Fallback to Postgres text search when unavailable

### Key Files
- `src/lib/vector/qdrant.ts` - Qdrant client
- `src/lib/vector/search.ts` - Search logic
- `src/lib/ai/embeddings.ts` - Embedding generation

---

## Mem0

**Purpose**: Persistent memory across sessions
**SDK**: `mem0ai`

### Usage
- Store extracted facts and preferences
- Cross-session memory retrieval
- Supplement local memory engine

### Key Files
- `src/mastra/tools/mem0-tools.ts` - Mastra tools
- `src/lib/memory/store.ts` - Memory storage

---

## UploadThing

**Purpose**: File upload handling
**SDK**: `@uploadthing/react` + `uploadthing`

### Usage
- Media file uploads
- Direct upload to storage

### Key Files
- `src/lib/uploadthing.ts` - UploadThing config
- `src/app/api/uploadthing/route.ts` - API route

---

## NVIDIA NIM

**Purpose**: Default LLM provider
**Endpoint**: `https://integrate.api.nvidia.com/v1`

### Models
- LLM: `meta/llama-3.3-70b-instruct`
- Embeddings: `nvidia/nv-embedqa-e5-v5`

---

## Neon Database

**Purpose**: PostgreSQL hosting (serverless)
**Connection**: Pooled connection via `@neondatabase/serverless`

### Features
- Serverless scaling
- Connection pooling
- Drizzle ORM integration

---

## Cloudflare

**Purpose**: Deployment platform
**Tool**: OpenNext + Wrangler

### Services
- Workers for API routes
- D1 for Mastra storage (production)
- R2 for static assets (potential)

### Key Files
- `wrangler.jsonc` - Worker config
- `open-next.config.ts` - OpenNext config
- `scripts/deploy-opennext-workers.mjs` - Deploy script
