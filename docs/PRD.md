# Debo - AI-Powered Journal Companion 

## 1. Product Overview
**Debo** is a next-generation daily journaling application that transforms simple text entries into an intelligent, context-aware AI companion. By leveraging native RAG (Retrieval-Augmented Generation), advanced memory systems, and extensive app integrations, Debo becomes a proactive assistant that deeply understands the user's life and context based on their daily updates.

## 2. Core Features (MVP to V1)

### 2.1 Daily Journaling (MVP)
*   **Simple, Clean Core UX**: A distraction-free, minimalist journaling interface using high-quality typography and native Shadcn components.
*   **Rich Text Support**: Markdown, images, and standard formatting.

### 2.2 AI Companion & RAG Search
*   **Conversational Interface**: Interactive chat interface powered by `assistant-ui` (similar to LobeHub) acting as a life companion.
*   **Smart Retrieval**: AI search over past journal entries using Cloudflare Vectorize (RAG).
*   **Long-Term Memory Optimization**: A first-party memory engine to extract and naturally remember specific facts, preferences, and details about the user's life automatically.

### 2.3 BYOK (Bring Your Own Key) & AI Agnosticism
*   **Default Engine**: Powered by Cloudflare Workers AI (fast, edge-based inference) out of the box.
*   **Custom Models**: Users can input APIs for their preferred providers (OpenAI, Anthropic, Gemini) or local models via Ollama. 

### 2.4 Ecosystem Integrations (Connectors)
*   **130+ App Integrations**: Native connectors for pulling data from Gmail, Notion, Calendar, etc., allowing the AI to contextualize the journal against real-world events.
*   **Custom MCP URLs**: Capability to add arbitrary Model Context Protocol (MCP) servers to allow the AI to read metadata from other tools via standard protocols.
*   **Debo MCP**: An exposed MCP server by Debo, allowing users to connect their journaling data to external AI tools (Cursor, Claude Desktop, etc.).

## 3. User Experience & Design
*   **Visual Language**: Pure Shadcn UI, avoiding custom CSS. Strict adherence to layout utilities in Tailwind CSS v4.
*   **Best-in-Class Landing Page**: Highly engaging, modern landing page with clean motions, highlighting the "AI Life Companion" aspect.

## 4. Technical Stack Constraints
*   **Framework**: Next.js (App Router).
*   **Database**: NeonDB for relational data (users, auth state, basic entries).
*   **Auth**: Better-Auth for robust, modern authentication schemas.
*   **Cloudflare Ecosystem**: 
    *   **Vectorize**: For vector embeddings and search.
    *   **R2**: Object storage for journal images/attachments.
    *   **Workers AI**: Edge AI model execution.
    *   **Wrangler**: Infrastructure as Code & deployment management.
*   **Agent Framework**: `ai` SDK + `assistant-ui` for chat, custom orchestration via Cloudflare Workers.
*   **Integrations Libs**: In-house memory storage for continuous memory, `Nango` (or similar) for the 130+ app OAuth connectors.
