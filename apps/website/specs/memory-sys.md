> **Archived planning spec.** This document predates the consolidation to two deployables and still references Mastra, CopilotKit, Cloudflare Vectorize, and split `apps/api` / agent-service guidance. Treat it as historical product context only. Current implementation guidance lives in `AGENTS.md`, `README.md`, and `apps/website/docs/backend.md`: `apps/website` is the full-stack Node runtime product using LangChain/LangGraph, and `apps/landing-page` is the landing page.

You are an elite AI infrastructure engineer building the intelligence layer for Debo, a private AI memory OS.

You must read:
1. backend.md
2. frontend.md if available
3. current codebase structure
4. existing package.json / monorepo setup / routes / DB / env files

Use Context7 and official docs before implementing any library-specific code. Do not guess APIs.

Primary libraries/tech to verify with Context7/docs:
- Mastra
- CopilotKit
- Mem0
- Composio
- LiveKit Agents
- Deepgram
- AssemblyAI
- Groq Whisper / OpenAI Whisper if used
- Trigger.dev
- Drizzle ORM
- Neon Postgres
- Cloudflare R2
- Cloudflare Vectorize
- Langfuse
- PostHog
- Sentry
- Zod
- Better Auth
- Hono/Fastify if API exists

Goal:
Add the complete Debo intelligence backend layer:
- memory
- chat
- Ask Debo
- source-backed RAG
- voice sessions
- connector tools
- agent actions
- long-term personalization
- ingestion jobs
- citations
- observability
- cost-aware provider routing

Important product rule:
Debo is not just an AI wrapper. Debo owns the source-backed memory system.

Use this split:
- Debo DB = real product memory, sources, chunks, citations, tasks, people, decisions
- Mem0 = assistant personalization memory only
- Mastra = agents, tools, workflows, RAG orchestration
- CopilotKit = frontend-agent bridge and interactive UI actions
- Composio = external app tools/connectors
- LiveKit = realtime voice/call layer
- Trigger.dev = durable ingestion and processing jobs
- R2 = original files/audio/video/docs
- Vectorize = vector search
- Langfuse = traces, prompt versions, evals, retrieval debugging

Do not make Mem0 the primary database.
Do not make Composio the memory system.
Do not make LiveKit the chat backend.
Do not put AI logic directly inside route files.
Do not create one giant agent file.

Architecture to build:

packages/
  ai/
    mastra/
      index.ts
      agents/
        ask-debo.agent.ts
        memory-ingestion.agent.ts
        task-extraction.agent.ts
        connector.agent.ts
        voice-agent.ts
        weekly-review.agent.ts
      tools/
        search-memory.tool.ts
        get-source.tool.ts
        create-task.tool.ts
        update-task.tool.ts
        save-memory.tool.ts
        query-person.tool.ts
        query-project.tool.ts
        composio-tools.ts
        mem0-tools.ts
      workflows/
        ask-debo.workflow.ts
        ingest-source.workflow.ts
        extract-memory.workflow.ts
        connector-action.workflow.ts
        post-call-summary.workflow.ts
      prompts/
        ask-debo.prompt.ts
        extract-memory.prompt.ts
        summarize-source.prompt.ts
        extract-tasks.prompt.ts
        connector-agent.prompt.ts
      schemas/
        answer.schema.ts
        citation.schema.ts
        extraction.schema.ts
        task.schema.ts
        memory.schema.ts

  memory/
    retrieval/
      hybrid-search.ts
      query-rewrite.ts
      rerank.ts
      context-builder.ts
      filters.ts
    citations/
      build-citation.ts
      validate-citations.ts
      source-excerpt.ts
    chunking/
      semantic-chunker.ts
      transcript-chunker.ts
      document-chunker.ts
    personalization/
      mem0-client.ts
      mem0-policy.ts
    review/
      review-rules.ts
      sensitivity-rules.ts

  connectors/
    core/
      connector-registry.ts
      connector.interface.ts
      sync-rules.ts
      permission-policy.ts
    providers/
      composio.provider.ts
      nango.placeholder.ts
    apps/
      gmail.connector.ts
      google-calendar.connector.ts
      notion.connector.ts
      github.connector.ts
      google-drive.connector.ts
    transforms/
      email-to-source.ts
      calendar-to-source.ts
      notion-to-source.ts
      github-to-source.ts

  voice/
    livekit/
      session.ts
      token.ts
      room.ts
      transcript-sink.ts
      post-call-ingestion.ts
      avatar.placeholder.ts
    providers/
      deepgram.provider.ts
      tts.provider.ts
      vad.provider.ts

  observability/
    langfuse.ts
    tracing.ts
    cost-tracker.ts
    logger.ts

