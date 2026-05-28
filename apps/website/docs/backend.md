# backend.md

# Debo Backend Architecture

## 0. What Debo Is Building

Debo is a private memory operating system.

The backend must turn scattered user context into a trustworthy, source-backed memory layer.

Debo is not just storing notes. Debo is building a system that can:

* Capture anything the user chooses to save.
* Preserve the original source.
* Understand the source.
* Extract useful memories, people, tasks, decisions, dates, and relationships.
* Let the user ask natural-language questions.
* Answer with proof.
* Let the user review, edit, export, or delete their memory.

The backend should be designed around one core principle:

> No memory without source. No answer without evidence. No trust without control.

---

# 1. Backend Philosophy

## 1.1 Build a Modular Monolith First

Debo should not begin as microservices.

Start with a clean modular monolith:

```txt
apps/website          Full-stack Next.js product: UI, API routes, server modules, LangGraph
apps/landing-page          Public landing page
packages/db       Database schema and queries
packages/memory   Memory engine
packages/ai       Shared prompts, tools, retrieval helpers
packages/storage  R2 file storage helpers
packages/shared   Types, constants, validators
```

This gives startup speed while keeping future scaling possible.

## 1.2 Make the Backend Boring Where Possible

Debo should feel magical to users, but the backend should be boring, observable, and recoverable.

Use simple systems:

* Postgres for core truth.
* R2 for files.
* Queue/jobs for processing.
* Vector index for semantic search.
* AI agents only where reasoning is useful.
* Deterministic code where reasoning is not needed.

Do not use agents for everything.

Use agents for:

* Interpreting user intent.
* Extracting structured memories.
* Choosing tools.
* Generating source-backed answers.
* Summarizing messy content.

Use normal code for:

* Permissions.
* Database writes.
* Deletion.
* Billing.
* Uploads.
* Task status changes.
* Access control.
* Connector sync state.

## 1.3 Debo Owns the Memory Core

Third-party tools can accelerate Debo, but they should not become the whole product.

Use ready-made tools for:

```txt
LiveKit     Realtime voice/calls
Mem0        Assistant personalization memory
Composio    Agent actions and connectors
AssemblyAI  Batch transcription
Deepgram    Realtime transcription
R2          File/object storage
Qdrant      Semantic vector search
Trigger.dev Background jobs
```

But Debo must own:

```txt
sources
transcripts
chunks
citations
tasks
people
decisions
entities
memory graph
privacy controls
export/delete logic
```

That is Debo's long-term moat.

---

# 2. Final Recommended Backend Stack

## 2.1 Core Backend

```txt
Language: TypeScript
Runtime: Node.js 22 LTS
API Framework: Next.js route handlers in apps/website
Validation: Zod
Database: Neon Postgres
ORM: Drizzle ORM
Auth: Stack Auth
Storage: Cloudflare R2
Vector DB: Qdrant
Jobs: Trigger.dev
Cache/Rate limit: Upstash Redis
AI Framework: LangChain + LangGraph
Agent Memory: Mem0
Connectors: Composio first, Nango later
Voice/Calls: LiveKit Agents
Realtime STT: Deepgram
Batch Audio/Video Transcription: AssemblyAI
Document Parsing: LlamaParse first, Mistral OCR or Unstructured later
LLM Observability: Langfuse
Product Analytics: PostHog
Error Tracking: Sentry
Email: Resend
Payments later: Polar or Stripe
```

## 2.2 Why This Stack

This stack optimizes for:

* Fast building.
* Strong TypeScript DX.
* Source-backed AI answers.
* Heavy file/audio/video handling.
* Future scale.
* Privacy and user control.
* Minimal infrastructure management.

## 2.3 What Not To Use Early

Avoid early:

```txt
Kubernetes
Kafka
Custom vector database
Custom auth
Custom object storage
Self-hosted transcription
Complicated microservices
Overly complex distributed orchestration
Separate Go/Rust backend before product-market fit
```

Only add complexity when usage forces it.

---

# 3. High-Level Backend Map

```txt
User action
  ↓
apps/website Next.js route handler / server action
  ↓
Auth + permission check
  ↓
Database metadata write
  ↓
R2 object storage if file/audio/video
  ↓
Trigger.dev job starts
  ↓
Parser / Transcriber / Extractor
  ↓
Memory Engine
  ↓
Postgres + Qdrant + Mem0
  ↓
Ask Debo retrieval pipeline
  ↓
LangGraph generates source-backed answer
  ↓
Frontend renders answer + citations + actions
```

---

# 4. System Boundaries

## 4.1 API Service

The API service handles:

```txt
auth/session verification
CRUD APIs
source creation
upload URL creation
ask endpoint
library queries
task updates
people/project APIs
connector authorization callbacks
vault/export/delete requests
```

It should not do heavy processing inside request/response.

If a request may take more than a few seconds, it should create a job.

## 4.2 Worker Service

The worker service handles:

```txt
audio transcription
video transcription
file parsing
link scraping
summary generation
chunking
embedding
entity extraction
task extraction
connector sync
export generation
data deletion jobs
weekly reviews
```

## 4.3 LiveKit Agent Service

The LiveKit agent handles:

```txt
realtime voice rooms
voice assistant sessions
turn detection
streaming STT
LLM response loop
TTS response
call transcript capture
post-call memory ingestion
```

