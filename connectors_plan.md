# Debo Connectors Integration & Sync Strategy

This document details the deep research, recommendations, and execution plan to extend Debo's connectors and wire them end-to-end to Chat, central CLI/MCP, and background memory sync pipelines.

---

## 1. Directory of Recommended Connectors

To build the ultimate Private AI Memory OS, we categorize target connectors into three tiers of relevance:

### Tier 1: Communication & Messaging (High Retrieval Context)
- **Gmail / Outlook Mail**: Sync email threads, calendar invites, receipts, and professional conversations.
- **Slack / MS Teams**: Capture team discussion threads, links shared, and decisions.
- **Telegram / WhatsApp**: Log personal chat updates, media references, and voice memos.

### Tier 2: Knowledge, Notes, & Files (High Extraction Context)
- **Notion**: Ingest structured wikis, document folders, and personal logs.
- **Google Drive / OneDrive**: Scan and extract text/embeddings from PDFs, spreadsheets, slides, and docx.
- **Evernote / Obsidian**: Sync raw personal markdown journals, checklists, and local vaults.

### Tier 3: Developer & Collaboration Tools (Specialized Task Execution)
- **GitHub / GitLab**: Track pull requests, issues, codebase updates, and comments.
- **Jira / Linear**: Sync task states, epic logs, and sprint context.

---

## 2. Integration Strategy: Composio vs. Nango vs. Custom

We compare three integration paths for Debo:

| Strategy | Speed of Integration | Auth Management (OAuth2) | Sync & Ingestion Support | Execution / Tool Calling | Maintenance Overhead |
|:---|:---|:---|:---|:---|:---|
| **Composio** (Recommended) | **Extremely High** (1 day) | Built-in (entity-based) | High | **Natively Optimized for Agents** | **Very Low** |
| **Nango** | High (3 days) | Built-in | **Excellent (focused on syncing)** | Moderate (requires custom actions) | Low |
| **Custom APIs** | Low (Weeks) | Manual OAuth routes | Manual cron jobs | Manual prompt mappings | High |

### Why Composio is the Best Fit for Debo
1. **Zero-Code Integration Catalog**: Composio maps directly to 1000+ popular developer and communication apps. Adding a new connector is as simple as adding a string value to our `SUPPORTED_PROVIDERS` enum.
2. **Entity-Based Multi-Tenancy**: Composio manages user sessions natively using `entityId` mapping to our internal `userId`. We do not need to store, refresh, or manage access tokens in our database.
3. **Agent Action Executing**: Composio exports standard LangChain `Tools` format. The LangGraph LLM can immediately run actions (e.g. `slack_post_message`) with zero wrapper code.

---

## 3. End-to-End Connector Architecture

```mermaid
graph TD
    User([User]) -->|OAuth Connect| Dashboard[Next.js Dashboard]
    Dashboard -->|POST /api/connectors/connect| API[Next.js API Routes]
    API -->|Authorize Entity| ComposioAPI[Composio Cloud Service]
    ComposioAPI -->|OAuth Portal Redirect| Provider[Gmail/Slack/Notion]
    
    subgraph Ingestion Pipeline (Memory Inflow)
        SyncCron[Sync Cron Task] -->|Fetch delta since lastSync| ComposioAPI
        ComposioAPI -->|Get data stream| Provider
        SyncCron -->|Chunk & Embed| Ingestion[Ingestion Engine]
        Ingestion -->|Vector Store| Qdrant[(Qdrant / Memory Graph)]
        Ingestion -->|Plaintext Metadata| DB[(@debo/db - sources)]
    end

    subgraph Intelligence (Memory Outflow)
        Chat[LangGraph Chat Node] -->|Query| Qdrant
        Chat -->|Run Actions| ComposioAPI
        CLI[Debo CLI / MCP] -->|Execute Actions| ComposioAPI
    end
```

---

## 4. Ingestion Sync Pipeline

To sync memory passively, we will build a sync route `/api/connectors/sync` triggered by a Cron schedule (e.g. hourly):

```typescript
// Background worker loops over active connections and pulls new documents
export async function POST() {
  const activeConnections = await db
    .select()
    .from(connectorAccounts)
    .where(eq(connectorAccounts.status, "connected"));

  for (const conn of activeConnections) {
    const lastSync = conn.lastSyncedAt;
    
    // 1. Fetch items from Composio/Provider API since lastSync
    const newItems = await fetchProviderDelta(conn.provider, conn.externalAccountId, lastSync);
    
    for (const item of newItems) {
      // 2. Add to sources table
      const source = await db.insert(sources).values({
        id: newId("src"),
        userId: conn.userId,
        workspaceId: conn.workspaceId,
        type: mapProviderToSourceType(conn.provider),
        title: item.title,
        plainText: item.bodyText,
        originalUrl: item.url,
        connectorAccountId: conn.id,
      }).returning();
      
      // 3. Index to Vector DB for immediate retrieval
      await indexSource({
        sourceId: source.id,
        userId: conn.userId,
        workspaceId: conn.workspaceId,
        plainText: source.plainText,
      });
    }

    // 4. Update sync timestamp
    await db
      .update(connectorAccounts)
      .set({ lastSyncedAt: new Date().toISOString() })
      .where(eq(connectorAccounts.id, conn.id));
  }
}
```

---

## 5. Integrating Connectors with LangGraph Chat & MCP

### LangGraph Agent Orchestration
We inject Composio tools directly into our LangGraph execution environment:
```typescript
import { ComposioToolSet } from "@composio/core";

// Create toolset scoped to current user
const toolset = new ComposioToolSet({
  apiKey: process.env.COMPOSIO_API_KEY,
  entityId: userId,
});

// Load tools for the user's active providers
const tools = await toolset.getTools({
  actions: [
    "GMAIL_SEND_EMAIL", 
    "SLACK_POST_MESSAGE", 
    "NOTION_CREATE_PAGE"
  ]
});

// Pass tools directly to ChatOpenAI/Nemotron model
const modelWithTools = model.bindTools(tools);
```

### Central Debo CLI / MCP
- The MCP server reads active `connector_accounts` for the authenticated CLI user.
- It exposes these actions as MCP tools.
- When an MCP tool is invoked from cursor/cli, the MCP server forwards the action execution payload to Composio using the user's connected account credentials.