apps/
  api/
    routes/
      ask.routes.ts
      chat.routes.ts
      memory.routes.ts
      sources.routes.ts
      connectors.routes.ts
      voice.routes.ts

  worker/
    jobs/
      ingest-source.job.ts
      extract-memory.job.ts
      embed-chunks.job.ts
      sync-connector.job.ts
      post-call-summary.job.ts

  livekit-agent/
    src/
      index.ts
      debo-agent.ts
      session-handler.ts

Implementation phases:

PHASE 1 — Mastra foundation
- Install/configure Mastra using current docs.
- Create Mastra root config.
- Create these agents:
  - askDeboAgent
  - memoryIngestionAgent
  - taskExtractionAgent
  - connectorAgent
  - voiceAgent
- Create strict Zod schemas for all agent outputs.
- Agents must return structured outputs where possible.
- Add model provider routing:
  - cheap model for intent classification
  - cheap/fast model for extraction
  - stronger model for final answers
- Add feature flags for provider/model choices.

PHASE 2 — Memory tools
Create Mastra tools:
- searchMemory
- searchSources
- getSourceById
- getMemoryChunks
- createTask
- updateTask
- saveMemoryItem
- getPersonContext
- getProjectContext
- buildCitation
- validateCitation

Rules:
- Tools must check user_id and workspace_id.
- Tools must never return data from another user.
- Tools must return source metadata for citations.
- Tools must be reusable from API, worker, and voice agent.

PHASE 3 — Debo memory retrieval
Build source-backed retrieval:
- query rewrite
- hybrid search
- vector search through Vectorize
- structured DB search for people/tasks/projects
- recency boost
- exact entity boost
- source trust filter
- privacy filter
- reranking placeholder
- context builder

Retrieval must output:
- chunks
- sources
- candidate tasks
- candidate people
- citations
- confidence label

Confidence labels:
- strong_source_match
- partial_source_match
- weak_source_match
- no_source_found

PHASE 4 — Ask Debo chat backend
Implement:
POST /ask

It should:
- accept question, threadId, mode, filters
- create/reuse chat thread
- classify intent
- retrieve source-backed context
- get Mem0 personalization context
- optionally use Composio tools only when needed
- generate final answer with Mastra
- validate citations
- save chat message
- save answer citations
- return streaming response if possible

Streaming events:
- intent_detected
- memory_search_started
- source_found
- answer_delta
- citation_added
- suggested_action
- done

If streaming is too complex, implement JSON first but keep streaming architecture ready.

PHASE 5 — CopilotKit integration layer
Use CopilotKit for in-app agentic actions, not just basic chat.

Implement backend support for CopilotKit:
- expose Mastra agents/actions to CopilotKit
- allow UI-aware actions:
  - openSource
  - createTask
  - updateTask
  - saveMemory
  - searchLibrary
  - filterTasks
  - connectApp
  - startVoiceSession
- support frontend state sync where appropriate
- do not let CopilotKit bypass backend permissions

If assistant-ui already exists:
- keep assistant-ui for pure chat UI
- add CopilotKit for stateful UI actions and generative UI
If CopilotKit is not installed:
- set up clean integration but keep components minimal.

PHASE 6 — Mem0 integration
Use Mem0 for long-term assistant personalization only.

Implement:
- mem0 client wrapper
- getUserPersonalizationMemory(userId)
- saveUserPreferenceMemory(userId, memory)
- searchPersonalizationMemory(userId, query)
- memory write policy

Do save to Mem0:
- user preferences
- communication style
- stable recurring preferences
- personalization facts

Do not save to Mem0:
- full source content
- transcript chunks
- private session data
- connector data by default
- sensitive extracted memories without review

Every Mem0 write should be auditable.

PHASE 7 — Composio connector tools
Use Composio as the first connector layer.

Implement:
- Composio provider
- connector registry
- tool loading for selected apps
- permission policy
- sync rules
- manual import flow

Initial connector apps:
- Gmail
- Google Calendar
- Notion
- GitHub
- Google Drive

Agent action examples:
- search Gmail for a specific user-approved query
- summarize selected email
- read upcoming calendar events
- fetch selected Notion page
- summarize GitHub issue/PR
- create a task only after explicit user approval

