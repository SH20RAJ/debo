# Debo life and AI rules

This file specifies developer rules, codebase architecture, and system capabilities for Debo—the private AI memory OS.

---

## 1. IDENTITY & MOTTO
- **Motto:** "Capture anything. Ask your past. Trust every answer."
- **Core Identity:** Debo is a private AI memory OS that captures voice recordings, written journals, files, and third-party connector updates (Gmail, Notion, Slack, GitHub, Calendar, Google Drive, Home Assistant / IoT) into a unified, source-backed semantic memory graph.

---

## 2. MONOREPO ARCHITECTURE

Debo is a TypeScript monorepo with the following deployable applications:

| App Path | Domain | Platform | Description |
|---|---|---|---|
| `apps/landing-page` | `debo.life` | Cloudflare Workers | Public landing page / product pitch. |
| `apps/website` | `app.debo.life` | Vercel | Full Next.js product (Dashboard, Chat, API, Voice, Connectors, AI). |

*Note: `apps/website` is NOT a Cloudflare worker. It runs on standard Vercel Node runtime because LangChain/LangGraph dependencies exceed Cloudflare bundle limits.*

### Deprecated Stack (Do NOT Use)
- **Mastra** (replaced by LangChain/LangGraph)
- **CopilotKit** (replaced by custom chat UI)
- **apps/api** (merged into `apps/website` API routes)
- **apps/agents** (merged into `apps/website/src/server/langgraph/`)
- **apps/voice-worker** (merged into Next.js routes)

---

## 3. DEBO COMMAND LINE INTERFACE (CLI)

The CLI is published as `@debo.life/cli` on npm and maps the binary commands `debo` and `cli`.

### Commands Reference
```bash
# Authenticate CLI with your user account
debo login <userId> [--workspace <workspaceId>]

# Re-generate/update developer rule files (.cursorrules and .clinerules)
debo init

# Run vector semantic queries across your memories and files
debo search "what was my plan for the next version?"

# Manage personal journal entries (chunked and indexed automatically)
debo journal list
debo journal show <journalId>
debo journal create -t "Title" -c "Content body"
debo journal update <journalId> [-t "New Title"] [-c "New Content"]
debo journal delete <journalId>

# Manage tasks & checklists
debo task list
debo task create "Build landing page section" [-d "Description details"]
debo task complete <taskId>

# Monitor third-party connector synchronizations
debo connector
```

---

## 4. MODEL CONTEXT PROTOCOL (MCP)

Debo implements the Model Context Protocol (MCP) to bridge local AI clients with the remote memory graph.

### Core Protocol Approach
Debo favors **HTTP Remote MCP** over local stdio to simplify authentication and eliminate local database setup for external IDEs/clients.

### Integration Command
Use the `mcp-remote` wrapper to expose the remote HTTP endpoint to your local AI harness:
```bash
npx -y mcp-remote https://app.debo.life/api/mcp -h x-stack-access-token:YOUR_STACK_ACCESS_TOKEN
```

---

## 5. DEVELOPER RULES & BOUNDARIES
- **Authentication**: Never bypass authentication in any website API routes.
- **Scoping**: ALWAYS scope all database queries, vectors, and connector syncs by the active `userId`.
- **Frontend Components**: Minimize the use of `"use client"`. Never use it on `page.tsx` or `layout.tsx` files. Export metadata from Server Components instead.
- **Typechecks**: Always verify your changes before pushing by running `bun run typecheck`.