Voice calls should produce normal Debo sources after the session ends.

## 4.4 Memory Package

The memory package handles:

```txt
chunking
embedding
retrieval
reranking
citation building
source matching
memory extraction helpers
entity normalization
memory graph construction
```

## 4.5 AI Package

The AI package handles:

```txt
model providers
agent definitions
prompts
structured extraction schemas
answer generation
safety rules
tool definitions
evaluation datasets
```

---

# 5. Repository Structure

```txt
debo/
├── apps/
│   ├── web/
│   │   └── Next.js frontend
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── worker/
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   ├── pipelines/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── livekit-agent/
│       ├── src/
│       │   ├── agents/
│       │   ├── tools/
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── db/
│   │   ├── schema/
│   │   ├── migrations/
│   │   ├── queries/
│   │   └── client.ts
│   │
│   ├── auth/
│   │   ├── config.ts
│   │   ├── session.ts
│   │   └── permissions.ts
│   │
│   ├── memory/
│   │   ├── chunk.ts
│   │   ├── embed.ts
│   │   ├── retrieve.ts
│   │   ├── rerank.ts
│   │   ├── citations.ts
│   │   ├── extract.ts
│   │   └── graph.ts
│   │
│   ├── ai/
│   │   ├── models.ts
│   │   ├── agents/
│   │   ├── prompts/
│   │   ├── tools/
│   │   ├── schemas/
│   │   └── evals/
│   │
│   ├── storage/
│   │   ├── r2.ts
│   │   ├── signed-urls.ts
│   │   └── object-keys.ts
│   │
│   ├── connectors/
│   │   ├── composio.ts
│   │   ├── nango.ts
│   │   └── sync-rules.ts
│   │
│   ├── observability/
│   │   ├── langfuse.ts
│   │   ├── sentry.ts
│   │   └── logger.ts
│   │
│   └── shared/
│       ├── types.ts
│       ├── constants.ts
│       ├── errors.ts
│       └── validators.ts
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── backend.md
```

---

# 6. Main Backend Objects

Debo backend should be organized around these concepts:

```txt
User
Workspace
Source
Source File
Document
Transcript
Memory Chunk
Memory Item
Entity
Person
Task
Decision
Project
Connector Account
Job
Audit Event
```

## 6.1 User

A human using Debo.

## 6.2 Workspace

Start with one personal workspace per user.

Add team workspaces later.

Every major table should include:

```txt
user_id
workspace_id
```

This future-proofs the product.

## 6.3 Source

A source is anything Debo can remember from.

Examples:

```txt
journal entry
voice note
uploaded PDF
uploaded image
uploaded video
saved link
email
calendar event
Notion page
GitHub issue
meeting recording
AI voice call
```

The source is the original unit of trust.

## 6.4 Memory Chunk

A chunk is a searchable piece of a source.

It must include citation metadata so Debo can point back to the exact origin.

## 6.5 Memory Item

A memory item is a distilled, useful fact extracted from sources.

Examples:

```txt
User promised Raj the Q4 budget by Friday.
Debo's beta launch is planned for July 28, 2026.
The user prefers minimal premium UI.
The user is working on Apify actors.
```

## 6.6 Entity

An entity is a detected object:

```txt
person
project
company
date
topic
file
task
decision
location
url
```

## 6.7 Task

A task may be manually created or extracted from a source.

Every extracted task should point back to a source.

## 6.8 Decision

A decision is a useful product/work/life conclusion.

Examples:

```txt
Use R2 for storage.
Use BlockNote for the editor.
Use LiveKit for realtime voice.
```

Decisions make Debo valuable for founders and builders.

---

# 7. Database Design

## 7.1 Table Naming Rules

Use plural table names.

Every user-owned table should include:

```txt
id
user_id
workspace_id
created_at
updated_at
```

Every AI-generated table should include:

```txt
confidence
model
prompt_version
review_status
source_id
```

Every potentially sensitive action should create an audit event.

---

# 8. Core Tables

## 8.1 users

```txt
users
- id
- name
- email
- avatar_url
- created_at
- updated_at
```

Auth provider can own password/session internals, but Debo should keep a user profile table.

## 8.2 workspaces

```txt
workspaces
- id
- owner_user_id
- name
- type: personal | team
- created_at
- updated_at
```

MVP can auto-create one personal workspace.

## 8.3 workspace_members

```txt
workspace_members
- id
- workspace_id
- user_id
- role: owner | admin | member | viewer
- created_at
```

Do not build team collaboration now, but keep the model ready.

## 8.4 sources

```txt
sources
- id
- user_id
- workspace_id
- type: journal | voice | audio | video | file | image | link | email | calendar | notion | github | call | manual
- title
- description
- status: draft | uploaded | processing | ready | needs_review | failed | deleted
- origin: manual | upload | connector | livekit | import
- original_url
- connector_account_id
- external_id
- source_date
- language
- privacy_level: normal | private | sensitive
- plain_text
- summary
- metadata_json
- processing_error
- created_at
- updated_at
- deleted_at
```

Important rule:

```txt
sources is the anchor table for trust.
```

Most answers should cite one or more sources.

## 8.5 source_files

```txt
source_files
- id
- user_id
- workspace_id
- source_id
- r2_bucket
- r2_key
- filename
- mime_type
- size_bytes
- duration_seconds
- checksum_sha256
- upload_status: pending | uploaded | failed
- created_at
```

