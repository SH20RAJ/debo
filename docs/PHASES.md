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
- [ ] Initialize Cloudflare Infrastructure:
  - [ ] Configure `wrangler.toml` for environmental bindings.
  - [ ] Provision local resources (Vectorize, AI) and execute typegen integrations.

## 🟢 Phase 1.5: Open Source Standards
**Goal:** Secure the repository for public scaling, AI agent comprehension, and community contribution.
- [x] Generate MIT `LICENSE`.
- [x] Create `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [x] Create `agents.md` repository context rules to enforce Server Components.
- [x] Configure Next.js Application Metadata in `src/app/layout.tsx`.
- [x] Export `opengraph-image.png` utilizing File-based metadata routing.

## 🟡 Phase 2: Core MVP (User Experience)
**Goal:** Front-facing interaction, user acquisition, and initial journal ingestion pipeline.
- [x] Build Landing Page relying strictly on Server Components for layout rules.
- [x] Construct isolated Client Component interactive containers (Hero, Animations).
- [ ] Implement Auth UI (`/login`, `/signup`) utilizing Better-Auth flows.
- [ ] Build Protected Dashboard Route (`(dashboard)/`).
- [ ] Create the Minimalist Markdown Journal Editor UI:
  - [ ] Implement robust markdown parsing logic.
  - [ ] Build autosave abstraction logic connecting to Neon DB.
  - [ ] Handle error states with strictly accessible Toast notifications from Shadcn.
- [ ] Construct the Journal Entry historical viewer and timeline UI.

## ⚪ Phase 3: AI & The Edge Layer
**Goal:** Offload heavy computational vector mathematics over to Cloudflare to guarantee Next.js remains wildly performant.
- [ ] Abstract Next.js AI processing logic over to a dedicated Cloudflare Worker (`/agent-worker`).
- [ ] Integrate Workers AI bindings specifically for `@cf/baai/bge-large-en-v1.5` text embeddings.
- [ ] Configure asynchronous Vectorize sequence: 
  - [ ] On journal save event -> send payload to queue -> encode to vectors.
  - [ ] Store vectors in Cloudflare Vectorize index.
  - [ ] Map `vectorizeId` back to the NeonDB row via a background callback.
- [ ] Implement Semantic Query Logic: Convert user plain-text chat queries into embeddings for cosine similarity searching against past journals.

## ⚪ Phase 4: Chat Interface & Companionship
**Goal:** Launch the intelligent sidekick module that genuinely understands user telemetry.
- [ ] Install and configure `assistant-ui` chat suite.
- [ ] Integrate `mem0` library directly into the background processing pipeline to formulate raw "life facts" (e.g. "User feels drained after team meetings", "User adopted a dog").
- [ ] Construct Agent System Prompts: Dynamically inject `mem0` foundational life facts as a system prompt prefix anytime the chat interface mounts.
- [ ] Create generative conversational endpoints with native streaming UI support (`ai` SDK `streamText`).

## ⚪ Phase 5: Bring Your Own Key (BYOK) & App Connectors
**Goal:** Achieve extensive app integration capabilities and empower users to own their models.
- [ ] Construct Dashboard BYOK Settings Panel.
- [ ] Security Layer: Safely encrypt and securely store BYOK keys within DB `preferences`.
- [ ] Dynamic AI Router: Update AI logic to selectively initialize Vercel AI SDK wrappers (Anthropic, OpenAI, local Ollama) over Cloudflare defaults if user keys are queried from DB.
- [ ] Deploy Web Connectors via Nango:
  - [ ] Spin up Nango instance for OAuth token management tracking.
  - [ ] Bind Google Calendar, Gmail, and Notion API connectors.
  - [ ] Wire these Web APIs strictly as *Tools* within the AI chat generation parameters.
- [ ] Implement Model Context Protocol (MCP) Ingress/Egress:
  - [ ] **Ingress Tools**: Create UI for pasting standard SSE URLs for external/private MCP servers, parsing them securely using `@modelcontextprotocol/sdk`.
  - [ ] Build an ingress pipeline dynamically granting the `assistant-ui` chat interface access to these custom MCP tool definitions.
  - [ ] **Egress API**: Establish Debo Egress API (`/api/mcp`) so external instances (cursor, claude desktop) can autonomously utilize the user's journal as a native Tool/Resource provider.
