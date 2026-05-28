For **Debo**, I would build it like this:

```txt
Simple frontend.
Powerful backend.
Ready-made AI/voice/connectors wherever possible.
Your own source-backed memory engine as the core moat.
```

## Final best stack for Debo

| Layer                              | Best choice                                   |
| ---------------------------------- | --------------------------------------------- |
| App                                | Next.js + TypeScript                          |
| UI                                 | Tailwind + shadcn/ui                          |
| Notion-like writing                | **BlockNote**                                 |
| Realtime/collab editor later       | BlockNote + Liveblocks                        |
| AI chat UI                         | **assistant-ui**                              |
| In-app agent actions later         | Custom Debo UI actions                        |
| Agent/backend AI                   | **LangChain + LangGraph**                     |
| Voice/video AI calls               | **LiveKit Agents**                            |
| Realtime transcription             | Deepgram                                      |
| Uploaded audio/video transcription | AssemblyAI                                    |
| Storage                            | Cloudflare R2                                 |
| Database                           | Neon Postgres                                 |
| ORM                                | Drizzle                                       |
| Vector search                      | Qdrant                                        |
| Memory layer                       | Custom Debo memory DB + Mem0                  |
| Connectors/actions                 | Composio                                      |
| Sync-heavy integrations            | Nango later                                   |
| Background jobs                    | Trigger.dev                                   |
| LLM observability                  | Langfuse                                      |
| Product analytics                  | PostHog                                       |
| Error tracking                     | Sentry                                        |
| Auth                               | Stack Auth                                    |

My exact pick:

```txt
Next.js
Stack Auth
Neon Postgres
Drizzle
Cloudflare R2
Qdrant
BlockNote
assistant-ui
LangChain + LangGraph
LiveKit
Deepgram
AssemblyAI
Mem0
Composio
Trigger.dev
Langfuse
PostHog
Sentry
```

## 1. Notion-like writing experience

Use **BlockNote**.

BlockNote is the best fit for Debo because it already gives a Notion-style block editor with ready UI, slash menus, formatting controls, drag handles, nested blocks, and React support. It is much faster than building on raw Tiptap/Lexical/Slate yourself. BlockNote also supports real-time collaboration, and its docs recommend storing the native block JSON format for non-lossy backend storage. ([BlockNote][1])

Use this structure:

```txt
Journal page = BlockNote editor
Saved note = BlockNote JSON
Search text = generated Markdown/plain text mirror
Memory source = original BlockNote document
```

Store 3 versions:

```txt
document_json    → exact editable BlockNote content
plain_text       → for embeddings/search
summary          → for quick memory preview
```

Do **not** store only Markdown, because BlockNote says Markdown/HTML export can be lossy. Store the native JSON as the source of truth. ([BlockNote][2])

### When to use Tiptap instead

Use **Tiptap** only if Debo becomes more like “Cursor for documents,” where AI needs to precisely edit rich-text documents, review changes, and manipulate document structure. Tiptap has a bigger low-level editor ecosystem and AI agent/toolkit features, but it needs more product work than BlockNote. ([Tiptap][3])

For now:

```txt
MVP: BlockNote
Advanced AI document editing later: Tiptap AI Toolkit or custom BlockNote AI commands
```

## 2. Simple Debo product map

```txt
Debo
├── Capture
│   ├── Journal
│   ├── Voice note
│   ├── File upload
│   ├── Link save
│   ├── Meeting/call
│   └── Connected apps
│
├── Memory Engine
│   ├── Raw source
│   ├── Transcript/text
│   ├── Summary
│   ├── Entities
│   ├── People
│   ├── Tasks
│   ├── Decisions
│   ├── Chunks
│   └── Embeddings
│
├── Ask Debo
│   ├── Chat
│   ├── Source-backed answer
│   ├── Related memories
│   ├── Follow-up questions
│   └── Action tools
│
└── Control
    ├── Export
    ├── Delete
    ├── Disconnect sources
    ├── Memory review
    └── Privacy settings
```

## 3. Backend architecture