Use this for audio, video, PDFs, images, exports, and originals.

## 8.6 documents

For BlockNote/journal content and parsed documents.

```txt
documents
- id
- user_id
- workspace_id
- source_id
- format: blocknote_json | markdown | html | plain_text | transcript | parsed_pdf
- content_json
- content_text
- version
- created_at
- updated_at
```

Store editable documents and extracted text separately.

## 8.7 transcripts

```txt
transcripts
- id
- user_id
- workspace_id
- source_id
- provider: deepgram | assemblyai | openai | manual
- text
- segments_json
- speakers_json
- language
- confidence
- status: processing | ready | failed
- created_at
- updated_at
```

Segments should include:

```txt
start_time
end_time
speaker
text
confidence
```

This enables timestamp-level citations.

## 8.8 memory_chunks

```txt
memory_chunks
- id
- user_id
- workspace_id
- source_id
- document_id
- transcript_id
- chunk_index
- text
- token_count
- vector_id
- start_offset
- end_offset
- page_number
- start_time
- end_time
- metadata_json
- created_at
```

`vector_id` points to Qdrant/Turbopuffer.

Do not store embeddings in Postgres if using Qdrant as the vector store.

## 8.9 memory_items

```txt
memory_items
- id
- user_id
- workspace_id
- source_id
- type: fact | preference | task_hint | decision | idea | promise | reminder | summary
- title
- content
- confidence
- importance: low | medium | high
- review_status: auto_saved | needs_review | approved | rejected
- valid_from
- valid_until
- model
- prompt_version
- created_at
- updated_at
```

Examples:

```txt
promise: User promised Raj to send Q4 budget by Friday.
decision: Use R2 for Debo storage.
preference: User prefers premium minimal UI.
```

## 8.10 entities

```txt
entities
- id
- user_id
- workspace_id
- source_id
- type: person | project | company | date | topic | file | url | location | product
- value
- normalized_value
- confidence
- metadata_json
- created_at
```

## 8.11 people

```txt
people
- id
- user_id
- workspace_id
- name
- aliases_json
- relationship
- company
- role
- notes
- last_mentioned_at
- created_at
- updated_at
```

People can be auto-created but should be mergeable.

## 8.12 person_mentions

```txt
person_mentions
- id
- user_id
- workspace_id
- person_id
- source_id
- memory_item_id
- context_text
- created_at
```

## 8.13 projects

```txt
projects
- id
- user_id
- workspace_id
- name
- description
- status: active | paused | archived
- color
- created_at
- updated_at
```

## 8.14 project_links

```txt
project_links
- id
- user_id
- workspace_id
- project_id
- source_id
- memory_item_id
- relation_type: mentioned_in | belongs_to | decision_for | task_for
- created_at
```

## 8.15 tasks

```txt
tasks
- id
- user_id
- workspace_id
- source_id
- title
- description
- status: inbox | todo | doing | done | dismissed
- due_at
- related_person_id
- project_id
- confidence
- extraction_status: manual | extracted_pending | extracted_approved | rejected
- created_at
- updated_at
```

Every extracted task must preserve its source.

## 8.16 decisions

```txt
decisions
- id
- user_id
- workspace_id
- source_id
- project_id
- title
- decision_text
- reason
- status: active | changed | deprecated
- confidence
- decided_at
- created_at
```

This is important for founders/builders.

## 8.17 memory_relations

```txt
memory_relations
- id
- user_id
- workspace_id
- from_type: source | memory_item | person | task | project | decision
- from_id
- to_type: source | memory_item | person | task | project | decision
- to_id
- relation_type: mentions | supports | contradicts | follows_up | same_topic | depends_on
- confidence
- created_at
```

This creates Debo's memory graph.

## 8.18 chat_threads

```txt
chat_threads
- id
- user_id
- workspace_id
- title
- mode: recall | summarize | plan | draft | task | project
- created_at
- updated_at
```

## 8.19 chat_messages

```txt
chat_messages
- id
- user_id
- workspace_id
- thread_id
- role: user | assistant | tool | system
- content
- metadata_json
- created_at
```

## 8.20 answer_citations

```txt
answer_citations
- id
- user_id
- workspace_id
- message_id
- source_id
- chunk_id
- quote_text
- page_number
- start_time
- end_time
- confidence
- created_at
```

This lets Debo show proof for every memory answer.

## 8.21 connector_accounts

```txt
connector_accounts
- id
- user_id
- workspace_id
- provider: gmail | google_calendar | notion | github | slack | drive | custom
- status: connected | disconnected | expired | error | paused
- external_account_id
- scopes_json
- sync_rules_json
- last_synced_at
- metadata_json
- created_at
- updated_at
```

## 8.22 connector_sync_runs

```txt
connector_sync_runs
- id
- user_id
- workspace_id
- connector_account_id
- status: queued | running | success | failed | partial
- started_at
- finished_at
- imported_count
- error
- metadata_json
```

## 8.23 jobs

```txt
jobs
- id
- user_id
- workspace_id
- source_id
- type
- status: queued | running | success | failed | cancelled
- provider_job_id
- attempts
- error
- metadata_json
- created_at
- updated_at
```

Even if Trigger.dev tracks jobs, keep lightweight job state in Debo.

## 8.24 audit_logs

