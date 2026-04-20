# Debo Development Roadmap & Phases

This document tracks the execution phases of the Debo application.

## 🟢 Phase 1: Foundation & Tooling 
- [x] Clean out generic Next.js boilerplate.
- [x] Expand Shadcn UI initialization config. 
- [x] Configure Database & Auth (Better-Auth + NeonDB with Drizzle ORM).
- [ ] Setup Cloudflare Infrastructure (`wrangler.toml`, binding configs).

## 🟢 Phase 1.5: Open Source Standards
- [x] Create `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- [x] Create `agents.md` for AI context.
- [x] Configure initial metadata and open graph images.

## 🟡 Phase 2: Core MVP (Journal Interface)
- [x] Build Landing Page in `(landing)/` route group.
- [x] Ensure Server Components strictly for layouts/pages.
- [ ] Implement robust User Authentication (Better-Auth Login/Signup flows).
- [ ] Build Protected Dashboard Layout (`(dashboard)/`).
- [ ] Develop Minimalist Markdown Journal Editor UI.
- [ ] Connect Editor to Drizzle ORM for CRUD operations on Journals.

## ⚪ Phase 3: AI & The Edge Layer
- [ ] Setup Cloudflare Worker router for AI logic.
- [ ] Integrate Workers AI bindings (`@cf/baai/bge-large-en-v1.5` text embeddings).
- [ ] Configure Vectorize sync flow to generate embeddings on journal save.

## ⚪ Phase 4: Chat Interface & Companionship
- [ ] Install and configure `assistant-ui` for the AI companion chat.
- [ ] Integrate `mem0` library in the text processing pipeline to formulate "life facts".
- [ ] Inject `mem0` facts as a system prompt prefix anytime the chat is opened.

## ⚪ Phase 5: BYOK & Advanced Connectors
- [ ] Dashboard BYOK (Bring Your Own Key) Settings UI.
- [ ] Update AI route logic to prioritize user keys via Vercel AI SDK over Cloudflare defaults.
- [ ] Implement integration logic management (via Nango) for OAuth apps.
- [ ] Enable robust MCP (Model Context Protocol) client handling for custom SSE URLs.
- [ ] Expose Debo MCP Server routes for desktop clients.