```txt
User input
  ↓
Next.js app
  ↓
Save raw source metadata in Neon
  ↓
Upload file/audio/video to R2
  ↓
Trigger.dev ingestion job
  ↓
Parse/transcribe/extract
  ↓
Generate chunks + embeddings
  ↓
Store:
  - raw file in R2
  - metadata in Neon
  - vectors in Qdrant
  - personal assistant memory in Mem0
  ↓
Ask Debo
  ↓
LangGraph Ask Debo graph retrieves from:
  - Debo DB
  - Qdrant
  - Mem0
  - Composio tools
  ↓
assistant-ui renders source-backed answer
```

## 4. Storage: Cloudflare R2

Use **R2** for all heavy objects:

```txt
voice notes
meeting recordings
videos
PDFs
images
screenshots
exports
original source files
```

R2 is S3-compatible and designed for scalable object storage without egress fees, which is ideal for an app storing lots of user audio/video/files. ([Cloudflare Docs][4])

R2 key structure:

```txt
users/{userId}/audio/{sourceId}.webm
users/{userId}/video/{sourceId}.mp4
users/{userId}/files/{sourceId}.pdf
users/{userId}/images/{sourceId}.png
users/{userId}/exports/{exportId}.zip
```

Keep R2 private. Upload/download through signed URLs only.

## 5. Voice, video, and calls

Use **LiveKit Agents** for realtime voice/video AI.

LiveKit Agents handles the hard realtime voice AI parts: streaming audio through STT → LLM → TTS, turn detection, interruptions, and orchestration. ([docs.livekit.io][5])

Use:

```txt
LiveKit = realtime room/call layer
Deepgram = realtime STT
LLM = reasoning/chat
TTS = voice response
R2 = call recordings
Debo memory = final transcript + summary + tasks
```

LiveKit Egress supports S3-compatible storage including Cloudflare R2, so recordings can go directly into your storage pipeline. ([docs.livekit.io][6])

## 6. Transcription

Use this split:

```txt
Realtime calls: Deepgram
Uploaded audio/video: AssemblyAI
Fallback/simple MVP: OpenAI speech-to-text
```

Deepgram has an official LiveKit integration for realtime agents using LiveKit for audio transport and Deepgram for speech-to-text/text-to-speech. ([developers.deepgram.com][7])

AssemblyAI is better for uploaded audio/video because it gives speech-to-text plus useful meeting features like speaker diarization, where you can detect who said what. ([AssemblyAI][8])

## 7. Memory layer

Use **both**:

```txt
Mem0 = assistant personalization memory
Debo DB = source-backed product memory
```

Mem0 is useful because it gives agents persistent memory and continuity without you building a complete memory service from scratch. ([mem0.ai][9])

But Debo should not depend only on Mem0. Debo’s actual product value is:

```txt
source-backed recall
personal archive
memory graph
citations
delete/export controls
```

So your own memory tables are required.

Core tables:

```txt
users
sources
source_files
documents
memory_items
memory_chunks
entities
people
tasks
decisions
memory_relations
chat_threads
chat_messages
connector_accounts
ingestion_jobs
audit_logs
```

## 8. Search system

Use hybrid search:

```txt
keyword search + vector search + reranking
```

For MVP:

```txt
Neon Postgres = metadata + keyword filters
Qdrant = embeddings
```

Qdrant is the active vector store for Debo memory search. Keep all vector queries scoped by `userId` through `apps/website` server code.

When Debo grows:

```txt
Turbopuffer = large-scale vector + full-text search
```

Turbopuffer is built on object storage and supports vector search with filtering, which is useful when Debo has huge user memory archives. ([turbopuffer][11])

## 9. Connectors

Use **Composio** first.

Composio gives AI agents access to many SaaS toolkits and handles tool/auth infrastructure for apps like Gmail, Calendar, Notion, GitHub, Slack, and more. ([composio.dev][12])

Use Composio for:

```txt
Ask Debo to search Gmail
Ask Debo to create a Calendar task
Ask Debo to summarize GitHub issues
Ask Debo to pull Notion context
Ask Debo to take an action
```

But for long-term continuous sync, add **Nango** later. Nango is better for product integrations where users connect accounts, and your app syncs records/webhooks on a schedule. ([nango.dev][13])

Best split:

```txt
Composio = agent actions
Nango = background sync
Pipedream = long-tail automations later
```

## 10. AI chat

Use **assistant-ui** for the main Debo chat.

assistant-ui gives production-grade React chat components, runtimes, thread handling, message UI, attachments, streaming, and ChatGPT-style UX so you do not build chat from zero. ([assistant-ui][14])

