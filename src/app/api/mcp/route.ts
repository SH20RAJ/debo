import { NextRequest, NextResponse } from "next/server";
import {
  LATEST_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
} from "@modelcontextprotocol/sdk/types.js";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { createDeboRuntimeTools } from "@/lib/chat/debo-tools";
import { eq } from "drizzle-orm";
import { z } from "zod";

type JsonRpcId = string | number | null;
type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

const SERVER_INFO = {
  name: "debo-mcp-server",
  version: "1.0.0",
};

const MCP_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, mcp-session-id, Last-Event-ID, mcp-protocol-version",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
};

function getTools(userId = "tool-list") {
  return createDeboRuntimeTools(userId, { includeMcpTools: true });
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: MCP_HEADERS,
  });
}

function empty(status = 204) {
  return new NextResponse(null, {
    status,
    headers: MCP_HEADERS,
  });
}

function result(id: JsonRpcId | undefined, value: unknown) {
  if (id === undefined) return null;
  return {
    jsonrpc: "2.0",
    id,
    result: value,
  };
}

function error(
  id: JsonRpcId | undefined,
  code: number,
  message: string,
  data?: unknown
) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

function negotiateProtocolVersion(params: Record<string, unknown> | undefined) {
  const requested = typeof params?.protocolVersion === "string"
    ? params.protocolVersion
    : undefined;

  return requested && SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
    ? requested
    : LATEST_PROTOCOL_VERSION;
}

function schemaToJsonSchema(schema: unknown) {
  if (!schema) {
    return { type: "object", properties: {}, additionalProperties: false };
  }

  try {
    return z.toJSONSchema(schema as never);
  } catch {
    return schema;
  }
}

function getToolId(entryId: string, tool: unknown) {
  const maybeTool = tool as { id?: unknown };
  return typeof maybeTool.id === "string" ? maybeTool.id : entryId;
}

function listMcpTools(userId?: string) {
  const deboTools = getTools(userId);

  return Object.entries(deboTools).map(([entryId, tool]) => {
    const typedTool = tool as {
      description?: unknown;
      inputSchema?: unknown;
      outputSchema?: unknown;
      mcp?: {
        annotations?: unknown;
        _meta?: unknown;
      };
    };
    const name = getToolId(entryId, tool);

    return {
      name,
      title: name.replace(/_/g, " "),
      description:
        typeof typedTool.description === "string"
          ? typedTool.description
          : `Debo tool: ${name}`,
      inputSchema: schemaToJsonSchema(typedTool.inputSchema),
      ...(typedTool.outputSchema ? { outputSchema: schemaToJsonSchema(typedTool.outputSchema) } : {}),
      ...(typedTool.mcp?.annotations ? { annotations: typedTool.mcp.annotations } : {}),
      ...(typedTool.mcp?._meta ? { _meta: typedTool.mcp._meta } : {}),
    };
  });
}

function findTool(name: string, userId: string) {
  const deboTools = getTools(userId);
  return Object.entries(deboTools).find(
    ([entryId, tool]) => entryId === name || getToolId(entryId, tool) === name
      )?.[1] as
    | {
        execute?: (input: unknown) => Promise<unknown>;
        inputSchema?: {
          safeParse?: (input: unknown) => {
            success: boolean;
            data?: unknown;
            error?: { issues?: unknown[]; message?: string };
          };
        };
      }
    | undefined;
}

function parseToolInput(tool: Awaited<ReturnType<typeof findTool>>, input: unknown) {
  const args = input && typeof input === "object" ? input : {};
  const parsed = tool?.inputSchema?.safeParse?.(args);

  if (!parsed || parsed.success) {
    return parsed?.data ?? args;
  }

  throw new Error(
    `Invalid tool input: ${parsed.error?.message || JSON.stringify(parsed.error?.issues)}`
  );
}

type McpAuthResult =
  | { ok: true; mcpKey: string; userId: string }
  | { ok: false; error: string };

async function authenticate(req: NextRequest): Promise<McpAuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, error: "Unauthorized: Missing Bearer token" };
  }

  const mcpKey = authHeader.replace("Bearer ", "").trim();
  const pref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.mcpKey, mcpKey),
  });

  if (!pref) {
    return { ok: false, error: "Unauthorized: Invalid MCP key" };
  }

  return {
    ok: true,
    mcpKey,
    userId: pref.userId,
  };
}

