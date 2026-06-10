import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { db } from "@debo/db";
import { users, workspaces, sources, memoryChunks, tasks, connectorAccounts, connectorSyncRuns, auditLogs } from "@debo/db/schema";
import { eq, and, desc, ilike, inArray } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Helper to generate IDs matching the codebase pattern
function newId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 20; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${suffix}`;
}

// Chunker configuration
const TARGET_CHUNK_CHARS = 1100;
const MIN_CHUNK_CHARS = 200;

function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if (buf.length === 0) {
      buf = p;
      continue;
    }
    if ((buf.length + p.length + 2) <= TARGET_CHUNK_CHARS) {
      buf = `${buf}\n\n${p}`;
    } else {
      chunks.push(buf);
      buf = p;
    }
  }
  if (buf) chunks.push(buf);

  const final: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= TARGET_CHUNK_CHARS) {
      final.push(chunk);
      continue;
    }
    for (let i = 0; i < chunk.length; i += TARGET_CHUNK_CHARS) {
      final.push(chunk.slice(i, i + TARGET_CHUNK_CHARS));
    }
  }

  return final.filter((c) => c.length >= MIN_CHUNK_CHARS || final.length === 1);
}

// Resolve user and workspace session from environment variables or database fallback
async function getSession() {
  const envUserId = process.env.DEBO_USER_ID;
  const envWorkspaceId = process.env.DEBO_WORKSPACE_ID;

  let userId = envUserId;
  let workspaceId = envWorkspaceId;

  if (!userId) {
    const [firstUser] = await db.select().from(users).limit(1);
    if (!firstUser) {
      throw new Error("No users found in database. Please log in or register a user first.");
    }
    userId = firstUser.id;
  }

  if (!workspaceId) {
    const [firstWS] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerUserId, userId))
      .limit(1);
    if (firstWS) {
      workspaceId = firstWS.id;
    } else {
      throw new Error(`No workspace found for user: ${userId}`);
    }
  }

  return { userId, workspaceId };
}

// Calculate simple text relevance for CLI match styling
function calculateRelevance(content: string, query: string): number {
  const lower = content.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0.5;

  let matched = 0;
  for (const word of words) {
    if (lower.includes(word)) matched++;
  }

  const wordScore = matched / words.length;
  const phraseBonus = lower.includes(query.toLowerCase()) ? 0.2 : 0;
  return Math.min(1, wordScore * 0.7 + phraseBonus + 0.1);
}

// Initialize the MCP Server
const server = new McpServer({
  name: "Debo Memory OS",
  version: "1.0.0",
});

/* ------------------------------------------------------------------ */
/*  Tools Registration                                                 */
/* ------------------------------------------------------------------ */

// 1. Semantic Memory Search Tool
server.tool(
  "debo_search_memory",
  "Semantic text query to search notes, journals, and files in Debo memory graph",
  {
    query: z.string().describe("Semantic text query to search notes, journals, and files"),
    limit: z.number().optional().default(5).describe("Maximum number of results to return"),
  } as any,
  async ({ query, limit }: any) => {
    try {
      const { userId } = await getSession();
      const normalizedQuery = query.replace(/\s+/g, " ").trim();
      if (!normalizedQuery) {
        return { content: [{ type: "text" as const, text: "Query was empty." }] };
      }

      // Search memory chunks via text matching
      const rows = await db
        .select({
          chunkId: memoryChunks.id,
          sourceId: memoryChunks.sourceId,
          content: memoryChunks.text,
          pageNumber: memoryChunks.pageNumber,
          sourceType: sources.type,
          title: sources.title,
          createdAt: memoryChunks.createdAt,
        })
        .from(memoryChunks)
        .innerJoin(sources, eq(memoryChunks.sourceId, sources.id))
        .where(
          and(
            eq(memoryChunks.userId, userId),
            ilike(memoryChunks.text, `%${normalizedQuery}%`)
          )
        )
        .orderBy(desc(memoryChunks.createdAt))
        .limit(limit);

      if (rows.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No matching memories found for this query." }],
        };
      }

      const formattedResults = rows.map((row) => {
        const score = calculateRelevance(row.content, normalizedQuery);
        const percent = Math.round(score * 100);
        const confidenceLabel = percent >= 85 ? "🟢 Strong Match" : percent >= 55 ? "🟡 Partial Match" : "⚪ Weak Match";
        
        return [
          `### [${row.sourceType.toUpperCase()} | ${row.title || "Untitled"}]`,
          `*   **Confidence**: ${confidenceLabel} (${percent}%)`,
          `*   **Source ID**: \`${row.sourceId}\``,
          `*   **Created**: ${row.createdAt}`,
          `*   **Snippet**:`,
          `    > ${row.content.split("\n").join("\n    > ")}`,
          `---`
        ].join("\n");
      }).join("\n\n");

      return {
        content: [{ type: "text" as const, text: formattedResults }],
      };
    } catch (err: unknown) {
      return {
        content: [{ type: "text" as const, text: `Search Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// 2. Retrieve Citation Document Tool
server.tool(
  "debo_get_citations",
  "Retrieve complete text transcripts or document details for a specific source ID",
  {
    sourceId: z.string().describe("The sourceId to fetch complete text transcripts/contents for"),
  } as any,
  async ({ sourceId }: any) => {
    try {
      const { userId } = await getSession();

      const [source] = await db
        .select()
        .from(sources)
        .where(
          and(
            eq(sources.id, sourceId),
            eq(sources.userId, userId)
          )
        )
        .limit(1);

      if (!source) {
        return {
          content: [{ type: "text" as const, text: `Source not found for ID: ${sourceId}` }],
          isError: true,
        };
      }

      const chunks = await db
        .select({
          text: memoryChunks.text,
        })
        .from(memoryChunks)
        .where(eq(memoryChunks.sourceId, sourceId))
        .orderBy(memoryChunks.chunkIndex);

      const fullText = chunks.map(c => c.text).join("\n\n") || source.plainText || "No content available.";

      const citationDetails = [
        `# ${source.title || "Untitled Source"}`,
        `*   **Type**: ${source.type}`,
        `*   **Created At**: ${source.createdAt}`,
        `*   **Source Date**: ${source.sourceDate || "N/A"}`,
        `*   **Description**: ${source.description || "N/A"}`,
        `\n## Full Document Context`,
        `\`\`\``,
        fullText,
        `\`\`\``
      ].join("\n");

      return {
        content: [{ type: "text" as const, text: citationDetails }],
      };
    } catch (err: unknown) {
      return {
        content: [{ type: "text" as const, text: `Citation Retrieval Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// 3. Thought/Journal Capture Tool
server.tool(
  "debo_capture_thought",
  "Capture a thought, note, or journal entry into the Debo memory graph",
  {
    content: z.string().describe("The thought, note, journal entry, or transcription to capture"),
    title: z.string().optional().describe("Optional short title for this note/journal"),
    type: z.enum(["journal", "manual", "file", "link"]).optional().default("manual").describe("Category of this memory"),
  } as any,
  async ({ content, title, type }: any) => {
    try {
      const { userId, workspaceId } = await getSession();
      const sourceId = newId("src");
      const cleanContent = content.trim();

      const [created] = await db
        .insert(sources)
        .values({
          id: sourceId,
          userId,
          workspaceId,
          type: type as any,
          title: title || `Thought at ${new Date().toLocaleDateString()}`,
          plainText: cleanContent,
          status: "ready",
          origin: "manual",
        })
        .returning();

      if (!created) {
        throw new Error("Failed to insert source memory record.");
      }

      const chunks = chunkText(cleanContent);
      if (chunks.length > 0) {
        const chunkRows = chunks.map((chunk, index) => ({
          id: newId("chk"),
          userId,
          workspaceId,
          sourceId,
          chunkIndex: index,
          text: chunk,
          tokenCount: Math.ceil(chunk.length / 4),
        }));
        await db.insert(memoryChunks).values(chunkRows);
      }

      await db.insert(auditLogs).values({
        id: newId("audit"),
        userId,
        workspaceId,
        action: "source.create",
        targetType: "source",
        targetId: sourceId,
        metadataJson: JSON.stringify({ type: created.type, title: created.title, origin: "mcp" }),
      });

      return {
        content: [{
          type: "text" as const,
          text: `Success! Captured thought and created memory source:\n*   **Title**: ${created.title}\n*   **Source ID**: \`${created.id}\`\n*   **Chunks Indexed**: ${chunks.length}`
        }],
      };
    } catch (err: unknown) {
      return {
        content: [{ type: "text" as const, text: `Capture Thought Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// 4. Task Creation Tool
server.tool(
  "debo_create_task",
  "Create a new task or action item in Debo",
  {
    title: z.string().describe("Brief summary or title of the action item/task"),
    description: z.string().optional().describe("Additional description or details about the task"),
    status: z.enum(["inbox", "todo", "doing", "done"]).optional().default("todo").describe("Initial column/status of the task"),
    dueAt: z.string().optional().describe("ISO timestamp or date string when the task is due"),
  } as any,
  async ({ title, description, status, dueAt }: any) => {
    try {
      const { userId, workspaceId } = await getSession();
      const taskId = newId("tsk");

      const [task] = await db
        .insert(tasks)
        .values({
          id: taskId,
          userId,
          workspaceId,
          title: title.trim(),
          description: description?.trim() || null,
          status: status as any,
          dueAt: dueAt || null,
          extractionStatus: "manual",
        })
        .returning();

      if (!task) {
        throw new Error("Failed to insert task record.");
      }

      await db.insert(auditLogs).values({
        id: newId("audit"),
        userId,
        workspaceId,
        action: "task.create",
        targetType: "task",
        targetId: taskId,
        metadataJson: JSON.stringify({ title: task.title, status: task.status, origin: "mcp" }),
      });

      return {
        content: [{
          type: "text" as const,
          text: `Success! Task created:\n*   **Title**: ${task.title}\n*   **Task ID**: \`${task.id}\`\n*   **Status**: ${task.status}`
        }],
      };
    } catch (err: unknown) {
      return {
        content: [{ type: "text" as const, text: `Create Task Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

/* ========================================================================== */
/*  5. JOURNALS CRUD                                                          */
/* ========================================================================== */

// LIST JOURNALS
server.tool(
  "debo_list_journals",
  "List all journal entries stored in the Debo Memory graph",
  {} as any,
  async () => {
    try {
      const { userId } = await getSession();
      const rows = await db
        .select()
        .from(sources)
        .where(
          and(
            eq(sources.userId, userId),
            eq(sources.type, "journal")
          )
        )
        .orderBy(desc(sources.createdAt));

      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: "No journal entries found." }] };
      }

      const list = rows
        .map((r) => `*   **[${r.id}]**: ${r.title || "Untitled"} (Created: ${r.createdAt})`)
        .join("\n");
      return { content: [{ type: "text" as const, text: `Journal Entries:\n${list}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// GET JOURNAL DETAILS
server.tool(
  "debo_get_journal",
  "Get the full text content of a specific journal entry by ID",
  {
    journalId: z.string().describe("The source ID of the journal entry"),
  } as any,
  async ({ journalId }: any) => {
    try {
      const { userId } = await getSession();
      const [entry] = await db
        .select()
        .from(sources)
        .where(
          and(
            eq(sources.id, journalId),
            eq(sources.userId, userId),
            eq(sources.type, "journal")
          )
        )
        .limit(1);

      if (!entry) {
        return { content: [{ type: "text" as const, text: `Journal not found: ${journalId}` }], isError: true };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `# ${entry.title || "Untitled"}\nCreated: ${entry.createdAt}\n\n${entry.plainText || "No content."}`,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// CREATE JOURNAL
server.tool(
  "debo_create_journal",
  "Write a new journal entry into Debo's memory graph",
  {
    title: z.string().describe("Title of the journal entry"),
    content: z.string().describe("Content of the journal entry"),
  } as any,
  async ({ title, content }: any) => {
    try {
      const { userId, workspaceId } = await getSession();
      const sourceId = newId("src");
      const cleanContent = content.trim();

      const [created] = await db
        .insert(sources)
        .values({
          id: sourceId,
          userId,
          workspaceId,
          type: "journal",
          title: title.trim(),
          plainText: cleanContent,
          status: "ready",
          origin: "manual",
        })
        .returning();

      const chunks = chunkText(cleanContent);
      if (chunks.length > 0) {
        const chunkRows = chunks.map((chunk, index) => ({
          id: newId("chk"),
          userId,
          workspaceId,
          sourceId,
          chunkIndex: index,
          text: chunk,
          tokenCount: Math.ceil(chunk.length / 4),
        }));
        await db.insert(memoryChunks).values(chunkRows);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Journal entry created successfully:\n*   **ID**: \`${created.id}\`\n*   **Title**: ${created.title}\n*   **Chunks Indexed**: ${chunks.length}`,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// UPDATE JOURNAL
server.tool(
  "debo_update_journal",
  "Update the title and content of an existing journal entry",
  {
    journalId: z.string().describe("The source ID of the journal entry"),
    title: z.string().optional().describe("Optional new title"),
    content: z.string().optional().describe("Optional new content"),
  } as any,
  async ({ journalId, title, content }: any) => {
    try {
      const { userId, workspaceId } = await getSession();
      const [entry] = await db
        .select()
        .from(sources)
        .where(
          and(
            eq(sources.id, journalId),
            eq(sources.userId, userId),
            eq(sources.type, "journal")
          )
        )
        .limit(1);

      if (!entry) {
        return { content: [{ type: "text" as const, text: `Journal not found: ${journalId}` }], isError: true };
      }

      const updatedTitle = title?.trim() || entry.title;
      const updatedContent = content?.trim() || entry.plainText;

      await db
        .update(sources)
        .set({
          title: updatedTitle,
          plainText: updatedContent,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(sources.id, journalId));

      if (content) {
        await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
        const chunks = chunkText(updatedContent);
        if (chunks.length > 0) {
          const chunkRows = chunks.map((chunk, index) => ({
            id: newId("chk"),
            userId,
            workspaceId,
            sourceId: journalId,
            chunkIndex: index,
            text: chunk,
            tokenCount: Math.ceil(chunk.length / 4),
          }));
          await db.insert(memoryChunks).values(chunkRows);
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Journal entry [${journalId}] updated successfully.`,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// DELETE JOURNAL
server.tool(
  "debo_delete_journal",
  "Delete a journal entry from Debo's memory graph",
  {
    journalId: z.string().describe("The source ID of the journal entry"),
  } as any,
  async ({ journalId }: any) => {
    try {
      const { userId } = await getSession();
      await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
      await db
        .delete(sources)
        .where(
          and(
            eq(sources.id, journalId),
            eq(sources.userId, userId),
            eq(sources.type, "journal")
          )
        );

      return { content: [{ type: "text" as const, text: `Journal entry [${journalId}] deleted successfully.` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/* ========================================================================== */
/*  6. MEDIA MANAGEMENT                                                       */
/* ========================================================================== */

// LIST MEDIA FILES
server.tool(
  "debo_list_media",
  "List uploaded media items (files, images, audio, video) in Debo",
  {
    limit: z.number().optional().default(10).describe("Maximum items to return"),
  } as any,
  async ({ limit }: any) => {
    try {
      const { userId } = await getSession();
      const mediaTypes = ["file", "image", "audio", "video", "pdf"];
      
      const rows = await db
        .select()
        .from(sources)
        .where(
          and(
            eq(sources.userId, userId),
            inArray(sources.type, mediaTypes as any)
          )
        )
        .orderBy(desc(sources.createdAt))
        .limit(limit);

      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: "No media items found." }] };
      }

      const list = rows
        .map((r) => `*   **[${r.id}]** (${r.type}): ${r.title || "Untitled File"} (Uploaded: ${r.createdAt})`)
        .join("\n");
      return { content: [{ type: "text" as const, text: `Media Items:\n${list}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/* ========================================================================== */
/*  7. CONNECTORS                                                             */
/* ========================================================================== */

// LIST CONNECTORS
server.tool(
  "debo_list_connectors",
  "List status of external accounts and connectors (Slack, Gmail, GitHub, Notion)",
  {} as any,
  async () => {
    try {
      const { userId } = await getSession();
      const rows = await db
        .select()
        .from(connectorAccounts)
        .where(eq(connectorAccounts.userId, userId));

      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: "No connectors configured." }] };
      }

      const list = rows
        .map((r) => `*   **${r.provider.toUpperCase()}**: Status: ${r.status.toUpperCase()} (Last Synced: ${r.lastSyncedAt || "Never"})`)
        .join("\n");
      return { content: [{ type: "text" as const, text: `Configured Connectors:\n${list}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// TRIGGER CONNECTOR SYNC
server.tool(
  "debo_trigger_connector_sync",
  "Queue a synchronization run for a specific connector account ID",
  {
    connectorAccountId: z.string().describe("The ID of the connector account"),
  } as any,
  async ({ connectorAccountId }: any) => {
    try {
      const { userId, workspaceId } = await getSession();
      
      const [connector] = await db
        .select()
        .from(connectorAccounts)
        .where(
          and(
            eq(connectorAccounts.id, connectorAccountId),
            eq(connectorAccounts.userId, userId)
          )
        )
        .limit(1);

      if (!connector) {
        return { content: [{ type: "text" as const, text: `Connector account not found for ID: ${connectorAccountId}` }], isError: true };
      }

      const syncRunId = newId("sync");
      await db
        .insert(connectorSyncRuns)
        .values({
          id: syncRunId,
          userId,
          workspaceId,
          connectorAccountId,
          status: "pending",
        });

      return {
        content: [
          {
            type: "text" as const,
            text: `Success! Sync job queued. Sync Run ID: \`${syncRunId}\`. Status is currently PENDING.`,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// Establish Transport Connection (Stdio for local client integrations)
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Debo MCP Server successfully connected and running on Stdio!");