Use custom Debo UI actions later if the AI needs to control page state, draft edits, or trigger app workflows. Keep permission checks in `apps/website` route handlers and server modules.

## 11. Agent backend

Use **LangChain + LangGraph** inside `apps/website/src/server/langgraph`.

LangChain provides tools, model providers, retrievers, and document loaders. LangGraph provides durable orchestration for Debo's classify -> retrieve -> generate -> cite flows.

Use LangGraph for:

```txt
ask-debo.graph
memory-ingestion graph
task-extraction nodes
connector-action nodes
document-summary nodes
voice post-call summary graph
```

Provider SDKs can still be used underneath, but do not make raw provider calls the main orchestration layer.

## 12. Background jobs

Use **Trigger.dev**.

Debo will have long-running jobs: audio transcription, video processing, PDF parsing, embeddings, connector syncs, and export generation. Trigger.dev is built for TypeScript AI workflows, long-running tasks, queues, retries, observability, and elastic scaling. ([Trigger][17])

Job map:

```txt
source.uploaded
  → parse file
  → transcribe if audio/video
  → clean text
  → summarize
  → extract people/tasks/entities
  → chunk
  → embed
  → index
  → mark source ready
```

## 13. Document parsing

Use this:

```txt
PDFs/slides/complex docs: LlamaParse
OCR-heavy docs: Mistral OCR
Self-host/privacy mode: Unstructured
```

LlamaParse is built for LLM pipelines and can turn PDFs, scans, tables, charts, and complex layouts into clean Markdown/text/JSON. ([Developer Documentation][18])

Mistral OCR is strong for document understanding and can extract structured content from PDFs, including text/tables/equations/images. ([mistral.ai][19])

Unstructured is good if you want open-source/self-hosted ingestion for PDFs, HTML, Word docs, and other unstructured files. ([GitHub][20])

## 14. Backend data model

Simple version:

```txt
sources
- id
- user_id
- type: journal | voice | video | file | link | connector | call
- title
- status: uploaded | processing | ready | failed
- original_r2_key
- plain_text
- summary
- created_at

memory_chunks
- id
- user_id
- source_id
- chunk_index
- text
- embedding_id
- metadata
- created_at

entities
- id
- user_id
- source_id
- type: person | project | date | task | decision | topic
- value
- confidence

tasks
- id
- user_id
- source_id
- title
- due_date
- status
- related_person_id

people
- id
- user_id
- name
- aliases
- relationship
- notes

memory_relations
- id
- user_id
- from_memory_id
- to_memory_id
- relation_type
```

## 15. “Ask Debo” answer pipeline

```txt
User asks question
  ↓
Rewrite query
  ↓
Detect intent:
  - search memory
  - ask connector
  - create task
  - summarize source
  - update journal
  ↓
Retrieve from:
  - Qdrant
  - Postgres filters
  - Mem0
  - Composio/Nango if needed
  ↓
Rerank top memories
  ↓
Generate answer
  ↓
Attach citations:
  - source title
  - timestamp
  - transcript line
  - file/page
  ↓
Show related memories + suggested actions
```

The important rule:

```txt
No source = no confident claim.
```

That one principle will make Debo feel trustworthy.

## 16. Auth choice

Debo uses **Stack Auth** in `apps/website`. Keep auth checks in Next.js route handlers and server modules, and never let AI-generated plans decide permissions.

## 17. Production monitoring

Use:

```txt
Langfuse = LLM traces, prompts, token cost, retrieval debug
Sentry = app errors/performance
PostHog = analytics, feature flags, session replay
```

Langfuse is built for LLM observability, traces, cost/latency tracking, prompt management, evaluations, and debugging AI apps. ([langfuse.com][23])

PostHog gives feature flags, product analytics, experiments, surveys, and session replay, useful for testing Debo features safely. ([posthog.com][24])

Sentry has official Next.js support for errors, logs, traces, and performance monitoring. ([docs.sentry.io][25])

## Build order

Do not start with everything. Build in this order:

```txt
1. Auth + dashboard
2. BlockNote journal capture
3. R2 file/audio upload
4. Trigger.dev ingestion jobs
5. AssemblyAI transcription
6. Summary + entity/task extraction
7. Qdrant memory search
8. assistant-ui Ask Debo chat
9. Mem0 personalization
10. Composio Gmail/Calendar/Notion actions
11. LiveKit voice calls
12. Nango continuous sync
13. Liveblocks collaboration
14. Mobile app
```

