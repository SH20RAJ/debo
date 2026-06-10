import { NextResponse } from "next/server";
import { requireSession, apiError } from "@/lib/api-helpers";
import { db } from "@debo/db";
import { sources, memoryChunks, tasks, connectorAccounts, connectorSyncRuns, auditLogs } from "@debo/db/schema";
import { eq, and, desc, ilike, inArray } from "drizzle-orm";

export const runtime = "nodejs";

// ID Generator Helper
function newId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${prefix}_${ts}${rand}`;
}

// Chunker configuration for journal capture
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

// Simple text relevance
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

// List of available MCP tools and JSON schemas
const TOOLS = [
  {
    name: "debo_search_memory",
    description: "Semantic text query to search notes, journals, and files in Debo memory graph",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Semantic search text" },
        limit: { type: "number", description: "Max results, default 5" },
      },
      required: ["query"],
    },
  },
  {
    name: "debo_get_citations",
    description: "Retrieve full text transcripts or document details for a specific source ID",
    inputSchema: {
      type: "object",
      properties: {
        sourceId: { type: "string", description: "The ID of the source document" },
      },
      required: ["sourceId"],
    },
  },
  {
    name: "debo_capture_thought",
    description: "Capture a thought, note, or journal entry into the Debo memory graph",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Note text to capture" },
        title: { type: "string", description: "Optional title" },
        type: { type: "string", enum: ["journal", "manual", "file", "link"], default: "manual" },
      },
      required: ["content"],
    },
  },
  {
    name: "debo_create_task",
    description: "Create a new task or action item in Debo",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task summary" },
        description: { type: "string", description: "Additional details" },
        status: { type: "string", enum: ["inbox", "todo", "doing", "done"], default: "todo" },
        dueAt: { type: "string", description: "ISO timestamp or date string when the task is due" },
      },
      required: ["title"],
    },
  },
  {
    name: "debo_list_journals",
    description: "List all journal entries stored in Debo",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "debo_get_journal",
    description: "Get the full text content of a specific journal entry by ID",
    inputSchema: {
      type: "object",
      properties: {
        journalId: { type: "string", description: "ID of the journal entry" },
      },
      required: ["journalId"],
    },
  },
  {
    name: "debo_create_journal",
    description: "Write a new journal entry into Debo's memory graph",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the journal" },
        content: { type: "string", description: "Body of the journal" },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "debo_update_journal",
    description: "Update the title and content of an existing journal entry",
    inputSchema: {
      type: "object",
      properties: {
        journalId: { type: "string", description: "ID of the journal" },
        title: { type: "string", description: "New title" },
        content: { type: "string", description: "New content text body" },
      },
      required: ["journalId"],
    },
  },
  {
    name: "debo_delete_journal",
    description: "Delete a journal entry from Debo's memory graph",
    inputSchema: {
      type: "object",
      properties: {
        journalId: { type: "string", description: "ID of the journal" },
      },
      required: ["journalId"],
    },
  },
  {
    name: "debo_list_media",
    description: "List uploaded media items (files, images, audio, video) in Debo",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max items, default 10" },
      },
    },
  },
  {
    name: "debo_list_connectors",
    description: "List status of external accounts and connectors (Slack, Gmail, GitHub, Notion)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "debo_trigger_connector_sync",
    description: "Queue a synchronization run for a specific connector account ID",
    inputSchema: {
      type: "object",
      properties: {
        connectorAccountId: { type: "string", description: "The ID of the connector account" },
      },
      required: ["connectorAccountId"],
    },
  },
];

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return apiError("invalid_json", 400);
  }

  const { method, params, id } = body;

  // 1. Resolve tools/list
  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      result: {
        tools: TOOLS,
      },
      id,
    });
  }

  // 2. Resolve tools/call
  if (method === "tools/call") {
    const name = params?.name;
    const args = params?.arguments ?? {};

    try {
      let textOutput = "";
      
      switch (name) {
        case "debo_search_memory": {
          const query = (args.query ?? "").trim();
          const limit = args.limit ?? 5;
          if (!query) {
            textOutput = "Query was empty.";
            break;
          }
          const rows = await db
            .select({
              chunkId: memoryChunks.id,
              sourceId: memoryChunks.sourceId,
              content: memoryChunks.text,
              sourceType: sources.type,
              title: sources.title,
              createdAt: memoryChunks.createdAt,
            })
            .from(memoryChunks)
            .innerJoin(sources, eq(memoryChunks.sourceId, sources.id))
            .where(
              and(
                eq(memoryChunks.userId, user.id),
                ilike(memoryChunks.text, `%${query}%`)
              )
            )
            .orderBy(desc(memoryChunks.createdAt))
            .limit(limit);

          if (rows.length === 0) {
            textOutput = "No matching memories found for this query.";
          } else {
            textOutput = rows.map((row) => {
              const score = calculateRelevance(row.content, query);
              const percent = Math.round(score * 100);
              return [
                `### [${row.sourceType.toUpperCase()} | ${row.title || "Untitled"}]`,
                `*   **Confidence**: ${percent}%`,
                `*   **Source ID**: \`${row.sourceId}\``,
                `*   **Snippet**:`,
                `    > ${row.content.split("\n").join("\n    > ")}`
              ].join("\n");
            }).join("\n\n");
          }
          break;
        }

        case "debo_get_citations": {
          const sourceId = args.sourceId;
          const [source] = await db
            .select()
            .from(sources)
            .where(and(eq(sources.id, sourceId), eq(sources.userId, user.id)))
            .limit(1);

          if (!source) {
            textOutput = `Source not found for ID: ${sourceId}`;
          } else {
            const chunks = await db
              .select({ text: memoryChunks.text })
              .from(memoryChunks)
              .where(eq(memoryChunks.sourceId, sourceId))
              .orderBy(memoryChunks.chunkIndex);

            const fullText = chunks.map(c => c.text).join("\n\n") || source.plainText || "No content.";
            textOutput = `# ${source.title || "Untitled"}\nType: ${source.type}\n\n${fullText}`;
          }
          break;
        }

        case "debo_capture_thought": {
          const content = args.content?.trim();
          const title = args.title?.trim();
          const type = args.type || "manual";
          const sourceId = newId("src");

          const [created] = await db
            .insert(sources)
            .values({
              id: sourceId,
              userId: user.id,
              workspaceId,
              type: type as any,
              title: title || `Thought at ${new Date().toLocaleDateString()}`,
              plainText: content,
              status: "ready",
              origin: "manual",
            })
            .returning();

          const chunks = chunkText(content);
          if (chunks.length > 0) {
            const chunkRows = chunks.map((chunk, index) => ({
              id: newId("chk"),
              userId: user.id,
              workspaceId,
              sourceId,
              chunkIndex: index,
              text: chunk,
              tokenCount: Math.ceil(chunk.length / 4),
            }));
            await db.insert(memoryChunks).values(chunkRows);
          }

          textOutput = `Success! Thought captured under ID: ${created.id}`;
          break;
        }

        case "debo_create_task": {
          const title = args.title?.trim();
          const description = args.description?.trim();
          const status = args.status || "todo";
          const dueAt = args.dueAt || null;
          const taskId = newId("tsk");

          const [task] = await db
            .insert(tasks)
            .values({
              id: taskId,
              userId: user.id,
              workspaceId,
              title,
              description: description || null,
              status: status as any,
              dueAt,
              extractionStatus: "manual",
            })
            .returning();

          textOutput = `Success! Task created under ID: ${task.id}`;
          break;
        }

        case "debo_list_journals": {
          const rows = await db
            .select()
            .from(sources)
            .where(and(eq(sources.userId, user.id), eq(sources.type, "journal")))
            .orderBy(desc(sources.createdAt));

          textOutput = rows.length === 0
            ? "No journal entries found."
            : rows.map((r) => `*   **[${r.id}]**: ${r.title || "Untitled"} (Created: ${r.createdAt})`).join("\n");
          break;
        }

        case "debo_get_journal": {
          const journalId = args.journalId;
          const [entry] = await db
            .select()
            .from(sources)
            .where(and(eq(sources.id, journalId), eq(sources.userId, user.id), eq(sources.type, "journal")))
            .limit(1);

          textOutput = !entry
            ? `Journal not found: ${journalId}`
            : `# ${entry.title || "Untitled"}\nCreated: ${entry.createdAt}\n\n${entry.plainText || ""}`;
          break;
        }

        case "debo_create_journal": {
          const title = args.title?.trim();
          const content = args.content?.trim();
          const sourceId = newId("src");

          const [created] = await db
            .insert(sources)
            .values({
              id: sourceId,
              userId: user.id,
              workspaceId,
              type: "journal",
              title,
              plainText: content,
              status: "ready",
              origin: "manual",
            })
            .returning();

          const chunks = chunkText(content);
          if (chunks.length > 0) {
            const chunkRows = chunks.map((chunk, index) => ({
              id: newId("chk"),
              userId: user.id,
              workspaceId,
              sourceId,
              chunkIndex: index,
              text: chunk,
              tokenCount: Math.ceil(chunk.length / 4),
            }));
            await db.insert(memoryChunks).values(chunkRows);
          }

          textOutput = `Journal created successfully with ID: ${created.id}`;
          break;
        }

        case "debo_update_journal": {
          const journalId = args.journalId;
          const [entry] = await db
            .select()
            .from(sources)
            .where(and(eq(sources.id, journalId), eq(sources.userId, user.id), eq(sources.type, "journal")))
            .limit(1);

          if (!entry) {
            textOutput = `Journal not found: ${journalId}`;
          } else {
            const updatedTitle = args.title?.trim() || entry.title;
            const updatedContent = args.content?.trim() || entry.plainText;

            await db
              .update(sources)
              .set({ title: updatedTitle, plainText: updatedContent, updatedAt: new Date().toISOString() })
              .where(eq(sources.id, journalId));

            if (args.content) {
              await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
              const chunks = chunkText(updatedContent);
              if (chunks.length > 0) {
                const chunkRows = chunks.map((chunk, index) => ({
                  id: newId("chk"),
                  userId: user.id,
                  workspaceId,
                  sourceId: journalId,
                  chunkIndex: index,
                  text: chunk,
                  tokenCount: Math.ceil(chunk.length / 4),
                }));
                await db.insert(memoryChunks).values(chunkRows);
              }
            }
            textOutput = `Journal updated successfully.`;
          }
          break;
        }

        case "debo_delete_journal": {
          const journalId = args.journalId;
          await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
          await db.delete(sources).where(and(eq(sources.id, journalId), eq(sources.userId, user.id), eq(sources.type, "journal")));
          textOutput = `Journal deleted successfully.`;
          break;
        }

        case "debo_list_media": {
          const limit = args.limit ?? 10;
          const mediaTypes = ["file", "image", "audio", "video", "pdf"];
          const rows = await db
            .select()
            .from(sources)
            .where(and(eq(sources.userId, user.id), inArray(sources.type, mediaTypes as any)))
            .orderBy(desc(sources.createdAt))
            .limit(limit);

          textOutput = rows.length === 0
            ? "No media files found."
            : rows.map((r) => `*   **[${r.id}]** (${r.type}): ${r.title || "Untitled File"} (Uploaded: ${r.createdAt})`).join("\n");
          break;
        }

        case "debo_list_connectors": {
          const rows = await db
            .select()
            .from(connectorAccounts)
            .where(eq(connectorAccounts.userId, user.id));

          textOutput = rows.length === 0
            ? "No connectors configured."
            : rows.map((r) => `*   **${r.provider.toUpperCase()}**: Status: ${r.status.toUpperCase()} (Last Synced: ${r.lastSyncedAt || "Never"})`).join("\n");
          break;
        }

        case "debo_trigger_connector_sync": {
          const connectorAccountId = args.connectorAccountId;
          const [connector] = await db
            .select()
            .from(connectorAccounts)
            .where(and(eq(connectorAccounts.id, connectorAccountId), eq(connectorAccounts.userId, user.id)))
            .limit(1);

          if (!connector) {
            textOutput = `Connector account not found for ID: ${connectorAccountId}`;
          } else {
            const syncRunId = newId("sync");
            await db
              .insert(connectorSyncRuns)
              .values({
                id: syncRunId,
                userId: user.id,
                workspaceId,
                connectorAccountId,
                status: "pending",
              });
            textOutput = `Success! Sync job queued. Sync Run ID: ${syncRunId}`;
          }
          break;
        }

        default:
          return NextResponse.json({
            jsonrpc: "2.0",
            error: { code: -32601, message: `Method not found: ${name}` },
            id,
          });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        result: {
          content: [{ type: "text", text: textOutput }],
        },
        id,
      });
    } catch (err: any) {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32603, message: err.message },
        id,
      });
    }
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    error: { code: -32600, message: "Invalid request structure" },
    id,
  });
}
