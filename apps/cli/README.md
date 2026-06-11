# Debo CLI & Model Context Protocol (MCP) Server

This package contains the command-line utility and local MCP server for Debo, the private AI memory OS.

---

## 1. Installation

You can install the CLI globally from npm:

```bash
npm install -g @debo.life/cli
```

Or run it directly using `npx`:

```bash
npx @debo.life/cli login <userId>
```

---

## 2. Command Reference

### Login
Authenticate your local CLI session with your Debo User ID:
```bash
debo login <userId>
```

### Search
Run semantic vector queries across your private notes, journals, and files:
```bash
debo search "what was my idea about Apify?"
```

### Journal Management
List, read, create, or update journals:
```bash
# List entries
debo journal list

# Create a new journal entry
debo journal create -t "Meeting notes" -c "Discussed migrating the voice worker to NextJS."
```

### Task Tracking
List and manage checklists/tasks:
```bash
debo task list
```

### Connectors Status
Check external account synchronizations:
```bash
debo connector list
```

---

## 3. Remote HTTP Model Context Protocol (MCP) Setup

We recommend connecting to your remote Debo MCP server (`/api/mcp`) using the `mcp-remote` wrapper, which acts as a bridge for clients that only support local stdio.

### A. Claude Desktop Setup
Add this server block to your local Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://app.debo.life/api/mcp",
        "-h",
        "x-stack-access-token:YOUR_STACK_ACCESS_TOKEN"
      ]
    }
  }
}
```

### B. Cursor Setup
1. Open **Cursor Settings** -> **Models** -> **MCP**.
2. Click **+ Add New MCP Server**.
3. Set the following fields:
   - **Name**: `debo`
   - **Type**: `command`
   - **Command**: `npx -y mcp-remote https://app.debo.life/api/mcp -h x-stack-access-token:YOUR_STACK_ACCESS_TOKEN`