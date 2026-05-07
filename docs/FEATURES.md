# Features

This document explains what each major Debo feature does and why it exists.

## 1. AI Memory Engine

### How it works

When a journal entry is saved, Debo sends the text through a first-party memory extraction layer. The memory layer identifies durable facts such as preferences, relationships, goals, routines, and recurring themes. Those memories are stored separately from the journal itself so they can be retrieved later without re-reading every entry.

### Why it matters

Most systems only remember the last prompt. Debo remembers stable facts across time, which makes the assistant more useful and more personal.

## 2. Ask Your Life

### How it works

The question flow retrieves journal citations and memory citations, ranks them, and passes the result to the model with a grounded prompt. The answer is returned with source references so the user can inspect the evidence.

### Why it matters

This turns a private journal into a searchable knowledge base. The user can ask direct questions instead of manually scanning old notes.

## 3. Pattern Detection Engine

### How it works

Debo looks at repeated entities, emotional signals, and recurring themes across retrieved sources. It scores patterns higher when the same idea appears across multiple days or in multiple contexts.

### Why it matters

Patterns are where value appears. A single entry may be interesting, but repeated behavior is what helps the user change habits or make better decisions.

## 4. Life Timeline

### How it works

Entries are organized into date-based views so the user can review what happened across days, weeks, or months. The timeline can also support summaries and grouped views.

### Why it matters

Timeline mode helps the user reconstruct context quickly. It is the fastest way to understand what changed over time.

## 5. Memory Graph

### How it works

Debo represents personal knowledge as nodes and edges. People, topics, emotions, and events can be linked so the system can reason about relationships instead of only individual records.

### Why it matters

The graph exposes structure. It makes it easier to ask richer questions like who is connected to a stressful period or which topics keep appearing together.

## 6. Proactive AI Insights

### How it works

After enough history exists, Debo can summarize recurring behavior and point out likely trends. It should stay conservative and only surface patterns that are supported by the user's own data.

### Why it matters

The best assistant does not only answer questions. It helps the user notice what they would otherwise miss.

## 7. Citations

### How it works

Every answer includes citations from journals or memories. Those citations are produced during retrieval and attached to the UI response.

### Why it matters

Citations build trust. They let the user verify whether an answer is grounded or overconfident.

## 8. Clean Journal Editing

### How it works

Debo keeps the writing surface simple. The editor is designed to let the user write quickly, save often, and return later without friction.

### Why it matters

Good AI only works if the input habit is strong. A clean writing experience makes the rest of the system useful.

## 9. Integrations and Connectors

### How it works

Debo is built to connect with external apps through structured integrations and MCP-compatible tools. That gives the AI access to context beyond the journal itself when the user enables it.

### Why it matters

Life does not happen in one app. Context from calendars, messages, or other systems makes the assistant far more accurate.

## 10. Configuration and Model Choice

### How it works

Debo supports a default AI provider path and user-configurable overrides through the AI Gateway and stored preferences. This allows model routing to be changed without rewriting the product.

### Why it matters

Users and teams should not be locked into one model provider. Configurability makes the system more durable over time.

## 11. Multimodal Journaling

### How it works

Debo should accept text, audio, video, and image-based journal inputs. Audio and video uploads are transcribed into text. Diary page images, notebook scans, and whiteboard photos are processed through OCR. The generated transcript becomes the primary journal text, while the original media remains attached for review.

### Why it matters

Typing is not always the fastest way to journal. A user can record a private vlog, upload a meeting reflection, or photograph handwritten pages and still build useful AI context without manually rewriting everything.

## 12. Live Capture to Memory

### How it works

LiveKit voice sessions should create structured capture events. When the user speaks, Debo can transcribe the session, identify durable facts, extract tasks, and store the transcript as journal context after user confirmation.

### Why it matters

This makes journaling ambient. The user can capture context in the moment instead of waiting for a quiet writing session.

## 13. Connector Actions

### How it works

When users connect accounts during onboarding or settings, Debo can expose approved connector tools to the assistant. Calendar, email, notes, tasks, and social context should be available only after explicit authorization. Action tools should draft or preview high-impact changes before committing them.

### Why it matters

A full assistant needs context and the ability to act. If a user says in a recording, "remind me that I have to attend X meeting today," Debo should be able to turn that into a calendar draft instead of leaving it as plain text.

## 14. Orchestration and Speed

### How it works

Debo uses Mastra agents, tools, workflows, memory, and retrieval pipelines as the orchestration layer. Fast paths should stream immediately and defer expensive indexing, transcription, OCR, and graph refreshes to background workflows. Context should be ranked and packed before model calls.

### Why it matters

The product should feel instant even when the intelligence layer is doing real work. Good orchestration keeps capture fast, retrieval grounded, and connector actions reliable.

## 15. AI Context Import

### How it works

The `/chat` interface accepts exported context from ChatGPT, Claude, Cursor, Codex, Gemini, markdown, or plain text. Debo parses common JSON export shapes, formats the conversations into journal-sized chunks, saves them with `imported-context` tags, and drops a visible receipt into the active chat thread.

### Why it matters

Users already have useful context trapped in other AI tools. Importing it gives Debo a faster starting point without forcing the user to manually rewrite their history.

## 16. Debo MCP Chat

### How it works

Debo exposes MCP tools, resources, and prompts. External agents can call `ask_debo` to talk through the same Debo agent used by `/chat`, call `import_ai_context` to ingest exports, read recent resources such as `debo://chat/threads`, and use prompts like `debo-homie` for correct orchestration.

### Why it matters

Debo becomes the user's portable personal context layer. Claude, Cursor, Codex, Gemini CLI, or a custom agent can ask Debo instead of rebuilding memory from scratch.
