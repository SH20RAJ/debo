/**
 * POST /api/ask — Ask Debo a question.
 *
 * Pipeline: classify intent → retrieve memory → stream LLM answer → cite sources.
 *
 * Streams Server-Sent Events back to the client:
 *   - retrieval_started
 *   - source_found (one per retrieved source)
 *   - answer_delta (real LLM tokens, not fake word splits)
 *   - done (final payload with citations + confidence + suggestions)
 *
 * Auth + workspace are required. The graph is also still callable as a
 * single invoke from server-side code (see askDebo()) for tests/cron jobs.
 */

import { NextResponse } from "next/server";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { requireSession, apiError } from "@/lib/api-helpers";
import { classifyIntent, classifyRetrievalIntent, classifyOrchestrationIntent } from "@/server/langgraph/nodes/classify-intent.node";
import { getComposioToolsForUser } from "@/server/connectors/composio";
import { getCustomMcpToolsForUser } from "@/server/connectors/custom-mcp";
import { retrieveMemory } from "@/server/langgraph/nodes/retrieve-memory.node";
import {
  buildSystemPrompt,
  buildCitations,
  computeConfidenceLabel,
  createNvidiaLLM,
} from "@/server/langgraph/nodes/generate-answer.node";
import { isLlmConfigured } from "@/server/llm/provider";
import { suggestActionsNode } from "@/server/langgraph/nodes/suggest-actions.node";
import { validateCitationsNode } from "@/server/langgraph/nodes/validate-citations.node";
import { db } from "@debo/db";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  chatThreads,
  chatMessages,
  answerCitations,
  auditLogs,
  tasks,
  sources,
  deboMailMessages,
  connectorAccounts,
} from "@debo/db/schema";
import { eq, and, or, ilike, ne } from "drizzle-orm";
import { newId } from "@/lib/api-helpers";
import {
  getEventsTool,
  getHealthEventsTool,
  getHomeEventsTool,
  getSecurityEventsTool,
  searchTimelineTool,
} from "@/server/langgraph/tools/iot-retrieval";

export const runtime = "nodejs";

const webFetchSchema = z.object({
  url: z.string().url().describe("The absolute HTTP or HTTPS URL of the webpage to fetch."),
});

const webFetchTool = tool(
  async (input: any) => {
    const { url } = input;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return `Failed to fetch webpage. Status code: ${response.status}`;
      }

      const html = await response.text();

      // Basic text extraction: strip scripts, styles, and tags
      let bodyText = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return bodyText.slice(0, 15000); // return first 15k characters
    } catch (err: any) {
      return `Error fetching webpage: ${err.message || err}`;
    }
  },
  {
    name: "web_fetch",
    description: "Fetch the text content of a public URL to answer questions about live web pages, news articles, or documentation.",
    schema: webFetchSchema,
  }
);

// Specialized search tools for Debo apps
const queryTasksTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const conditions = [
        eq(tasks.userId, userId),
        eq(tasks.workspaceId, workspaceId),
        ne(tasks.status, "dismissed")
      ];
      if (input.query) {
        conditions.push(or(ilike(tasks.title, `%${input.query}%`), ilike(tasks.description, `%${input.query}%`)) as any);
      }
      const results = await db.select().from(tasks).where(and(...conditions)).limit(20);
      return JSON.stringify(results);
    } catch (err: any) {
      return `Error querying tasks: ${err.message || err}`;
    }
  },
  {
    name: "query_tasks",
    description: "Search and query tasks assigned to you or in your inbox.",
    schema: z.object({ query: z.string().optional() }),
  }
);

const queryJournalsTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const conditions = [
        eq(sources.userId, userId),
        eq(sources.workspaceId, workspaceId),
        eq(sources.type, "journal"),
        ne(sources.status, "deleted")
      ];
      if (input.query) {
        conditions.push(or(ilike(sources.title, `%${input.query}%`), ilike(sources.plainText, `%${input.query}%`)) as any);
      }
      const results = await db.select().from(sources).where(and(...conditions)).limit(10);
      return JSON.stringify(results);
    } catch (err: any) {
      return `Error querying journals: ${err.message || err}`;
    }
  },
  {
    name: "query_journals",
    description: "Search and query your private and public journal logs.",
    schema: z.object({ query: z.string().optional() }),
  }
);

const queryVoiceNotesTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const conditions = [
        eq(sources.userId, userId),
        eq(sources.workspaceId, workspaceId),
        or(eq(sources.type, "voice"), eq(sources.type, "audio")),
        ne(sources.status, "deleted")
      ];
      if (input.query) {
        conditions.push(or(ilike(sources.title, `%${input.query}%`), ilike(sources.plainText, `%${input.query}%`)) as any);
      }
      const results = await db.select().from(sources).where(and(...conditions)).limit(10);
      return JSON.stringify(results);
    } catch (err: any) {
      return `Error querying voice notes: ${err.message || err}`;
    }
  },
  {
    name: "query_voice_notes",
    description: "Search and retrieve transcribed voice notes or recorded phone conversations with Debo.",
    schema: z.object({ query: z.string().optional() }),
  }
);

const queryMailTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const conditions = [
        or(eq(deboMailMessages.senderUserId, userId), eq(deboMailMessages.recipientUserId, userId)),
        ne(deboMailMessages.status, "deleted")
      ];
      if (input.query) {
        conditions.push(or(ilike(deboMailMessages.subject, `%${input.query}%`), ilike(deboMailMessages.body, `%${input.query}%`)) as any);
      }
      const results = await db.select().from(deboMailMessages).where(and(...conditions)).limit(15);
      return JSON.stringify(results);
    } catch (err: any) {
      return `Error querying mail: ${err.message || err}`;
    }
  },
  {
    name: "query_mail",
    description: "Search and retrieve your transactional emails from Debo Mail.",
    schema: z.object({ query: z.string().optional() }),
  }
);

const queryConnectorsTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const results = await db
        .select()
        .from(connectorAccounts)
        .where(and(eq(connectorAccounts.userId, userId), eq(connectorAccounts.workspaceId, workspaceId)));
      return JSON.stringify(results);
    } catch (err: any) {
      return `Error querying connectors: ${err.message || err}`;
    }
  },
  {
    name: "query_connectors",
    description: "List currently connected third-party integrations (e.g. Google, GitHub, Notion).",
    schema: z.object({}),
  }
);

const getIotDeviceStatesTool = (userId: string, workspaceId: string) => tool(
  async () => {
    try {
      const [account] = await db
        .select()
        .from(connectorAccounts)
        .where(
          and(
            eq(connectorAccounts.userId, userId),
            eq(connectorAccounts.workspaceId, workspaceId),
            eq(connectorAccounts.provider, "homeassistant"),
            eq(connectorAccounts.status, "connected")
          )
        )
        .limit(1);

      if (!account) {
        return "The Home Assistant / IoT connector is not connected yet. Please instruct the user to go to Settings > Connectors to connect it (either in real or simulated mode).";
      }

      const metadata = JSON.parse(account.metadataJson || "{}");
      return JSON.stringify(metadata.devices || {});
    } catch (err: any) {
      return `Error retrieving IoT device states: ${err.message || err}`;
    }
  },
  {
    name: "get_iot_device_states",
    description: "Get the current states of all connected smart home devices (lights, switches, climate, locks, etc.).",
    schema: z.object({}),
  }
);

const controlIotDeviceTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const { entityId, state, brightness, temperature } = input;

      const [account] = await db
        .select()
        .from(connectorAccounts)
        .where(
          and(
            eq(connectorAccounts.userId, userId),
            eq(connectorAccounts.workspaceId, workspaceId),
            eq(connectorAccounts.provider, "homeassistant"),
            eq(connectorAccounts.status, "connected")
          )
        )
        .limit(1);

      if (!account) {
        return "The Home Assistant / IoT connector is not connected yet. Please ask the user to connect it.";
      }

      const metadata = JSON.parse(account.metadataJson || "{}");
      const { url, token, simulated, devices = {} } = metadata;

      const device = devices[entityId];
      if (!device) {
        return `Device with entity ID "${entityId}" was not found. Available devices: ${Object.keys(devices).join(", ")}`;
      }

      const updatedDevice = { ...device };
      if (entityId.startsWith("lock.")) {
        updatedDevice.state = state === "lock" || state === "locked" ? "locked" : "unlocked";
      } else {
        updatedDevice.state = state;
      }
      if (brightness !== undefined) updatedDevice.brightness = brightness;
      if (temperature !== undefined) updatedDevice.temperature = temperature;

      if (!simulated) {
        const [domain] = entityId.split(".");
        let service = "";
        let body: Record<string, any> = { entity_id: entityId };

        if (domain === "light" || domain === "switch") {
          service = state === "on" ? "turn_on" : "turn_off";
          if (domain === "light" && brightness !== undefined) {
            body.brightness = brightness;
          }
        } else if (domain === "lock") {
          service = state === "lock" || state === "locked" ? "lock" : "unlock";
        } else if (domain === "climate") {
          service = "set_temperature";
          if (temperature !== undefined) {
            body.temperature = temperature;
          }
        }

        try {
          const haRes = await fetch(`${url}/api/services/${domain}/${service}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!haRes.ok) {
            return `Failed to execute control service on Home Assistant. Status: ${haRes.status}`;
          }
        } catch (err: any) {
          return `Error contacting Home Assistant API: ${err.message || err}`;
        }
      }

      // Persist the updated state back to the database
      metadata.devices = {
        ...devices,
        [entityId]: updatedDevice,
      };

      await db
        .update(connectorAccounts)
        .set({
          metadataJson: JSON.stringify(metadata),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(connectorAccounts.id, account.id));

      return `Successfully set ${entityId} to state: "${state}"${brightness !== undefined ? ` with brightness ${brightness}` : ""}${temperature !== undefined ? ` at temperature ${temperature}°C` : ""}.`;
    } catch (err: any) {
      return `Error controlling IoT device: ${err.message || err}`;
    }
  },
  {
    name: "control_iot_device",
    description: "Control a connected smart home device by changing its state (e.g. turn on a light, lock a door, set thermostat temperature).",
    schema: z.object({
      entityId: z.string().describe("The entity ID of the device (e.g., 'light.living_room', 'switch.kitchen_fan', 'lock.front_door', 'climate.thermostat')"),
      state: z.string().describe("The target state for the device (e.g., 'on', 'off', 'lock', 'unlock', 'heat')"),
      brightness: z.number().min(0).max(255).optional().describe("Optional brightness level (0-255) for lights only"),
      temperature: z.number().optional().describe("Optional target temperature value for climate/thermostat devices only"),
    }),
  }
);

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: { question?: string; mode?: string; threadId?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("invalid_json", 400);
  }

  const question = (body.question ?? "").trim();
  if (!question) return apiError("question_required", 400);

  const mode = body.mode ?? "recall";
  const llmReady = isLlmConfigured();
  
  // Use the optimized intent classifier
  const intentCategory = await classifyOrchestrationIntent(question);
  const shouldSearchMemory = intentCategory === "recall";
  const chitchat = intentCategory === "chitchat";

  let threadId = body.threadId;
  if (!threadId) {
    threadId = newId("thr");
    await db.insert(chatThreads).values({
      id: threadId,
      userId: user.id,
      workspaceId,
      mode: ["recall", "summarize", "plan", "draft", "task", "project"].includes(mode)
        ? (mode as "recall" | "summarize" | "plan" | "draft" | "task" | "project")
        : "recall",
      title: question.slice(0, 80),
    });
  } else {
    const [existing] = await db
      .select({ id: chatThreads.id })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, user.id),
        ),
      )
      .limit(1);
    if (!existing) {
      threadId = newId("thr");
      await db.insert(chatThreads).values({
        id: threadId,
        userId: user.id,
        workspaceId,
        mode: "recall",
        title: question.slice(0, 80),
      });
    }
  }

  const userMessageId = newId("msg");
  await db.insert(chatMessages).values({
    id: userMessageId,
    userId: user.id,
    workspaceId,
    threadId,
    role: "user",
    content: question,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const intent = shouldSearchMemory ? classifyIntent(question) : "chitchat";

        let sourcesFound: Awaited<ReturnType<typeof retrieveMemory>>["sourcesFound"] = [];
        let contextText = "";
        if (shouldSearchMemory) {
          send({ type: "retrieval_started" });
          const retrieved = await retrieveMemory(user.id, question, 8);
          sourcesFound = retrieved.sourcesFound;
          contextText = retrieved.contextText;

          for (const src of sourcesFound) {
            send({
              type: "source_found",
              id: src.id,
              sourceType: src.type,
              title: src.title,
              snippet: src.snippet,
              confidence: "partial",
            });
          }
        }

        let finalAnswer = "";

        if (!llmReady) {
          finalAnswer = chitchat
            ? "Hey! I'm Debo, your private memory companion. I can capture notes, voice, and answer questions about your past — though my AI brain needs an API key (NVIDIA_API_KEY or OPENAI_API_KEY) configured to chat fully."
            : sourcesFound.length > 0
              ? `I found ${sourcesFound.length} relevant ${sourcesFound.length === 1 ? "memory" : "memories"}: ${sourcesFound
                  .map((s) => `"${s.title}"`)
                  .join(", ")}. Configure NVIDIA_API_KEY or OPENAI_API_KEY to get full AI answers.`
              : "I don't have any stored memories about that yet. Capture journals, voice notes, or connect apps to start. (Configure NVIDIA_API_KEY or OPENAI_API_KEY for AI answers.)";
          send({ type: "answer_delta", token: finalAnswer });
        } else {
          const llm = createNvidiaLLM(true);
          if (!llm) throw new Error("llm_unavailable");
          
          const systemPrompt = buildSystemPrompt(contextText, mode, intent);
          
          const initialMessages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(question),
          ];

          // Load dynamic Composio tools for user's connected accounts
          let composioTools: any[] = [];
          if (intentCategory === "connector" || intentCategory === "recall") {
            composioTools = await getComposioToolsForUser(user.id, workspaceId);
          }

          // Load dynamic custom MCP tools
          let customMcpTools: any[] = [];
          try {
            customMcpTools = await getCustomMcpToolsForUser(user.id, workspaceId);
          } catch (err) {
            console.warn("[ask] failed to load custom MCP tools:", err);
          }

          // Define all available tools - skip if intent is chitchat
          const allTools = intentCategory === "chitchat" ? [] : [
            webFetchTool,
            queryTasksTool(user.id, workspaceId),
            queryJournalsTool(user.id, workspaceId),
            queryVoiceNotesTool(user.id, workspaceId),
            queryMailTool(user.id, workspaceId),
            queryConnectorsTool(user.id, workspaceId),
            getIotDeviceStatesTool(user.id, workspaceId),
            controlIotDeviceTool(user.id, workspaceId),
            getEventsTool(user.id, workspaceId),
            getHealthEventsTool(user.id, workspaceId),
            getHomeEventsTool(user.id, workspaceId),
            getSecurityEventsTool(user.id, workspaceId),
            searchTimelineTool(user.id, workspaceId),
            ...composioTools,
            ...customMcpTools,
          ];

          const llmWithTools = allTools.length > 0 ? llm.bindTools(allTools) : llm;
          
          // Invoke once to check if model wants to call any tool
          const firstResponse = await llmWithTools.invoke(initialMessages);
          let messagesForFinalStream = initialMessages;
          let executedTool = false;

          if (firstResponse.tool_calls && firstResponse.tool_calls.length > 0) {
            const toolCalls = firstResponse.tool_calls;
            const toolMessages: ToolMessage[] = [];

            for (const toolCall of toolCalls) {
              const toolToRun = allTools.find((t) => t.name === toolCall.name);
              if (toolToRun) {
                send({ 
                  type: "retrieval_started",
                  detail: `Executing tool ${toolCall.name}...`
                });

                const toolResult = await (toolToRun as any).invoke(toolCall.args);

                 const readableTitle = toolCall.name
                   .toLowerCase()
                   .replace(/_/g, " ")
                   .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

                 send({
                   type: "source_found",
                   id: `${toolCall.name}_${Date.now()}`,
                   sourceType: toolCall.name === "web_fetch"
                     ? "link"
                     : toolCall.name.startsWith("GMAIL_")
                     ? "gmail"
                     : toolCall.name.startsWith("SLACK_")
                     ? "slack"
                     : toolCall.name.startsWith("NOTION_")
                     ? "notion"
                     : toolCall.name.startsWith("GITHUB_")
                     ? "github"
                     : ["get_events", "get_health_events", "get_home_events", "get_security_events", "search_timeline"].includes(toolCall.name)
                     ? "timeline"
                     : "task",
                   title: readableTitle,
                   snippet: typeof toolResult === "string" ? toolResult.slice(0, 300) : JSON.stringify(toolResult).slice(0, 300),
                   confidence: "strong"
                 });

                toolMessages.push(new ToolMessage({
                  content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
                  tool_call_id: toolCall.id || "",
                  name: toolCall.name
                }));
              }
            }

            messagesForFinalStream = [
              new SystemMessage(systemPrompt),
              new HumanMessage(question),
              firstResponse,
              ...toolMessages
            ];
            executedTool = true;
          }

          if (executedTool) {
            // Stream based on tool output
            const tokenStream = await llm.stream(messagesForFinalStream);
            for await (const chunk of tokenStream) {
              const token = typeof chunk.content === "string" ? chunk.content : "";
              if (token) {
                finalAnswer += token;
                send({ type: "answer_delta", token });
              }
            }
          } else {
            // No tool was executed, return firstResponse content instantly
            const content = typeof firstResponse.content === "string" ? firstResponse.content : "";
            finalAnswer = content;
            send({ type: "answer_delta", token: content });
          }
        }

        const citations = buildCitations(sourcesFound);
        const confidence = computeConfidenceLabel(sourcesFound, finalAnswer);

        const validation = validateCitationsNode({
          citations,
          sourcesFound,
        });
        const filteredCitations = validation.citations;
        const { actionSuggestions, followUps } = suggestActionsNode({
          intent,
          answer: finalAnswer,
          sourcesFound,
        });

        const assistantMessageId = newId("msg");
        await db.insert(chatMessages).values({
          id: assistantMessageId,
          userId: user.id,
          workspaceId,
          threadId,
          role: "assistant",
          content: finalAnswer,
          metadataJson: JSON.stringify({ intent, mode, confidence }),
        });

        // Persist citations
        if (filteredCitations.length > 0) {
          await db.insert(answerCitations).values(
            filteredCitations.map((c) => ({
              id: newId("cit"),
              userId: user.id,
              workspaceId,
              messageId: assistantMessageId,
              sourceId: c.sourceId,
              quoteText: c.snippet ?? null,
              confidence: typeof c.relevanceScore === "number" ? c.relevanceScore : null,
            })),
          );
        }

        await db.insert(auditLogs).values({
          id: newId("audit"),
          userId: user.id,
          workspaceId,
          action: "ask.answer",
          targetType: "chat_message",
          targetId: assistantMessageId,
          ipAddress: req.headers.get("x-forwarded-for"),
          userAgent: req.headers.get("user-agent"),
          metadataJson: JSON.stringify({
            intent,
            mode,
            sourceCount: sourcesFound.length,
            confidence,
          }),
        });

        send({
          type: "done",
          threadId,
          messageId: assistantMessageId,
          answer: finalAnswer,
          sources: sourcesFound,
          citations: filteredCitations,
          confidence,
          intent,
          followUps,
          actionSuggestions,
          citationValidation: validation.citationValidation,
        });
      } catch (err) {
        console.error("[ask] pipeline error:", err);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "internal_error",
        });
        send({ type: "done", answer: "", confidence: "no_source_found" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