## Best simple architecture

```txt
apps/
  web/                 → landing page
  app/                 → full-stack Next.js product, API routes, LangGraph

packages/
  db/                  → Drizzle schema
  memory/              → chunking, retrieval, citations
  ai/                  → shared AI helpers, prompts, schemas
  storage/             → R2 helpers
  connectors/          → Composio/Nango wrappers
  editor/              → BlockNote utils
  shared/              → types/constants
```

## My final recommendation

Build Debo as:

```txt
Notion-like capture app
+ personal memory engine
+ source-backed AI chat
+ voice/call memory
+ connector actions
```

The best stack is:

```txt
Next.js + BlockNote + assistant-ui
LangChain/LangGraph + Trigger.dev
Neon + Drizzle
R2 + Qdrant
LiveKit + Deepgram + AssemblyAI
Mem0 + Composio
Langfuse + PostHog + Sentry
```

The main thing: **do not let Mem0, Composio, or LiveKit become the whole product.** They are accelerators. Debo’s real backend should own:

```txt
sources
transcripts
memory chunks
entities
tasks
people
citations
deletion/export controls
```

That is what will make Debo defensible and not just “another AI wrapper.”

[1]: https://www.blocknotejs.org/?utm_source=chatgpt.com "BlockNote - Javascript Block-Based React rich text editor"
[2]: https://www.blocknotejs.org/docs/features/export/markdown?utm_source=chatgpt.com "Markdown Export"
[3]: https://tiptap.dev/docs/content-ai/capabilities/agent/overview?utm_source=chatgpt.com "AI Agent | Tiptap Content AI"
[4]: https://developers.cloudflare.com/r2/?utm_source=chatgpt.com "Overview · Cloudflare R2 docs"
[5]: https://docs.livekit.io/agents/?utm_source=chatgpt.com "Introduction | LiveKit Documentation"
[6]: https://docs.livekit.io/transport/media/ingress-egress/egress/outputs/?utm_source=chatgpt.com "Output & streaming options"
[7]: https://developers.deepgram.com/docs/livekit-integration?utm_source=chatgpt.com "LiveKit and Deepgram"
[8]: https://www.assemblyai.com/?utm_source=chatgpt.com "AssemblyAI | AI models to transcribe and understand speech"
[9]: https://mem0.ai/?utm_source=chatgpt.com "Mem0 - The Memory Layer for your AI Agents"
[11]: https://turbopuffer.com/?utm_source=chatgpt.com "turbopuffer - fast search engine built on object storage"
[12]: https://composio.dev/toolkits?utm_source=chatgpt.com "Composio toolkits | MCP and API Integrations for AI Agents"
[13]: https://nango.dev/docs/getting-started/intro-to-nango?utm_source=chatgpt.com "Introduction - Nango Docs"
[14]: https://www.assistant-ui.com/docs?utm_source=chatgpt.com "Documentation — assistant-ui (React Chat UI for AI)"
[17]: https://trigger.dev/?utm_source=chatgpt.com "Trigger.dev | Build and deploy fully-managed AI agents and ..."
[18]: https://developers.llamaindex.ai/?utm_source=chatgpt.com "LlamaParse Platform Quickstart | Developer Documentation"
[19]: https://mistral.ai/news/mistral-ocr?utm_source=chatgpt.com "Mistral OCR"
[20]: https://github.com/Unstructured-IO/unstructured?utm_source=chatgpt.com "Unstructured-IO/unstructured: Convert documents to ..."
[21]: https://better-auth.com/?utm_source=chatgpt.com "Better Auth"
[22]: https://clerk.com/docs/reference/nextjs/overview?utm_source=chatgpt.com "Clerk Next.js SDK - SDK Reference | Clerk Docs"
[23]: https://langfuse.com/docs/observability/overview?utm_source=chatgpt.com "LLM Observability & Application Tracing (Open Source)"
[24]: https://posthog.com/docs/feature-flags?utm_source=chatgpt.com "Feature flags - Docs"
[25]: https://docs.sentry.io/platforms/javascript/guides/nextjs/?utm_source=chatgpt.com "Sentry for Next.js"
