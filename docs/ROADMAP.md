# Roadmap

This roadmap describes the current product stage and the next major directions for Debo.

## Current Stage

Debo is in the intelligence foundation stage.

The core system already has the right shape:

- journals are stored in Neon Postgres,
- journal text is indexed in Qdrant,
- durable memory is handled by the in-house memory engine,
- answers are orchestrated through the Vercel AI SDK,
- model traffic can be routed through Cloudflare AI Gateway.

The product focus now is improving retrieval quality, memory quality, and the clarity of the user experience.

## Next Features

### 1. Better Pattern Detection

Improve recurring emotional and behavioral analysis so Debo can surface stronger trends and better summaries over time.

### 2. Stronger Timeline Views

Add richer day, week, and month views with automatic summaries and easier navigation through past entries.

### 3. Deeper Memory Graph

Expand the graph model so people, projects, topics, and emotions can be connected more explicitly and queried more naturally.

### 4. Smarter Citations

Improve source highlighting, confidence indicators, and explanation quality so answers are easier to verify.

### 5. Connector Expansion

Broaden external context sources through integrations and MCP-compatible tools.

### 6. Better Personalization

Use long-term memory and repeated patterns to adapt tone, suggestions, and summaries to each user.

## Long-Term Vision

Debo should become a personal operating system for life context.

That means the system should be able to:

- predict what the user may need next,
- summarize how they are changing,
- warn about repeated stress patterns,
- connect work, health, relationships, and goals,
- help the user make better decisions with less friction.

The end state is not a smarter journal. The end state is a trusted life co-pilot.