```txt
audit_logs
- id
- user_id
- workspace_id
- action
- target_type
- target_id
- ip_address
- user_agent
- metadata_json
- created_at
```

Audit logs are essential for trust.

Examples:

```txt
source.created
source.deleted
connector.connected
connector.disconnected
memory.exported
task.approved
private_mode.enabled
```

---

# 9. Source Status State Machine

Every source should move through clear states.

```txt
draft
  ↓
uploaded
  ↓
processing
  ↓
ready
```

Alternative branches:

```txt
processing → needs_review
processing → failed
ready → deleted
```

## Status Meaning

```txt
draft          Created but not saved fully
uploaded       Raw data exists
processing     Worker is parsing/transcribing/indexing
ready          Searchable and answerable
needs_review   AI found uncertain extracted memory/tasks
failed         Something broke, retry possible
deleted        Soft-deleted before hard delete job
```

---

# 10. R2 Storage Design

## 10.1 R2 Is for Raw Objects

R2 stores:

```txt
audio files
video files
PDFs
images
screenshots
exports
import bundles
original connector attachments
```

Postgres stores metadata.

## 10.2 Object Key Format

```txt
workspaces/{workspaceId}/users/{userId}/sources/{sourceId}/original/{filename}
workspaces/{workspaceId}/users/{userId}/sources/{sourceId}/processed/transcript.json
workspaces/{workspaceId}/users/{userId}/exports/{exportId}/debo-export.zip
```

## 10.3 Upload Flow

```txt
Frontend requests upload URL
  ↓
API creates source row with status=draft
  ↓
API returns presigned R2 upload URL
  ↓
Frontend uploads directly to R2
  ↓
Frontend confirms upload
  ↓
API marks source=uploaded
  ↓
API triggers ingestion job
```

## 10.4 Download Flow

```txt
Frontend requests source file
  ↓
API checks user permission
  ↓
API creates short-lived signed URL
  ↓
Frontend downloads/streams from R2
```

Never expose public bucket URLs for private user data.

---

# 11. Memory Engine Design

## 11.1 Memory Layers

Debo memory has 7 layers:

```txt
Layer 1: Raw Source
Layer 2: Clean Text / Transcript
Layer 3: Chunks
Layer 4: Embeddings
Layer 5: Extracted Memory Items
Layer 6: Graph Entities / Relations
Layer 7: Personal Agent Memory
```

## 11.2 Layer 1: Raw Source

This is the proof.

Examples:

```txt
audio recording
PDF file
journal document
email import
calendar event
link snapshot
```

Never lose the raw source unless the user deletes it.

## 11.3 Layer 2: Clean Text

This is the machine-readable representation.

Examples:

```txt
transcript text
parsed PDF text
journal plain text
cleaned webpage text
email body
```

## 11.4 Layer 3: Chunks

Chunks make search possible.

Chunking rules:

```txt
Prefer semantic chunks over fixed-size chunks.
Keep chunk size around 400–900 tokens.
Keep overlap around 60–120 tokens.
Preserve headings, page numbers, timestamps, speaker labels.
Never chunk without source metadata.
```

## 11.5 Layer 4: Embeddings

Each chunk gets embedded and stored in Qdrant.

Vector metadata should include:

```txt
user_id
workspace_id
source_id
chunk_id
source_type
created_at
project_id
people
privacy_level
```

This allows filtered retrieval.

## 11.6 Layer 5: Extracted Memory Items

The extractor should identify:

```txt
facts
promises
tasks
decisions
preferences
ideas
dates
risks
follow-ups
```

Not all extracted memory should be auto-saved.

Use review rules:

```txt
High confidence, low sensitivity → auto-save
Medium confidence → needs review
Sensitive/private → needs review
Task/promise with deadline → needs review or highlight
```

## 11.7 Layer 6: Graph

Graph links answer questions like:

```txt
Who is Raj?
What projects mention R2?
Which decisions changed?
What tasks came from this call?
Which sources support this answer?
```

## 11.8 Layer 7: Agent Memory

Use Mem0 for conversational personalization.

Examples:

```txt
User prefers short direct answers.
User prefers minimal premium UI.
User is building Debo in public.
```

But Mem0 should not be the only product memory store.

---

# 12. Ingestion Pipelines

## 12.1 Universal Ingestion Flow

Every source follows the same high-level pipeline:

```txt
create source
save raw content
normalize content
extract text/transcript
summarize
chunk
embed
extract memory items
extract entities/tasks/decisions
link graph
mark ready
```

## 12.2 Journal Ingestion

```txt
User writes journal in BlockNote
  ↓
Save document JSON
  ↓
Generate plain text mirror
  ↓
Create source
  ↓
Summarize
  ↓
Extract tasks/entities/decisions
  ↓
Chunk and embed
  ↓
Mark ready
```

## 12.3 Voice Note Ingestion

```txt
User records audio
  ↓
Upload audio to R2
  ↓
Create source
  ↓
Transcribe with AssemblyAI or Deepgram
  ↓
Store transcript segments
  ↓
Summarize
  ↓
Extract tasks/promises/people/dates
  ↓
Chunk transcript with timestamps
  ↓
Embed chunks
  ↓
Mark ready or needs_review
```

## 12.4 Video Ingestion