async function handleRequest(
  message: JsonRpcRequest,
  auth: { mcpKey: string; userId: string }
) {
  const id = message.id;

  if (message.jsonrpc && message.jsonrpc !== "2.0") {
    return error(id, -32600, "Invalid Request: jsonrpc must be 2.0");
  }

  if (!message.method || typeof message.method !== "string") {
    return error(id, -32600, "Invalid Request: missing method");
  }

  switch (message.method) {
    case "initialize":
      return result(id, {
        protocolVersion: negotiateProtocolVersion(message.params),
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        serverInfo: SERVER_INFO,
        instructions:
          "Use Debo tools to read journals, search memories, save entries, and inspect personal patterns for the authenticated user.",
      });

    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    case "ping":
      return result(id, {});

    case "tools/list":
      return result(id, {
        tools: listMcpTools(auth.userId),
      });

    case "tools/call": {
      const params = message.params ?? {};
      const name = typeof params.name === "string" ? params.name : "";
      if (!name) {
        return error(id, -32602, "Invalid params: tools/call requires name");
      }

      const tool = findTool(name, auth.userId);
      if (!tool?.execute) {
        return error(id, -32602, `Tool ${name} not found`);
      }

      try {
        const input = parseToolInput(tool, params.arguments);
        const output = await tool.execute(input);

        let structuredContent: Record<string, unknown> | undefined;
        if (typeof output === "object" && output !== null && !Array.isArray(output)) {
          structuredContent = output as Record<string, unknown>;
        }

        return result(id, {
          content: [
            {
              type: "text",
              text: typeof output === "string" ? output : JSON.stringify(output, null, 2),
            },
          ],
          ...(structuredContent ? { structuredContent } : {}),
        });
      } catch (callError) {
        return result(id, {
          content: [
            {
              type: "text",
              text: callError instanceof Error ? callError.message : String(callError),
            },
          ],
          isError: true,
        });
      }
    }

    case "resources/list":
      return result(id, { resources: listMcpResources() });

    case "resources/read": {
      const uri = typeof message.params?.uri === "string" ? message.params.uri : "";
      if (!uri) {
        return error(id, -32602, "Invalid params: resources/read requires uri");
      }

      try {
        return result(id, { contents: await readMcpResource(uri, auth.userId) });
      } catch (resourceError) {
        return error(
          id,
          -32602,
          resourceError instanceof Error ? resourceError.message : "Resource not found"
        );
      }
    }

    case "prompts/list":
      return result(id, { prompts: listMcpPrompts() });

    case "prompts/get": {
      const name = typeof message.params?.name === "string" ? message.params.name : "";
      if (!name) {
        return error(id, -32602, "Invalid params: prompts/get requires name");
      }

      const prompt = getMcpPrompt(name, message.params?.arguments);
      if (!prompt) return error(id, -32602, `Prompt ${name} not found`);
      return result(id, prompt);
    }

    default:
      return error(id, -32601, `Method not found: ${message.method}`);
  }
}

function listMcpResources() {
  return [
    {
      uri: "debo://profile",
      name: "Debo profile",
      description: "How external agents should use Debo as the user's personal context layer.",
      mimeType: "text/markdown",
    },
    {
      uri: "debo://chat/threads",
      name: "Debo chat threads",
      description: "Recent Debo /chat threads for the authenticated user.",
      mimeType: "application/json",
    },
    {
      uri: "debo://journals/recent",
      name: "Recent journals",
      description: "Recent journal entries saved in Debo.",
      mimeType: "application/json",
    },
    {
      uri: "debo://memories/recent",
      name: "Recent memories",
      description: "Relevant persistent memories available to Debo.",
      mimeType: "application/json",
    },
  ];
}

