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