```txt
Upload video to R2
  ↓
Extract audio if needed
  ↓
Transcribe audio
  ↓
Optional: frame/key visual analysis later
  ↓
Generate transcript + summary
  ↓
Extract tasks/entities
  ↓
Chunk by transcript segments
  ↓
Embed
```

## 12.5 File/PDF Ingestion

```txt
Upload file to R2
  ↓
Detect MIME type
  ↓
Parse with LlamaParse / OCR provider
  ↓
Store parsed text
  ↓
Preserve page numbers
  ↓
Summarize
  ↓
Extract entities/tasks/decisions
  ↓
Chunk by headings/pages
  ↓
Embed
```

## 12.6 Link Ingestion

```txt
User saves URL
  ↓
Fetch metadata
  ↓
Snapshot title/description/content
  ↓
Clean article content
  ↓
Store source_url
  ↓
Summarize
  ↓
Chunk and embed
```

## 12.7 Connector Ingestion

```txt
User connects Gmail/Calendar/Notion/etc.
  ↓
User chooses memory rules
  ↓
Composio/Nango syncs records
  ↓
Debo imports selected records only
  ↓
Each imported record becomes a source
  ↓
Run normal ingestion pipeline
```

Connector data should always be controlled by sync rules.

---

# 13. Ask Debo Retrieval Pipeline

## 13.1 Goal

Ask Debo should answer questions from memory with citations.

## 13.2 Query Flow

```txt
User asks question
  ↓
Auth + workspace check
  ↓
Classify intent
  ↓
Rewrite query for retrieval
  ↓
Apply filters if provided
  ↓
Retrieve candidates from Qdrant
  ↓
Retrieve keyword matches from Postgres
  ↓
Retrieve people/tasks/projects if relevant
  ↓
Retrieve Mem0 personalization context
  ↓
Rerank candidates
  ↓
Build answer context
  ↓
Generate answer
  ↓
Validate sources
  ↓
Save answer + citations
  ↓
Return streamed response
```

## 13.3 Intent Types

```txt
memory_recall
source_summary
task_search
person_search
project_search
action_request
connector_query
planning
writing
unknown
```

## 13.4 Retrieval Sources

Use multiple retrieval paths:

```txt
Vector search       semantic similarity
Postgres keyword    exact names, dates, titles
People/tasks table  structured data
Recent sources      recency boost
Mem0                user preferences
Composio            live external action if needed
```

## 13.5 Retrieval Ranking Rules

Boost sources that are:

```txt
recent
exact person match
exact project match
high importance
user-approved
same source type requested
strong keyword overlap
```

Penalize sources that are:

```txt
low confidence
rejected
deleted
private session excluded
outdated decision
```

## 13.6 Answer Rules

The answer generator must obey:

```txt
If source exists, cite it.
If source is weak, say so.
If no source is found, say no source was found.
Never invent memory.
Separate memory-backed answer from general reasoning.
Prefer concise answers.
Offer actions.
```

## 13.7 Citation Format

Every citation should point to:

```txt
source_id
chunk_id
source title
source type
created date
timestamp/page if available
short excerpt
```

Examples:

```txt
Voice note · Marketing Sync · 0:12–0:21
PDF · Q4 Allocation Draft · page 3
Journal · Debo Ideas · May 12
Gmail · Raj · Budget follow-up
```

---

# 14. AI Agents

## 14.1 Agents To Build

### ask-debo-agent

Purpose:

```txt
Answer user questions using Debo memory.
```

Tools:

```txt
searchMemory
searchSources
getPerson
getTasks
getProject
createTask
queryConnector
```

### memory-ingestion-agent

Purpose:

```txt
Extract useful structured memory from raw source text.
```

Outputs:

```txt
summary
memory_items
entities
tasks
decisions
people
projects
```

### task-extraction-agent

Purpose:

```txt
Find commitments, deadlines, and follow-ups.
```

### connector-agent

Purpose:

```txt
Use Composio to read or act on connected apps when explicitly allowed.
```

### weekly-review-agent

Purpose:

```txt
Generate weekly memory review.
```

### voice-agent

Purpose:

```txt
Talk with the user in realtime via LiveKit and save useful session memory.
```

## 14.2 Agents Should Return Structured JSON

For extraction, never accept free-form text only.

Use schemas.

Example extraction output:

```json
{
  "summary": "The user discussed Q4 budget planning and promised Raj a final draft by Friday.",
  "tasks": [
    {
      "title": "Send finalized Q4 budget allocation to Raj",
      "dueDate": "Friday",
      "relatedPerson": "Raj",
      "confidence": 0.91,
      "evidence": "I’ll send Raj the finalized Q4 budget by Friday."
    }
  ],
  "people": [
    {
      "name": "Raj",
      "context": "Related to Q4 budget planning",
      "confidence": 0.88
    }
  ],
  "decisions": [],
  "memoryItems": [
    {
      "type": "promise",
      "content": "User promised Raj the finalized Q4 budget allocation by Friday.",
      "importance": "high",
      "confidence": 0.91
    }
  ]
}
```

## 14.3 Prompt Versioning

Every AI-generated output should store:

```txt
model
provider
prompt_name
prompt_version
temperature
input_hash
output_hash
```

This helps debugging.

---

# 15. API Design

## 15.1 API Style

Use REST-like endpoints with typed request/response schemas.

Later, add OpenAPI docs.

All endpoints should:

```txt
validate input with Zod
verify auth
check workspace permission
return typed errors
write audit logs for sensitive actions
```

