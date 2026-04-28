# Debo Development Roadmap & Phases

This document meticulously tracks the execution phases, architectural decisions, and granular sub-tasks of the Debo application.

## 🟢 Phase 1: Foundation & Tooling 
**Goal:** Establish the monolithic repository and strictly define UI design systems and database connectors.
- [x] Clean out generic Next.js boilerplate from App Router.
- [x] Expand Shadcn UI initialization config (ensure pure Tailwind v4, zero custom CSS).
- [x] Configure Database & Auth:
  - [x] Setup `better-auth` and `better-auth/adapters/drizzle`.
  - [x] Configure `@neondatabase/serverless` connection pool.
  - [x] Build Drizzle ORM schema for users, sessions, and journal entries.
- [x] Initialize Cloudflare Infrastructure:
  - [x] Configure `wrangler.toml` (wrangler.jsonc) for environmental bindings.
  - [ ] Provision local resources (Vectorize, AI) and execute typegen integrations.

## 🟢 Phase 1.5: Open Source Standards
**Goal:** Secure the repository for public scaling, AI agent comprehension, and community contribution.
- [x] Generate MIT `LICENSE`.
- [x] Create `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [x] Create `agents.md` repository context rules to enforce Server Components.
- [x] Configure Next.js Application Metadata in `src/app/layout.tsx`.
- [x] Export `opengraph-image.png` utilizing File-based metadata routing.

## 🟢 Phase 2: Core MVP (User Experience)
**Goal:** Front-facing interaction, user acquisition, and initial journal ingestion pipeline.
- [x] Build Landing Page relying strictly on Server Components for layout rules.
- [x] Construct isolated Client Component interactive containers (Hero, Animations).
- [x] Implement Auth UI (`/login`, `/signup`) utilizing Better-Auth flows.
- [x] Build Protected Dashboard Route (`(dashboard)/`).
- [x] Create the Minimalist Markdown Journal Editor UI:
  - [x] Implement robust markdown parsing logic.
  - [x] Build autosave abstraction logic connecting to Neon DB.
  - [x] Handle error states with strictly accessible Toast notifications from Shadcn.
- [x] Construct the Journal Entry historical viewer and timeline UI.

## 🟢 Phase 3: AI & The Edge Layer
**Goal:** Offload heavy computational vector mathematics over to Cloudflare to guarantee Next.js remains wildly performant.
- [x] Abstract Next.js AI processing logic over to a dedicated Cloudflare Worker (`/agent-worker`).
- [x] Integrate Workers AI bindings specifically for `@cf/baai/bge-large-en-v1.5` text embeddings.
- [x] Configure asynchronous Vectorize sequence: 
  - [x] On journal save event -> send payload to queue -> encode to vectors.
  - [x] Store vectors in Cloudflare Vectorize index.
  - [x] Map `vectorizeId` back to the NeonDB row via a background callback.
- [x] Implement Semantic Query Logic: Convert user plain-text chat queries into embeddings for cosine similarity searching against past journals.

## 🟢 Phase 4: Voice Companion & MCP Integration (LiveKit)
**Goal:** Launch the intelligent sidekick module using LiveKit for sub-100ms latency voice interactions and expose Debo via MCP.
- [x] Remove legacy text-based `assistant-ui` chat interface.
- [ ] Initialize LiveKit Cloud project and configure environment bindings (`LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`).
- [ ] Implement `VoiceCompanion` client component utilizing `@livekit/components-react`.
- [ ] Build the **LiveKit Agent Worker** (`livekit-agents` in Python/Node):
  - [ ] Configure `VoicePipelineAgent` with STT (Deepgram/OpenAI) and TTS (Cartesia/ElevenLabs).
  - [ ] Connect Agent to the memory engine and `Vectorize` context layers.
  - [ ] **Context7 Integration**: Equip the Voice Agent with the Context7 MCP server as a tool, allowing the agent to answer highly technical questions by reading live documentation.
- [ ] Create the **Debo MCP Server Page** (`/dashboard/mcp`):
  - [ ] Provide connection instructions and SSE endpoints so users can connect their Cursor IDE or Claude Desktop to Debo.

## 🟢 Phase 5: Bring Your Own Key (BYOK) & App Connectors
**Goal:** Achieve extensive app integration capabilities and empower users to own their models.
- [x] Construct Dashboard BYOK Settings Panel.
- [x] Security Layer: Safely encrypt and securely store BYOK keys within DB `preferences`.
- [x] Dynamic AI Router: Update AI logic to selectively initialize Vercel AI SDK wrappers (Anthropic, OpenAI, local Ollama) over Cloudflare defaults if user keys are queried from DB.
- [x] Deploy Web Connectors via Nango:
  - [x] Spin up Nango instance for OAuth token management tracking.
  - [x] Bind Google Calendar, Gmail, and Notion API connectors.
  - [x] Wire these Web APIs strictly as *Tools* within the AI generation parameters.
