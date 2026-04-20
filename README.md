# Debo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-Security-blue)](https://better-auth.com/)

<img src="./public/og-image.png" alt="Debo AI Companion" width="100%" />

**The intelligent AI companion and journaling application that actively understands your life.**

Debo is not just a journal—it's a living, memory-optimized system powered by the edge. Built with extreme minimalism on the surface, its backend integrates with your world using 130+ connectors and sophisticated AI protocols.

## Capabilities

*   **Clean Journaling**: Distraction free, pure minimalist interface using Shadcn UI.
*   **RAG & AI Search**: Ask your journal anything. Debo remembers and retrieves exactly what you need via Cloudflare Vectorize.
*   **Mem0 Integration**: A dynamic memory layer that silently learns your preferences, relationships, and routines as you write.
*   **130+ App Connectors**: Plug in Gmail, Notion, Google Calendar, and more to contextualize your entries.
*   **Bring Your Own Key (BYOK)**: Use our default models (Cloudflare Workers AI) at no extra cost, or plug in your own API keys for OpenAI, Anthropic, or local Ollama servers.
*   **MCP Support**: Add external tools by providing MCP server URLs, and export your Debo data via the native Debo MCP server.

## Tech Stack
*   **Frontend**: Next.js App Router, React, TailwindCSS v4, Shadcn UI
*   **Auth**: Better-Auth
*   **Database**: Neon DB (Serverless Postgres)
*   **Edge & AI**: Cloudflare Workers, Workers AI, Vectorize, R2 (managed via Wrangler)
*   **AI Interfaces**: `assistant-ui`, `mem0`, `@modelcontextprotocol/sdk`

## Getting Started

### Prerequisites
*   Node.js & `bun`
*   A Cloudflare account
*   A NeonDB connection string

### Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill out your Neon DB credentials and Better-Auth secrets.
   
3. **Cloudflare Setup**
   Ensure Wrangler is authenticated:
   ```bash
   bunx wrangler login
   ```
   *Provision your vector index and R2 bucket according to the setup guides in `/docs`.*

4. **Run Locally**
   ```bash
   bun run dev
   ```

## Documentation
Discover the full architecture, plans, and technical specifications in the `/docs` directory.
- [PRD](./docs/PRD.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Integration System](./docs/CONNECTORS_AND_AI.md)

## License
MIT License.
