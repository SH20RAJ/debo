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

## 3. Web2 Connectors (Nango)

To connect 130+ standard internet apps:
*   **Platform**: We will architect around `Nango` for handling the OAuth dancers and syncing.
*   **Usage**: The Debo dashboard will have an "Integrations" page. Clicking "Connect Gmail" initiates Nango's OAuth pop-up.
*   **Tooling the Agent**: Once connected, Nango APIs will be mapped to AI *Tools*. When the user chats with the AI, the AI can invoke tools like `fetch_recent_emails` or `get_todays_calendar` to perfectly answer questions like "How busy am I today?".

## 4. Model Context Protocol (MCP)

MCP unlocks infinite, protocol-level extensibility for Debo.

### Connecting Custom MCPs (The Ingress)
*   **UI Config**: The dashboard allows users to paste an MCP configuration endpoint (SSE URL).
*   **Runtime Connection**: When the chat is initialized, the Debo server spins up an `@modelcontextprotocol/sdk/client/sse` connection.
*   **Tool Registration**: The connected MCP tools are dynamically mapped to the Vercel AI SDK `tools` object, instantly granting the companion abilities provided by the user's custom MCP server.

### The Debo Server (The Egress)
*   Debo will expose a standard HTTP/SSE MCP API at `debo.app/api/mcp`.
*   An external AI agent (like Claude Desktop) connecting to this URL will be able to call:
    *   `read_journal_entries({ date_range })`
    *   `create_journal_entry({ text })`
    *   `get_memories_summary()`
*   This turns the user's journaling habit into a queryable data source for their entire OS-level AI setup.
