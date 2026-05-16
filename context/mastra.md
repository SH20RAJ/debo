# Mastra Integration

**Framework**: Mastra - AI agent framework for TypeScript
**Config**: `src/mastra/index.ts`
**Storage**: In-memory LibSQL (for dev; use Cloudflare D1 for production)

## Agents

### `debo` (`src/mastra/agents/debo.ts`)
Main Debo agent - general-purpose life intelligence assistant.

### `deboCompanion` (`src/mastra/agents/companion.ts`)
Companion agent - conversational, supportive interactions.

### `deboLibrarian` (`src/mastra/agents/librarian.ts`)
Librarian agent - focused on information retrieval and organization.

### `deboAnalyst` (`src/mastra/agents/analyst.ts`)
Analyst agent - pattern analysis and insights from user data.

### `weatherAgent` (`src/mastra/agents/weather-agent.ts`)
Weather agent - example/utility agent for weather data.

---

## Tools

### `debo-tools.ts`
Core Debo tools for agents:
- Journal access and search
- Memory query and management
- Character graph operations

### `composio-tools.ts`
Composio integration tools:
- Google Drive operations
- External service connectors

### `mem0-tools.ts`
Mem0 memory API tools:
- Cross-session memory persistence
- Memory search across users

### `weather-tool.ts`
Weather data tool (utility/example).

---

## Workflows

### `journal-processing` (`src/mastra/workflows/journal-processing.ts`)
Post-save journal processing:
1. Extract memory (facts, entities, emotions)
2. Update character graph
3. Index vectors
4. Generate insights

### `daily-analysis` (`src/mastra/workflows/daily-analysis.ts`)
Daily analysis workflow:
1. Review recent journals and activity
2. Identify patterns and trends
3. Generate daily summary

### `weatherWorkflow` (`src/mastra/workflows/weather-workflow.ts`)
Weather workflow (utility/example).

---

## Configuration

```typescript
// src/mastra/index.ts
export const mastra = new Mastra({
  workflows: { weatherWorkflow, dailyAnalysis, journalProcessing },
  agents: { weatherAgent, debo, deboCompanion, deboLibrarian, deboAnalyst },
  backgroundTasks: {
    enabled: true,
    globalConcurrency: 10,
    perAgentConcurrency: 5,
  },
  logger: new PinoLogger({ name: 'Mastra', level: 'info' }),
  storage: new LibSQLStore({ id: "mastra-storage", url: ":memory:" }),
});
```

## Background Tasks

- Enabled with concurrency limits
- Global: 10 concurrent tasks
- Per agent: 5 concurrent tasks
- Used for memory extraction, character sync, vector indexing