## 15.2 API Route Groups

```txt
/auth
/workspaces
/sources
/uploads
/library
/ask
/journal
/tasks
/people
/projects
/connectors
/voice
/vault
/settings
/admin
```

---

# 16. Important API Endpoints

## 16.1 Create Source

```txt
POST /sources
```

Body:

```json
{
  "type": "journal",
  "title": "Daily reflection",
  "content": "Today I decided...",
  "projectId": "optional"
}
```

Returns:

```json
{
  "sourceId": "src_123",
  "status": "processing"
}
```

## 16.2 Create Upload URL

```txt
POST /uploads/presign
```

Body:

```json
{
  "filename": "meeting.webm",
  "mimeType": "audio/webm",
  "sizeBytes": 1234567,
  "sourceType": "voice"
}
```

Returns:

```json
{
  "sourceId": "src_123",
  "fileId": "file_123",
  "uploadUrl": "signed-url",
  "r2Key": "workspaces/.../meeting.webm"
}
```

## 16.3 Confirm Upload

```txt
POST /uploads/:fileId/confirm
```

Returns:

```json
{
  "sourceId": "src_123",
  "status": "processing"
}
```

## 16.4 Ask Debo

```txt
POST /ask
```

Body:

```json
{
  "threadId": "optional",
  "question": "What did I promise Raj?",
  "mode": "recall",
  "filters": {
    "sourceTypes": ["voice", "journal"],
    "dateRange": "last_30_days"
  }
}
```

Returns streamed events:

```txt
retrieval_started
source_found
answer_delta
citation_added
action_suggested
done
```

## 16.5 Library Search

```txt
GET /library?query=budget&type=voice&person=Raj
```

Returns:

```json
{
  "items": [],
  "nextCursor": null
}
```

## 16.6 Source Detail

```txt
GET /sources/:sourceId
```

Returns:

```json
{
  "source": {},
  "summary": "...",
  "transcript": {},
  "tasks": [],
  "people": [],
  "relatedSources": []
}
```

## 16.7 Approve Extracted Task

```txt
POST /tasks/:taskId/approve
```

## 16.8 Dismiss Extracted Task

```txt
POST /tasks/:taskId/dismiss
```

## 16.9 Connect App

```txt
POST /connectors/:provider/connect
```

## 16.10 Update Connector Rules

```txt
PATCH /connectors/:connectorId/rules
```

Body:

```json
{
  "rules": {
    "mode": "manual_only",
    "allowedSenders": ["raj@example.com"],
    "importAttachments": false
  }
}
```

## 16.11 Export User Data

```txt
POST /vault/export
```

## 16.12 Delete Source

```txt
DELETE /sources/:sourceId
```

Deletion should trigger:

```txt
soft delete
remove vectors
delete R2 files
delete derived memory
write audit log
```

---

# 17. Background Jobs

## 17.1 Job List

```txt
ingest-source
transcribe-audio
transcribe-video
parse-document
parse-link
summarize-source
extract-memory
extract-tasks
extract-entities
chunk-source
embed-chunks
index-vectors
sync-connector
generate-weekly-review
export-user-data
delete-source-data
delete-user-data
```

## 17.2 ingest-source

This is the main orchestrator.

```txt
Input: source_id
Steps:
1. Load source
2. Detect source type
3. Route to specific parser/transcriber
4. Store clean text/transcript
5. Summarize
6. Extract structured memory
7. Chunk
8. Embed
9. Create graph links
10. Mark ready/needs_review
```

## 17.3 Retry Rules

```txt
Transient network failure → retry
Provider rate limit → retry with delay
Invalid file → fail permanently
Permission error → fail permanently
AI schema invalid → retry with stricter prompt once
```

## 17.4 Idempotency

Every job must be idempotent.

Use:

```txt
source_id + job_type as idempotency key
checksum for uploaded files
chunk version numbers
embedding model version
```

If a job reruns, it should not duplicate chunks, tasks, or memory items.

---

# 18. Voice and LiveKit Backend

## 18.1 Realtime Voice Session Flow

```txt
Frontend requests voice session
  ↓
API creates LiveKit room token
  ↓
User joins room
  ↓
LiveKit agent joins room
  ↓
Deepgram transcribes realtime audio
  ↓
Agent responds with voice
  ↓
Transcript segments are buffered
  ↓
Session ends
  ↓
Transcript becomes Debo source
  ↓
Normal ingestion pipeline runs
```

## 18.2 Voice Session Table

```txt
voice_sessions
- id
- user_id
- workspace_id
- livekit_room_name
- source_id
- mode: talk | debrief | plan | meeting | pitch_practice
- status: active | ended | failed
- started_at
- ended_at
- metadata_json
```

## 18.3 Post-Call Memory

After every call, generate:

```txt
summary
tasks
people mentioned
decisions
follow-ups
full transcript
```

Ask user to approve important extracted items.

---

# 19. Connectors Backend

## 19.1 Connector Philosophy

Connectors should be permission-first.

Debo should never feel like it is spying.

Every connector needs:

```txt
plain-English permissions
sync rules
manual pause
disconnect
import history
```

## 19.2 Composio Use

Use Composio for agent actions:

```txt
search Gmail when user asks
read calendar when user asks
create task in external app
open GitHub context
fetch Notion pages
```

## 19.3 Nango Use Later

