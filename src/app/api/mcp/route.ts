import { NextRequest, NextResponse } from "next/server";
import {
  LATEST_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
} from "@modelcontextprotocol/sdk/types.js";
import { RequestContext } from "@mastra/core/request-context";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
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

async function getTools() {
  const { deboTools } = await import("@/mastra/tools/debo-tools");
  return deboTools;
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

async function listMcpTools() {
  const deboTools = await getTools();

  return Object.entries(deboTools).map(([entryId, tool]) => {
    const typedTool = tool as {
      description?: unknown;
      inputSchema?: unknown;
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
      ...(typedTool.mcp?.annotations ? { annotations: typedTool.mcp.annotations } : {}),
      ...(typedTool.mcp?._meta ? { _meta: typedTool.mcp._meta } : {}),
    };
  });
}

async function findTool(name: string) {
  const deboTools = await getTools();
  return Object.entries(deboTools).find(
    ([entryId, tool]) => entryId === name || getToolId(entryId, tool) === name
  )?.[1] as
    | {
        execute?: (
          input: unknown,
          context: Record<string, unknown>
        ) => Promise<unknown>;
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
  auth: { mcpKey: string; userId: string },
  req: NextRequest
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
        tools: await listMcpTools(),
      });

    case "tools/call": {
      const params = message.params ?? {};
      const name = typeof params.name === "string" ? params.name : "";
      if (!name) {
        return error(id, -32602, "Invalid params: tools/call requires name");
      }

      const tool = await findTool(name);
      if (!tool?.execute) {
        return error(id, -32602, `Tool ${name} not found`);
      }

      try {
        const input = parseToolInput(tool, params.arguments);
        const requestContext = new RequestContext<Record<string, unknown>>();
        requestContext.set("userId", auth.userId);
        requestContext.set("mcp.extra", {
          authInfo: {
            token: auth.mcpKey,
            userId: auth.userId,
          },
        });

        const output = await tool.execute(input, {
          abortSignal: req.signal,
          requestContext,
          mcp: {
            extra: {
              authInfo: {
                token: auth.mcpKey,
                userId: auth.userId,
              },
            },
          },
        });

        return result(id, {
          content: [
            {
              type: "text",
              text: typeof output === "string" ? output : JSON.stringify(output, null, 2),
            },
          ],
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
      return result(id, { resources: [] });

    case "prompts/list":
      return result(id, { prompts: [] });

    default:
      return error(id, -32601, `Method not found: ${message.method}`);
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
      await Promise.all(messages.map((message) => handleRequest(message, auth, req)))
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
      tools: (await listMcpTools()).length,
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
