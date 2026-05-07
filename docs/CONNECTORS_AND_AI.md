# Artificial Intelligence & Integrations Design

This document details exactly how Debo manages third-party connections and model generation using standard and emerging AI interaction paradigms.

## 1. Engine / BYOK (Bring Your Own Key) Approach

Debo emphasizes user ownership and privacy by default. 

### Implementation Strategy
*   **Store Settings**: The NeonDB `user_preferences` table will hold encrypted API keys if the user chooses a non-default provider.
*   **Routing Logic**:
    *   The `ai` SDK from Vercel allows dynamic provider injection.
    *   If no custom key is provided: `import { createCloudflareWorkersAI }` is utilized natively through standard bindings.
    *   If OpenAI/Anthropic/Ollama is selected, the backend will initialize the specific Vercel AI provider dynamically per request based on the user's DB configuration.

## 2. Memory Extraction

Long-term memory is critical for a "companion" feel.
*   **Implementation**: Use the first-party memory engine backed by Postgres and AI extraction.
*   **Trigger Mechanism**: Whenever a new journal entry is created, an asynchronous background job (e.g. Cloudflare Queue -> Worker) triggers.
*   **Execution**:
    *   The worker sends the journal raw text to the memory engine.
    *   The engine returns categorized facts.
    *   These facts are stored and pulled concurrently with standard RAG retrieval whenever the user opens the `assistant-ui` chat layout.

## 3. Web2 Connectors

To connect standard internet apps:
*   **Platform**: Use a connector layer that handles OAuth, token refresh, and per-user scopes. Nango is the current candidate, but the product should keep the connector interface abstract.
*   **Usage**: Users can connect Gmail, Google Calendar, Notion, tasks, and social accounts during onboarding or later in settings.
*   **Tooling the Agent**: Once connected, APIs are mapped to AI tools such as `get_todays_calendar`, `draft_calendar_event`, `search_notes`, or `fetch_recent_emails`.
*   **Approval**: Read actions can run silently when the user has granted scope. Write actions should draft first and ask for confirmation unless the user has created an explicit automation rule.

### Connector Example

If the user records a video journal and says, "make me remember that I have to attend X meeting today," Debo should:

1. transcribe the recording,
2. extract the date/time/task,
3. check connected calendar context,
4. draft a calendar event or reminder,
5. ask the user to approve before writing.

## 4. Model Context Protocol (MCP)

MCP unlocks infinite, protocol-level extensibility for Debo.

### Connecting Custom MCPs (The Ingress)
*   **UI Config**: The dashboard can allow users to paste an MCP configuration endpoint.
*   **Runtime Connection**: When the chat is initialized, the Debo server connects to the configured MCP transport supported by the SDK.
*   **Tool Registration**: The connected MCP tools are dynamically mapped to the Vercel AI SDK `tools` object, instantly granting the companion abilities provided by the user's custom MCP server.

### The Debo Server (The Egress)
*   Debo will expose a standard HTTP/SSE MCP API at `debo.app/api/mcp`.
*   An external AI agent (like Claude Desktop) connecting to this URL will be able to call:
    *   `read_journal_entries({ date_range })`
    *   `create_journal_entry({ text })`
    *   `get_memories_summary()`
*   This turns the user's journaling habit into a queryable data source for their entire OS-level AI setup.

## 5. Orchestration Layer

Debo should use Mastra as the product orchestration layer:

*   **Agents** for open-ended chat, voice, retrieval, and analysis.
*   **Tools** for journals, memory, graph search, MCP, and connector actions.
*   **Workflows** for deterministic pipelines such as transcription, OCR, indexing, memory extraction, graph refreshes, and calendar drafting.
*   **Memory/RAG** for compact, ranked context instead of dumping raw user data into every prompt.

This keeps the app faster because capture can complete immediately while expensive AI work runs in background workflows.