Use Nango later for recurring product sync:

```txt
scheduled Gmail sync
calendar event sync
Notion page sync
Google Drive sync
webhook handling
incremental records
```

## 19.4 Connector Sync Rules

Examples:

```txt
manual_only
starred_only
selected_people_only
selected_labels_only
selected_projects_only
last_30_days_only
ignore_attachments
```

## 19.5 Connector Import Rules

Every imported external item becomes a source.

```txt
external record → Debo source → normal ingestion pipeline
```

This keeps everything consistent.

---

# 20. Privacy and Security

## 20.1 Data Isolation

Every query must filter by:

```txt
user_id
workspace_id
```

Never trust frontend IDs.

## 20.2 Permission Helper

Create one helper:

```ts
assertCanAccessSource(userId, workspaceId, sourceId)
```

Use this everywhere.

## 20.3 Sensitive Data Rules

Debo handles private memory. Logs must never contain full memory content by default.

Do not log:

```txt
full journal text
full transcript text
email body
private file content
raw connector tokens
signed URLs
```

Safe logs:

```txt
source_id
job_id
user_id hash
status
latency
provider name
error code
```

## 20.4 Signed URLs

Rules:

```txt
Upload URLs short-lived
Download URLs short-lived
No public buckets for private files
No permanent file URLs
```

## 20.5 Connector Tokens

If Composio/Nango stores tokens, avoid duplicating them.

If Debo stores any provider tokens:

```txt
encrypt at rest
rotate when possible
never expose to frontend
revoke on disconnect
```

## 20.6 Private Session

Private session means:

```txt
no memory_items created
no embeddings stored
no Mem0 write
chat messages may be temporary
raw source saved only if user explicitly saves
```

## 20.7 Delete Flow

When user deletes a source:

```txt
mark source deleted
hide immediately from UI
queue deletion job
remove vectors
remove chunks
remove memory_items
remove tasks/entities generated only from that source
remove R2 objects
write audit log
```

## 20.8 Export Flow

Export should include:

```txt
sources metadata
journal documents
transcripts
memory items
tasks
people
projects
audit summary
original files if user chooses
```

Formats:

```txt
JSON
Markdown
CSV for tasks/people
ZIP archive
```

---

# 21. Rate Limiting and Abuse Protection

Add rate limits for:

```txt
ask endpoint
upload URL creation
large file uploads
transcription jobs
connector syncs
AI extraction jobs
voice session creation
```

Use separate limits by plan later.

Example MVP limits:

```txt
Ask: 30/hour
Uploads: 50/day
Voice sessions: 10/day
Max file size: 100MB initially
Max audio length: 60 minutes initially
```

---

# 22. Observability

## 22.1 What To Track

Track every important backend flow:

```txt
source created
file uploaded
ingestion started
ingestion completed
ingestion failed
ask started
retrieval completed
answer generated
citation count
connector connected
connector sync failed
voice session started
voice session ended
```

## 22.2 LLM Observability

Use Langfuse for:

```txt
prompt versions
retrieval context
model latency
token cost
failed generations
schema extraction errors
answer quality feedback
```

## 22.3 Product Analytics

Use PostHog for:

```txt
activation funnel
capture frequency
ask frequency
source opens
task approvals
connector connects
retention
feature flags
```

## 22.4 Error Tracking

Use Sentry for:

```txt
API exceptions
worker failures
frontend/backend traces
performance problems
```

---

# 23. Quality and Evaluation

Debo needs AI evals early.

## 23.1 Evaluation Cases

Create a small dataset:

```txt
What did I promise Raj?
Summarize my last meeting.
What tasks are hidden here?
Who did I mention in this voice note?
What decisions did I make about Debo?
Find sources about R2 storage.
```

## 23.2 Answer Quality Checks

Evaluate:

```txt
Did answer cite sources?
Did answer invent unsupported facts?
Did it retrieve the correct source?
Did it miss obvious tasks?
Did it expose private-session data?
Was the answer concise?
```

## 23.3 User Feedback

Every AI answer should allow:

```txt
Helpful
Not helpful
Wrong source
Missing source
Too verbose
```

Store feedback for future evals.

---

# 24. Backend Environment Variables

```txt
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
CLOUDFLARE_VECTORIZE_INDEX=
CLOUDFLARE_API_TOKEN=
TRIGGER_SECRET_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
ASSEMBLYAI_API_KEY=
DEEPGRAM_API_KEY=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
MEM0_API_KEY=
COMPOSIO_API_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASE_URL=
POSTHOG_KEY=
SENTRY_DSN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
```

---

# 25. Deployment Plan

## 25.1 MVP Deployment

```txt
Landing: Cloudflare Worker
App: Vercel (Next.js Node runtime)
Worker: Trigger.dev
Database: Neon
Storage: Cloudflare R2
Vector: Qdrant
Voice: LiveKit Cloud
Cache: Upstash Redis
```

## 25.2 More Serious Deployment

```txt
Landing: Cloudflare Worker
App: Vercel (Next.js Node runtime)
Worker: Trigger.dev dedicated
Voice Agent: LiveKit Cloud or dedicated Node worker later
Database: Neon with branching/backups
Storage: R2
Vector: Qdrant/Turbopuffer
```

## 25.3 Why Separate API Later

Next.js route handlers are okay for MVP.

But a separate API service is better when Debo has:

