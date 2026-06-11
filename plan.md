# Plan: Debo Connectors Integration Plan

This document details the architecture, catalog, and implementation roadmap for integrating external connectors (Gmail, Calendar, Notion, GitHub, Slack, Google Drive) with the Debo Monorepo.

---

## 1. Core Integration Strategy

Debo's connector system operates on a dual-plane architecture:
1. **Memory Ingestion (Read/Sync Plane)**: Periodically or on-demand polls connected services to pull data (emails, calendar events, documents, commits), maps them into `sources` records, chunks/embeds them, and index-saves them into Qdrant using the `indexSource` pipeline. This makes external data searchable and citable in "Ask Debo".
2. **Action Execution (Write/Action Plane)**: Exposes actions (e.g., sending emails, creating calendar invites, adding Notion pages, triggering syncs) to the Chat agent, the CLI, and the MCP server.

We use **Composio** as the core integration library because:
- It handles OAuth, token refresh, and credentials storage natively.
- It exposes 1000+ pre-built tool schemas and action execution endpoints.
- It is already partially integrated into the monorepo backend.

---

## 2. Proposed Connectors Catalog

We will officially support and expose the following catalog on the dashboard:

| Connector | Category | Read Sync (Ingestion) | Write Actions (Agent/MCP) |
|---|---|---|---|
| **Gmail** | Communication | Emails, drafts, and thread context | Send email, create draft, reply to thread |
| **Google Calendar** | Productivity | Meeting titles, descriptions, timelines | Create event, send invites, edit schedule |
| **Notion** | Knowledge & Notes | Pages, databases, and workspace notes | Create database items, append text, list pages |
| **GitHub** | Development | Commits, pull requests, issues | Create issue, review code, comment on PR |
| **Slack** | Communication | Channel context, thread discussions | Post messages, send DMs, list channels |
| **Google Drive** | Knowledge & Notes | PDFs, text documents, presentations | Upload files, create folders, read file text |

---

## 3. Real-time Connection Lifecycle (Popup OAuth)

To bridge Composio's OAuth flow with Debo's database (`connectorAccounts`):
1. **Initiate**: When the user clicks "Connect" on the dashboard, the UI calls `POST /api/connectors/connect` with the provider name.
2. **Link Creation**: The backend calls `composio.toolkits.authorize(userId, toolkitSlug)` to get an OAuth redirect URL and a Connection ID. It saves/updates a `connectorAccounts` row in the database with `status: "disconnected"` and `externalAccountId: connectionId`.
3. **Popup Flow**: The UI opens the OAuth URL in a popup window.
4. **Active Polling**: While the popup is active, the UI polls `GET /api/connectors` every 3 seconds.
5. **Real-time Status Sync**: Inside the GET `/api/connectors` route, if a connector has `status === "disconnected"` but has an `externalAccountId`, the server calls Composio's API:
   ```typescript
   const account = await composio.connectedAccounts.get(row.externalAccountId);
   if (account && account.status === "ACTIVE") {
     await db.update(connectorAccounts).set({ status: "connected" }).where(eq(connectorAccounts.id, row.id));
   }
   ```
   If it is active, the status updates to `"connected"`.
6. **UI Resolution**: The UI detects the status change, closes the popup automatically, and updates the dashboard with a success notification.

---

## 4. Ingestion Sync Engine (Memory Pipeline)

We will implement an on-demand and background sync runner for connected accounts:
- **Sync Trigger**: Create `POST /api/connectors/sync` or update the MCP `debo_trigger_connector_sync` tool.
- **Data Pulling**: Retrieve recent items from the connected services using Composio queries (e.g. `gmail.list_messages`, `notion.search`).
- **Memory Ingestion**: For each retrieved item, we:
  1. Parse the text body, metadata (e.g., date, title, author).
  2. Insert a row in the `sources` database table with the appropriate type (`email`, `notion`, `file`, etc.) and status `"ready"`.
  3. Call `indexSource({ sourceId, userId, workspaceId, plainText })` to chunk the text and upsert vectors to Qdrant.

---

## 5. Exposing Connectors to CLI, MCP, and Chat

### A. LangGraph Chat Integration
- Update [connector-action.node.ts](file:///Users/shaswatraj/Desktop/debo/apps/website/src/server/langgraph/nodes/connector-action.node.ts): When the agent plans an action (e.g., sending an email) and the user clicks "Confirm", the node will execute the action using the Composio SDK and return the result:
  ```typescript
  const composio = getComposio();
  const res = await composio.actions.execute(actionName, {
    connectedAccountId: userConnector.externalAccountId,
    ...actionArguments
  });
  ```

### B. MCP Server & CLI Integration
- Update [route.ts](file:///Users/shaswatraj/Desktop/debo/apps/website/src/app/api/mcp/route.ts): Expose connection listing and execution tools via the HTTP MCP endpoint.
- This allows any command-line tool or external agent connected to Debo's MCP server to check integration statuses and trigger sync jobs.

---

## 6. Implementation Roadmap

1. **Step 1**: Wire up connection popup logic and status polling in the frontend (`ConnectorCard` and `ConnectorsPage`).
2. **Step 2**: Implement real-time status checking from Composio in the backend `GET /api/connectors` route.
3. **Step 3**: Wire up `DELETE /api/connectors/:id` to call Composio's delete endpoint and clean up the database row.
4. **Step 4**: Implement active action execution in the LangGraph `connectorActionNode`.
5. **Step 5**: Run verification checks using `bun run typecheck`.
