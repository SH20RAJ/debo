import { Command } from "commander";
import pc from "picocolors";
import { resolveSession, saveConfig, loadConfig } from "./utils/config";
import { db } from "@debo/db";
import { users, workspaces, sources, memoryChunks, tasks, connectorAccounts, auditLogs } from "@debo/db/schema";
import { eq, and, desc, ilike } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const program = new Command();

// ID Generator Helper
function newId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 20; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${suffix}`;
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

// CLI General Information
program
  .name("debo")
  .description("Debo Memory OS Command Line Interface")
  .version("1.0.0");

/* ========================================================================== */
/*  1. AUTH COMMANDS                                                          */
/* ========================================================================== */

program
  .command("login")
  .description("Authenticate local CLI profile with Debo User Session ID")
  .argument("<userId>", "Your Stack Auth User ID")
  .option("-w, --workspace <workspaceId>", "Optional specific Debo Workspace ID")
  .action((userId, options) => {
    try {
      saveConfig({
        userId,
        workspaceId: options.workspace,
      });
      console.log(pc.green(`✔ Successfully authenticated CLI for user profile: ${userId}`));
    } catch (err: any) {
      console.error(pc.red(`✖ Login failed: ${err.message}`));
    }
  });

/* ========================================================================== */
/*  2. SEMANTIC SEARCH                                                        */
/* ========================================================================== */

program
  .command("search")
  .description("Semantic vector query search across private memories and files")
  .argument("<query>", "Semantic search text")
  .option("-l, --limit <number>", "Maximum result results to return", "5")
  .action(async (query, options) => {
    try {
      const { userId } = await resolveSession();
      const limit = parseInt(options.limit, 10);
      const normalizedQuery = query.replace(/\s+/g, " ").trim();

      console.log(pc.blue(`ℹ Searching private memory graph for "${normalizedQuery}"...`));

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
            eq(memoryChunks.userId, userId),
            ilike(memoryChunks.text, `%${normalizedQuery}%`)
          )
        )
        .orderBy(desc(memoryChunks.createdAt))
        .limit(limit);

      if (rows.length === 0) {
        console.log(pc.yellow("⚠ No matching memories found in database."));
        return;
      }

      console.log(pc.green(`✔ Found ${rows.length} relevant context matches:\n`));

      rows.forEach((row, i) => {
        console.log(pc.bold(pc.cyan(`${i + 1}. [${row.sourceType.toUpperCase()}] ${row.title || "Untitled"}`)));
        console.log(pc.dim(`   ID: ${row.sourceId} | Date: ${row.createdAt}`));
        console.log(`   > ${row.content.split("\n").join("\n   > ")}`);
        console.log(pc.dim("   ----------------------------------------"));
      });
    } catch (err: any) {
      console.error(pc.red(`✖ Search failed: ${err.message}`));
    }
  });

/* ========================================================================== */
/*  3. JOURNAL CRUD                                                            */
/* ========================================================================== */

const journal = program.command("journal").description("Manage personal journal entries (CRUD)");

// LIST
journal
  .command("list")
  .description("List all journal entries")
  .action(async () => {
    try {
      const { userId } = await resolveSession();
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
        console.log(pc.yellow("ℹ No journal entries found. Use 'debo journal create' to write one."));
        return;
      }

      console.log(pc.bold(pc.green(`\n=== Journal Entries List (${rows.length}) ===`)));
      rows.forEach((row) => {
        console.log(pc.cyan(`• [${row.id}] ${row.title || "Untitled"}`));
        console.log(pc.dim(`  Date: ${row.createdAt} | Status: ${row.status}`));
      });
      console.log();
    } catch (err: any) {
      console.error(pc.red(`✖ List journals failed: ${err.message}`));
    }
  });

// SHOW DETAIL
journal
  .command("show")
  .description("View the full text content of a journal entry")
  .argument("<journalId>", "ID of the journal entry")
  .action(async (journalId) => {
    try {
      const { userId } = await resolveSession();
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
        console.error(pc.red(`✖ Journal entry not found for ID: ${journalId}`));
        return;
      }

      console.log(pc.bold(pc.cyan(`\nTitle: ${entry.title || "Untitled"}`)));
      console.log(pc.dim(`ID: ${entry.id} | Date: ${entry.createdAt}\n`));
      console.log(pc.white(entry.plainText || "No content."));
      console.log();
    } catch (err: any) {
      console.error(pc.red(`✖ Show journal failed: ${err.message}`));
    }
  });

// CREATE
journal
  .command("create")
  .description("Create a new journal entry")
  .requiredOption("-t, --title <title>", "Journal entry title")
  .requiredOption("-c, --content <content>", "Journal entry text body")
  .action(async (options) => {
    try {
      const { userId, workspaceId } = await resolveSession();
      const sourceId = newId("src");
      const cleanContent = options.content.trim();

      // 1. Insert source record
      const [created] = await db
        .insert(sources)
        .values({
          id: sourceId,
          userId,
          workspaceId,
          type: "journal",
          title: options.title.trim(),
          plainText: cleanContent,
          status: "ready",
          origin: "manual",
        })
        .returning();

      // 2. Chunk text and index chunks for semantic vector search
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

      // 3. Log audit activity
      await db.insert(auditLogs).values({
        id: newId("audit"),
        userId,
        workspaceId,
        action: "source.create",
        targetType: "source",
        targetId: sourceId,
        metadataJson: JSON.stringify({ type: "journal", title: created.title, origin: "cli" }),
      });

      console.log(pc.green(`✔ Created journal entry: [${created.id}] "${created.title}"`));
      console.log(pc.dim(`  Indexed ${chunks.length} text chunks successfully.`));
    } catch (err: any) {
      console.error(pc.red(`✖ Create journal failed: ${err.message}`));
    }
  });

// UPDATE
journal
  .command("update")
  .description("Update an existing journal entry")
  .argument("<journalId>", "ID of the journal entry")
  .option("-t, --title <title>", "New title")
  .option("-c, --content <content>", "New content text body")
  .action(async (journalId, options) => {
    try {
      const { userId, workspaceId } = await resolveSession();
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
        console.error(pc.red(`✖ Journal entry not found for ID: ${journalId}`));
        return;
      }

      const updatedTitle = options.title?.trim() || entry.title;
      const updatedContent = options.content?.trim() || entry.plainText;

      // Update source
      await db
        .update(sources)
        .set({
          title: updatedTitle,
          plainText: updatedContent,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(sources.id, journalId));

      // Re-index chunks if content was modified
      if (options.content) {
        // Drop existing chunks
        await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
        // Add new chunks
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
        console.log(pc.green(`✔ Re-indexed ${chunks.length} text chunks.`));
      }

      console.log(pc.green(`✔ Updated journal entry: [${journalId}] "${updatedTitle}"`));
    } catch (err: any) {
      console.error(pc.red(`✖ Update journal failed: ${err.message}`));
    }
  });

// DELETE
journal
  .command("delete")
  .description("Delete a journal entry")
  .argument("<journalId>", "ID of the journal entry")
  .action(async (journalId) => {
    try {
      const { userId } = await resolveSession();
      // Remove chunks first
      await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
      
      const res = await db
        .delete(sources)
        .where(
          and(
            eq(sources.id, journalId),
            eq(sources.userId, userId),
            eq(sources.type, "journal")
          )
        );

      console.log(pc.green(`✔ Successfully deleted journal entry: [${journalId}]`));
    } catch (err: any) {
      console.error(pc.red(`✖ Delete journal failed: ${err.message}`));
    }
  });

/* ========================================================================== */
/*  4. TASK CRUD                                                              */
/* ========================================================================== */

const task = program.command("task").description("Manage tasks & action items");

// LIST
task
  .command("list")
  .description("List all active tasks")
  .action(async () => {
    try {
      const { userId } = await resolveSession();
      const rows = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            ilike(tasks.status, "%") // fetch all statuses
          )
        )
        .orderBy(desc(tasks.createdAt));

      if (rows.length === 0) {
        console.log(pc.yellow("ℹ No tasks found. Use 'debo task create' to add one."));
        return;
      }

      console.log(pc.bold(pc.green(`\n=== Task List (${rows.length}) ===`)));
      rows.forEach((row) => {
        const check = row.status === "done" ? "✔" : "☐";
        const statusColor = row.status === "done" ? pc.green : row.status === "doing" ? pc.blue : pc.white;
        console.log(statusColor(`${check} [${row.id}] ${row.title} (${row.status.toUpperCase()})`));
        if (row.description) console.log(pc.dim(`  Details: ${row.description}`));
      });
      console.log();
    } catch (err: any) {
      console.error(pc.red(`✖ List tasks failed: ${err.message}`));
    }
  });

// CREATE
task
  .command("create")
  .description("Create a new task")
  .argument("<title>", "Task summary")
  .option("-d, --desc <description>", "Detailed description")
  .action(async (title, options) => {
    try {
      const { userId, workspaceId } = await resolveSession();
      const taskId = newId("tsk");

      const [created] = await db
        .insert(tasks)
        .values({
          id: taskId,
          userId,
          workspaceId,
          title: title.trim(),
          description: options.desc || null,
          status: "todo",
          extractionStatus: "manual",
        })
        .returning();

      console.log(pc.green(`✔ Created task: [${created.id}] "${created.title}"`));
    } catch (err: any) {
      console.error(pc.red(`✖ Create task failed: ${err.message}`));
    }
  });

// COMPLETE
task
  .command("complete")
  .description("Mark an active task as complete")
  .argument("<taskId>", "ID of the task")
  .action(async (taskId) => {
    try {
      const { userId } = await resolveSession();
      await db
        .update(tasks)
        .set({
          status: "done",
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(tasks.id, taskId),
            eq(tasks.userId, userId)
          )
        );

      console.log(pc.green(`✔ Marked task [${taskId}] as COMPLETED.`));
    } catch (err: any) {
      console.error(pc.red(`✖ Complete task failed: ${err.message}`));
    }
  });

/* ========================================================================== */
/*  5. CONNECTOR COMMANDS                                                     */
/* ========================================================================== */

program
  .command("connector")
  .description("List status of all connected synchronization integration accounts")
  .action(async () => {
    try {
      const { userId } = await resolveSession();
      const rows = await db
        .select()
        .from(connectorAccounts)
        .where(eq(connectorAccounts.userId, userId));

      if (rows.length === 0) {
        console.log(pc.yellow("ℹ No external connectors configured. Connect apps via the dashboard web UI."));
        return;
      }

      console.log(pc.bold(pc.green(`\n=== External Connectors (${rows.length}) ===`)));
      rows.forEach((row) => {
        const dot = row.status === "connected" ? "🟢" : "🔴";
        console.log(`${dot} ${row.provider.toUpperCase()} (ID: ${row.id})`);
        console.log(pc.dim(`  Status: ${row.status.toUpperCase()} | Last Synced: ${row.lastSyncedAt || "Never"}`));
      });
      console.log();
    } catch (err: any) {
      console.error(pc.red(`✖ List connectors failed: ${err.message}`));
    }
  });

/* ========================================================================== */
/*  6. MCP AUTO-INSTALLATION                                                  */
/* ========================================================================== */

const mcp = program.command("mcp").description("Model Context Protocol server local commands");

mcp
  .command("install")
  .description("Automatically install and register the Debo MCP server in Claude Desktop")
  .action(async () => {
    try {
      const config = loadConfig();
      const userId = process.env.DEBO_USER_ID || config.userId;
      
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        console.warn(pc.yellow("⚠ WARNING: DATABASE_URL is not set in environment. Stdio MCP might fail unless config is set."));
      }

      console.log(pc.blue("ℹ Registering Debo MCP inside Claude Desktop configuration..."));

      const claudeConfigDir = path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Claude"
      );
      const configPath = path.join(claudeConfigDir, "claude_desktop_config.json");

      // Ensure directory exists
      if (!fs.existsSync(claudeConfigDir)) {
        fs.mkdirSync(claudeConfigDir, { recursive: true });
      }

      let jsonConfig: any = { mcpServers: {} };
      if (fs.existsSync(configPath)) {
        try {
          jsonConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        } catch {
          // ignore malformed JSON
        }
      }

      // Add Debo configuration
      jsonConfig.mcpServers = jsonConfig.mcpServers || {};
      jsonConfig.mcpServers.debo = {
        command: "bun",
        args: ["run", "src/index.ts"],
        cwd: path.resolve(__dirname, "../../mcp"),
        env: {
          DATABASE_URL: databaseUrl || "",
          DEBO_USER_ID: userId || "",
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2), "utf-8");
      
      console.log(pc.green(`✔ Successfully installed Claude Desktop configuration at:\n  ${configPath}`));
      console.log(pc.cyan("\nℹ To connect Cursor, register a Stdio command under Settings -> Models -> MCP:"));
      console.log(pc.white(`  Command: bun run ${path.resolve(__dirname, "../../mcp/src/index.ts")}`));
      console.log(pc.white(`  Env variables: DATABASE_URL, DEBO_USER_ID`));
    } catch (err: any) {
      console.error(pc.red(`✖ MCP Installation failed: ${err.message}`));
    }
  });

program.parse(process.argv);
