# Technical Architecture

## 1. High-Level Architecture

Debo is split into three layers:

1. The Next.js application layer for UI, auth, and server actions.
2. The retrieval layer for embeddings, Qdrant search, and structured memory.
3. The AI orchestration layer for tool calling, ranking, citations, and streaming responses.

```mermaid
graph TD
    User[User] --> App[Next.js 16 App Router]
    App --> Auth[Better Auth]
    App --> Editor[Journal Editor]
    App --> Ask[askQuestionAction]
    App --> Timeline[Timeline Views]
    App --> Graph[Memory Graph Views]

    Editor --> Save[Journal Save Action]
    Save --> DB[(Neon Postgres)]
    Save --> Chunk[Chunking + Embedding Job]
    Chunk --> Embeddings[Embedding Model]
    Chunk --> Qdrant[(Qdrant)]
    Save --> MemoryExtract[Memory Extraction]
    MemoryExtract --> MemoryStore[(Postgres Memory Tables)]

    Ask --> Context[buildRetrievedContext]
    Context --> JournalSearch[Journal Search Tool]
    Context --> MemorySearch[Memory Search Tool]
    JournalSearch --> Qdrant
    JournalSearch --> DB
    MemorySearch --> MemoryStore
    Context --> Rank[Ranking + Dedupe]
    Rank --> Prompt[System Prompt + Citations]
    Prompt --> Gateway[Cloudflare AI Gateway]
    Gateway --> Model[LLM Provider]
    Model --> Stream[Streaming UI Response]
    Stream --> App
```

## 2. Data Flow

### Journal Flow

The journal pipeline starts when a user writes an entry.

1. The entry is saved in Neon Postgres through a server action.
2. The content is chunked for retrieval.
3. Each chunk is embedded and stored in Qdrant with payload metadata.
4. The same content is passed to the first-party memory engine for persistent memory extraction.
5. The result is a dual store: Qdrant holds searchable journal vectors, while Postgres memory tables hold durable facts and preferences.

This split matters because journal text and long-term memory serve different jobs. Qdrant is optimized for semantic retrieval of source text. The structured memory engine is optimized for stable facts that should survive summarization and re-asking.

### Query Flow

The question flow is designed for grounded answers.

1. The user sends a question through `askQuestionAction`.
2. `askLifeStream` builds context from both journals and structured memory.
3. Tools fetch the most relevant journal citations, memory citations, and recent entries.
4. The retrieved context is ranked, deduplicated, and formatted into a prompt.
5. The model generates a streaming answer with citations.

In practice the flow looks like this:

User -> askLife -> tools -> context -> LLM -> response

## 3. RAG System

Debo uses retrieval-augmented generation to answer from personal history instead of model memory alone.

### Chunking

Journal entries are split into smaller chunks before indexing. Chunking improves recall because a long entry can contain several unrelated ideas, and a single embedding for the whole entry would dilute the signal.

### Embeddings

Each chunk is embedded before being written to Qdrant. The vector store keeps the semantic representation alongside metadata such as user ID, journal ID, title, chunk index, and creation time.

### Retrieval

When the user asks a question, the query is embedded and compared against the vector index. The system fetches a larger candidate set than it will eventually return so that downstream ranking can discard weak matches.

### Ranking

The retrieval layer scores sources using semantic relevance, recency, repetition, and inferred importance. Journal sources and memory sources are merged into one ranked context set. Duplicate sources are removed before the model sees them.

This is important because a simple vector search alone is not enough. A journal answer should prefer the most recent and most informative evidence, not just the closest embedding.

## 4. Memory System

Debo's persistent memory layer is implemented in-house.

### Extraction

When a journal entry or conversation is saved, the memory engine processes the text and extracts facts that should persist beyond one session. Examples include stable preferences, recurring worries, people, goals, and ongoing projects.

### Storage

The application stores memory engine state directly in Postgres. There is no separate third-party memory provider to configure per account.

### Usage

During question answering, structured memories are retrieved alongside journal citations and folded into the context window. The assistant can then reference a stable memory such as a preference or identity fact without re-deriving it from raw journal text.

## 5. Pattern Detection Engine

Pattern detection is the layer that turns retrieved sources into higher-level insight.

### How Patterns Are Detected

The system looks for repeated entities and themes across ranked sources. That includes repeated people, topics, and emotions. It also considers recurrence across time so the output reflects habits instead of isolated events.

### Scoring Logic

Pattern strength should increase when:

1. The same entity appears in multiple sources.
2. The topics recur across separate days.
3. The sources are recent and semantically relevant.
4. The emotion or subject carries high signal for the user's question.

### Examples

- A recurring stress pattern before deadlines.
- Morning entries showing better focus and more optimistic tone.
- A specific person repeatedly appearing in both positive and negative contexts.

The goal is not to label the user. The goal is to reveal patterns that help the user make better decisions.

## 6. Timeline System

The timeline is a structured view of life over time.

### Daily Summaries

Entries can be grouped into daily views so the user can review what happened on a given day without opening every raw note.

### Aggregation

The timeline layer can aggregate entries by date, project, emotion, or theme. This makes the product useful for both short-term recall and long-term review.

The timeline is the simplest interface to the user's history, but it is fed by the same indexed data as search and memory.

## 7. Memory Graph

Debo models personal knowledge as a graph.

### Nodes

Nodes represent people, events, topics, emotions, goals, and stable facts.

### Edges

Edges represent relationships such as:

- person -> event
- emotion -> event
- topic -> goal
- person -> recurring context

### Why It Matters

A graph structure makes it possible to ask richer questions than search alone can answer. Instead of just returning a similar journal entry, Debo can connect related things and expose the shape of a user's life.

## 8. AI Orchestration

Debo uses the Vercel AI SDK for prompt execution, tool calling, and streaming responses.

### Tool Calling

The assistant can call tools for journal search, memory retrieval, and recent entries. Tools keep retrieval out of the prompt until it is needed, which reduces noise and improves grounding.

### Streaming

Answers are streamed to the UI as soon as the model starts generating. This keeps the product responsive even when the backend is doing multi-step retrieval.

### Context Building

Before generation, the system builds a compact context block containing ranked sources, snippets, and timestamps. This gives the model the evidence it needs without flooding the prompt with full documents.

### Cloudflare AI Gateway

Model traffic is routed through Cloudflare AI Gateway so providers can be managed consistently. This helps with observability, provider switching, and future failover strategies.

## 9. Scaling Strategy

Debo should scale horizontally without changing the product model.

### Horizontal Scaling

Next.js server actions and route handlers remain stateless, so the app can scale across multiple instances. Persistent state lives in Neon, Qdrant, and the in-house memory tables rather than in memory.

### Vector DB Scaling

Qdrant can scale independently from the web application. As journal volume grows, the vector layer can be tuned without changing the UI or the core answer flow.

### Caching

The system should cache stable, repeated retrieval work where appropriate, but never at the cost of freshness for recent journal data. Recent entries and recent memories should remain easy to refresh.

### Operational Boundaries

The architecture keeps the UI light, the retrieval layer explicit, and the model orchestration isolated. That separation makes it easier to debug quality issues, control cost, and introduce new retrieval sources later.
