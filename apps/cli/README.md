# Debo CLI & Model Context Protocol (MCP) Server

This package contains the command-line utility and local MCP server for Debo, the private AI memory OS.

---

## 1. Local Monorepo Setup

Because `@debo/cli` is a local workspace package in this monorepo, you do not pull it from the npm registry. Instead, you run it directly from the monorepo root.

### A. Run CLI via Workspace Shortcut
We have registered a root-level shortcut. From the root of the project, run:
```bash
# Log in with your Stack profile ID
bun run cli login <userId>

# Run semantic memory search queries
bun run cli search "what was my idea about Apify?"

# List journal entries
bun run cli journal list

# Create a new journal entry
bun run cli journal create -t "Meeting notes" -c "Discussed migrating the voice worker to NextJS API routes."

# List tasks
bun run cli task list
```

### B. Link CLI Globally
If you want to use the global `debo` binary directly anywhere on your system:
1. Navigate to the CLI package:
   ```bash
   cd apps/cli
   ```
2. Link the binary:
   ```bash
   bun link
   ```
3. Now you can run `debo` commands globally from any directory:
   ```bash
   debo login <userId>
   debo search "your query"
   debo journal list
   ```

---

## 2. Model Context Protocol (MCP) Server Setup

The MCP server is a local Stdio server designed to run alongside AI clients (Claude Desktop, Cursor, etc.). It exposes the following tools:
* `debo_search_memory`: Semantic vector search across your notes, journals, and files.
* `debo_get_citations`: Retrieve complete raw source files and details by source ID.
* `debo_capture_thought`: Capture a thought or journal entry.
* `debo_create_task`: Create a checklist task.
* `debo_list_journals` / `debo_get_journal` / `debo_create_journal`: CRUD journals.
* `debo_list_connectors` / `debo_trigger_connector_sync`: Check connector sync states.

### A. Automatic Claude Desktop Setup
Log in via the CLI, then run the automatic installer command:
```bash
bun run cli mcp install
```
This automatically resolves your absolute workspace paths, reads your local database configuration, and inserts the `debo` server block into your Claude Desktop configuration:
`~/Library/Application Support/Claude/claude_desktop_config.json`

### B. Cursor Editor Setup
To make your personal memory graph searchable inside Cursor:
1. Go to **Cursor Settings** -> **Models** -> **MCP**.
2. Click **+ Add New MCP Server**.
3. Set the configuration details:
   - **Name**: `debo`
   - **Type**: `command`
   - **Command**: `bun run /absolute/path/to/debo/apps/mcp/src/index.ts`
4. Ensure your environment has `DATABASE_URL` and `DEBO_USER_ID` set.