async function readMcpResource(uri: string, userId: string) {
  if (uri === "debo://profile") {
    return [
      {
        uri,
        mimeType: "text/markdown",
        text: [
          "# Debo Context Layer",
          "",
          "Use Debo when the user asks about their journals, memories, personal history, commitments, recurring patterns, or life context.",
          "Prefer `ask_debo` for natural chat, `search_journals` for retrieval, `import_ai_context` for exported AI context, and `add_memory` only for durable facts the user wants remembered.",
          "Do not expose tool internals to the user. Speak like a steady personal assistant with evidence-backed context.",
        ].join("\n"),
      },
    ];
  }

  if (uri === "debo://chat/threads") {
    const { listChatThreads } = await import("@/lib/chat/server");
    const threads = await listChatThreads(userId, 25);
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          threads.map((thread) => ({
            id: thread.id,
            title: thread.title || "New Chat",
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
          })),
          null,
          2
        ),
      },
    ];
  }

  if (uri.startsWith("debo://chat/thread/")) {
    const threadId = decodeURIComponent(uri.replace("debo://chat/thread/", ""));
    const { extractMessageText, getChatThread, listChatMessages } = await import("@/lib/chat/server");
    const thread = await getChatThread(userId, threadId);
    if (!thread) throw new Error("Thread not found");
    const rows = await listChatMessages(userId, thread.id);
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            id: thread.id,
            title: thread.title || "New Chat",
            messages: (rows ?? []).map((message) => ({
              id: message.id,
              role: message.role,
              text: extractMessageText(safeJson(message.content, message.content)),
              createdAt: message.createdAt,
            })),
          },
          null,
          2
        ),
      },
    ];
  }

  if (uri === "debo://journals/recent") {
    const { getJournals } = await import("@/actions/journals");
    const journals = await getJournals("desc", 10, 0, userId);
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(journals, null, 2),
      },
    ];
  }

  if (uri === "debo://memories/recent") {
    const { getRelevantMemories } = await import("@/lib/memory/query");
    const memories = await getRelevantMemories(userId, "");
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(memories.items.slice(0, 20), null, 2),
      },
    ];
  }

  throw new Error("Resource not found");
}

function listMcpPrompts() {
  return [
    {
      name: "debo-homie",
      title: "Debo homie mode",
      description: "Make an external agent use Debo as a warm, evidence-backed personal assistant.",
      arguments: [
        {
          name: "task",
          description: "What the agent should help the user accomplish.",
          required: false,
        },
      ],
    },
    {
      name: "debo-context-import",
      title: "Import AI context",
      description: "Guide an external agent to import ChatGPT, Claude, IDE, or Gemini context into Debo.",
      arguments: [
        {
          name: "source",
          description: "Source app name, such as ChatGPT or Claude.",
          required: false,
        },
      ],
    },
  ];
}

function getMcpPrompt(name: string, args: unknown) {
  const input = args && typeof args === "object" ? args as Record<string, unknown> : {};
  const task = typeof input.task === "string" ? input.task : "help the user with life-context-aware work";
  const source = typeof input.source === "string" ? input.source : "the external AI app";

  if (name === "debo-homie") {
    return {
      description: "Use Debo's MCP server as the user's private context layer.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use Debo tools whenever personal context matters. For ${task}, call ask_debo for natural chat, search_journals/get_memories for evidence, and add_memory only when the user explicitly wants a durable fact saved. Keep the final answer warm, concise, and user-facing.`,
          },
        },
      ],
    };
  }

  if (name === "debo-context-import") {
    return {
      description: "Import exported AI context into Debo.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `When the user provides an export from ${source}, pass the raw JSON, markdown, or text into import_ai_context with the best source value. Then call ask_debo to summarize what was imported and suggest the next useful question.`,
          },
        },
      ],
    };
  }

  return null;
}

function safeJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function OPTIONS() {
  return empty();
}

export async function DELETE() {
  return empty();
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth.ok) {
    return json(error(null, -32001, auth.error), 401);
  }

  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = (await req.json()) as JsonRpcRequest | JsonRpcRequest[];
  } catch {
    return json(error(null, -32700, "Parse error"), 400);
  }

  try {
    const messages = Array.isArray(body) ? body : [body];
    const responses = (
      await Promise.all(messages.map((message) => handleRequest(message, auth)))
    ).filter(Boolean);

    if (Array.isArray(body)) {
      return responses.length > 0 ? json(responses) : empty(202);
    }

    return responses[0] ? json(responses[0]) : empty(202);
  } catch (routeError) {
    return json(
      error(
        Array.isArray(body) ? null : body.id,
        -32603,
        routeError instanceof Error ? routeError.message : "Internal error"
      ),
      500
    );
  }
}

export async function GET() {
  try {
    return json({
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      status: "active",
      protocolVersion: LATEST_PROTOCOL_VERSION,
      tools: listMcpTools().length,
    });
  } catch (routeError) {
    return json(
      {
        status: "error",
        message: routeError instanceof Error ? routeError.message : String(routeError),
      },
      500
    );
  }
}