Rules:
- No automatic full Gmail sync by default.
- No sending emails without explicit user confirmation.
- No modifying external apps without explicit user confirmation.
- Every imported connector item becomes a Debo source.
- Connector data must follow the same ingestion pipeline.

Add Nango only as a placeholder for later continuous sync.
Do not implement expensive continuous sync now unless backend.md already requires it.

PHASE 8 — Voice layer with LiveKit
Implement LiveKit voice backend foundation:
- create voice session API
- generate LiveKit token
- create voice_sessions record
- connect voice session to Debo user/workspace
- transcript sink
- post-call source creation
- post-call ingestion job

Use Deepgram for realtime STT if key exists.
Keep TTS provider modular.
Keep avatar support as a placeholder only.

Voice modes:
- talk_to_debo
- daily_debrief
- meeting_memory
- pitch_practice
- planning_session

After call ends:
- create source
- save transcript
- run memory extraction
- extract tasks/people/decisions
- create citations with timestamps

Do not make avatar a core dependency.
Add placeholder for Tavus/LiveAvatar/Beyond Presence later.

PHASE 9 — Ingestion jobs
Using Trigger.dev, create durable jobs:
- ingestSourceJob
- extractMemoryJob
- embedChunksJob
- syncConnectorJob
- postCallSummaryJob

Every job must:
- be idempotent
- log job status
- track provider used
- track estimated/actual cost
- handle retries
- not duplicate memory items/chunks/tasks
- update source status

Provider routing:
- short audio: Groq Whisper or cheap STT provider
- realtime voice: Deepgram
- premium long meeting: AssemblyAI
- documents: LlamaParse or parser stub
- embeddings: configured embedding provider
- vector index: Vectorize

Use stubs if keys are missing.

PHASE 10 — Langfuse and cost observability
Implement:
- Langfuse wrapper
- trace Ask Debo runs
- trace retrieval context
- trace model calls
- trace tool calls
- store prompt version
- store token/cost metadata
- store citation count
- store model/provider used

Do not log private full memory content unless explicitly in dev mode.
Never log raw connector tokens or signed URLs.

PHASE 11 — API endpoints
Create or update:

POST /ask
GET /chat/threads
GET /chat/threads/:id
POST /chat/threads
DELETE /chat/threads/:id

GET /memory/search
POST /memory/review/:id/approve
POST /memory/review/:id/reject

POST /connectors/:provider/connect
POST /connectors/:provider/import
PATCH /connectors/:id/rules
DELETE /connectors/:id

POST /voice/session
POST /voice/session/:id/end
GET /voice/session/:id

All endpoints must:
- validate with Zod
- check auth
- check workspace permissions
- use thin route handlers
- call domain/service functions
- return typed errors

PHASE 12 — Testing and quality
Add tests for:
- citation validation
- permission filtering
- memory search filters
- task extraction schema
- Mem0 write policy
- connector permission policy
- source-backed answer without source
- private session exclusion
- delete/unlink derived memory

Run:
- install if needed
- typecheck
- lint
- build
- tests if available

Fix all errors.

Optimization rules:
- Use cheap model for classification.
- Use stronger model only for final complex answer.
- Batch embeddings.
- Avoid re-embedding unchanged content.
- Cache safe repeated retrievals.
- Use content hashes.
- Limit connector imports.
- Keep AssemblyAI for premium/high-quality transcription only.
- Keep Nango for later paid/continuous sync.
- Keep Sentry optional/later if not already configured.
- Use feature flags for costly features.

Security rules:
- Every DB query must scope by user_id and workspace_id.
- Never trust frontend IDs.
- Never expose connector credentials.
- Never expose permanent R2 URLs.
- Never let AI decide permissions.
- Never let AI delete data directly.
- Deletion must remove vectors/chunks/derived memories/files where applicable.
- Private session must not write Mem0 or embeddings.

Output after implementation:
1. Summary of what was built.
2. Files changed.
3. New env vars.
4. Setup instructions.
5. What is real vs stubbed.
6. Remaining TODOs.
7. Any docs/Context7 references used.

Commit if git is available:
- feat(ai): add Mastra agent foundation
- feat(memory): add source-backed retrieval and citations
- feat(chat): add Ask Debo chat backend
- feat(connectors): add Composio connector layer
- feat(voice): add LiveKit voice backend foundation
- feat(jobs): add Trigger.dev ingestion workflows
- feat(observability): add Langfuse tracing and cost tracking

Do not ask follow-up questions.
Make the best decisions using backend.md, current codebase, Context7, and official docs.
Build cleanly, modularly, and production-minded.