```txt
mobile app
browser extension
web app
public API
longer-lived auth/session handling
more complex observability
```

---

# 26. Build Phases

## Phase 1: Backend Skeleton

Build:

```txt
monorepo
api app
worker app
db package
auth package
storage package
basic source tables
health endpoint
```

Endpoints:

```txt
GET /health
GET /me
POST /sources
GET /sources
GET /sources/:id
```

## Phase 2: Capture and Storage

Build:

```txt
R2 presigned uploads
source_files table
upload confirm endpoint
source status system
basic ingestion job stub
```

## Phase 3: Journal Memory

Build:

```txt
journal source creation
BlockNote JSON storage
plain text mirror
summary generation
chunking
embedding
library search
```

## Phase 4: Ask Debo MVP

Build:

```txt
ask endpoint
vector retrieval
source citations
answer generation
chat_threads
chat_messages
answer_citations
```

## Phase 5: Audio/Video

Build:

```txt
audio upload
AssemblyAI transcription
transcript table
timestamp chunks
voice note summaries
task extraction
```

## Phase 6: Tasks and People

Build:

```txt
entity extraction
people table
person mentions
task extraction
task review queue
approve/dismiss flows
```

## Phase 7: Connectors

Build:

```txt
Composio integration
connector accounts
manual Gmail/Calendar/Notion import
sync rules
connector audit logs
```

## Phase 8: LiveKit Voice

Build:

```txt
voice session endpoint
LiveKit token creation
LiveKit agent service
realtime STT
post-call source ingestion
```

## Phase 9: Vault and Trust

Build:

```txt
source delete
full data export
audit logs
private session
memory review controls
connector disconnect flow
```

---

# 27. MVP Backend Scope

Do not build everything at once.

The first real backend should support this exact demo:

```txt
1. User signs in.
2. User creates a journal memory.
3. Debo saves the source.
4. Debo summarizes it.
5. Debo extracts one task/person.
6. Debo chunks and indexes it.
7. User asks a question.
8. Debo answers with a source citation.
```

Then add voice.

The simplest backend loop:

```txt
Create source → Process source → Index source → Ask source → Cite source
```

---

# 28. Critical Backend Rules

## Rule 1: Every AI Output Needs a Source

No extracted task, decision, person, or answer should exist without a source link.

## Rule 2: User Control Comes Before Automation

When uncertain, ask for review.

## Rule 3: Raw Source Is Sacred

Never overwrite original source content.

Create versions instead.

## Rule 4: Jobs Must Be Retryable

Processing will fail. Design for retry.

## Rule 5: Deletion Must Actually Delete

If user deletes memory, remove vectors, chunks, files, and derived data.

## Rule 6: Avoid AI Where Code Is Better

Do not use LLMs for permissions, IDs, deletes, billing, or access control.

## Rule 7: Privacy Must Be Visible

Backend should support frontend trust features:

```txt
source history
audit logs
export
delete
pause memory
private session
connector rules
```

---

# 29. Example End-to-End Flow

## User records voice note

```txt
Frontend starts recording
  ↓
Frontend requests upload URL
  ↓
API creates source + source_file
  ↓
Frontend uploads audio to R2
  ↓
Frontend confirms upload
  ↓
API queues ingest-source
  ↓
Worker transcribes audio
  ↓
Worker stores transcript
  ↓
Worker extracts task:
    “Send Q4 budget to Raj by Friday”
  ↓
Worker creates person Raj if needed
  ↓
Worker chunks transcript
  ↓
Worker embeds chunks
  ↓
Worker marks source ready
  ↓
Frontend shows memory ready
```

## User asks: “What did I promise Raj?”

```txt
API classifies intent as memory_recall
  ↓
Search Qdrant for Raj + promise
  ↓
Search tasks table for Raj
  ↓
Finds voice note chunk and task
  ↓
Agent generates answer
  ↓
API saves chat message + citations
  ↓
Frontend shows answer with source card
```

---

# 30. Future Scaling Plan

## When Sources Grow

Add:

```txt
Turbopuffer for large vector/full-text scale
read replicas
source partitioning by workspace/user
more aggressive archival
```

## When Jobs Grow

Add:

```txt
separate queues by job type
priority queues
concurrency limits per user
provider fallback system
```

## When Teams Arrive

Add:

```txt
workspace roles
shared sources
team memory spaces
permissioned sources
organization audit logs
```

## When Enterprise Arrives

Add:

```txt
SSO
SCIM
data residency
DLP controls
retention policies
legal hold
admin exports
workspace-level encryption controls
```

---

# 31. Final Backend Blueprint

Debo backend should be simple on the outside and strong on the inside.

The final architecture:

```txt
Frontend app
  ↓
API service
  ↓
Postgres metadata + R2 raw files
  ↓
Trigger.dev processing jobs
  ↓
Transcription / parsing / extraction
  ↓
Memory engine
  ↓
Vector search + structured graph + Mem0 personalization
  ↓
LangGraph Ask Debo graph
  ↓
Source-backed answer
```

The first backend milestone:

```txt
journal source → process → index → ask → citation
```

The first impressive backend demo:

```txt
voice note → transcript → extracted task/person → ask Debo → source-backed answer
```

The long-term backend moat:

```txt
A private, source-backed, user-controlled memory graph.
```

That is what makes Debo more than a chatbot.
