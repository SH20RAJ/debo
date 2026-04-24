import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchJournals } from "../../(dashboard)/dashboard/search-actions";
import { MemoryClient } from "mem0ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ollama-ai-provider";
import { streamText, tool } from "ai";
import { z } from "zod";
import { decrypt } from "@/lib/encryption";
import { db } from "@/db";
import { userPreferences, aiProviders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCalendarEvents, getRecentEmails } from "@/lib/integrations";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return new Response("Unauthorized", { status: 401 });

        const { messages } = await req.json() as { messages: any[] };
        const userId = session.user.id;

        const lastMsgObj = messages?.[messages.length - 1];
        let lastMessage = "";
        if (lastMsgObj) {
            if (typeof lastMsgObj.content === "string") {
                lastMessage = lastMsgObj.content;
            } else if (Array.isArray(lastMsgObj.content)) {
                lastMessage = lastMsgObj.content
                    .filter((c: any) => c.type === "text")
                    .map((c: any) => c.text)
                    .join(" ");
            }
        }

        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as any;

        // Background: Add to Mem0
        if (lastMessage.trim() && (env.MEM0_API_KEY || process.env.MEM0_API_KEY)) {
            const mem0 = new MemoryClient({ 
                apiKey: env.MEM0_API_KEY || process.env.MEM0_API_KEY, 
                host: "https://api.mem0.ai" 
            });
            ctx.ctx.waitUntil(
                mem0.add([{ role: "user", content: lastMessage }], { userId })
                .catch(e => console.error("Mem0 Add error:", e))
            );
        }

        // Context retrieval
        let context = "";
        try {
            const relevantJournals = await searchJournals(lastMessage, 4);
            if (relevantJournals.length > 0) {
                context += "From Past Entries:\n" + relevantJournals.map(j => `- ${j.content}`).join("\n");
            }

            const mem0Key = env.MEM0_API_KEY || process.env.MEM0_API_KEY;
            if (lastMessage.trim() && mem0Key) {
                const mem0 = new MemoryClient({ apiKey: mem0Key, host: "https://api.mem0.ai" });
                const memories = await mem0.search(lastMessage, { filters: { user_id: userId } });
                if (memories && memories.results && memories.results.length > 0) {
                    context += "\n\nFacts about user:\n" + memories.results.map((m: any) => `- ${m.memory}`).join("\n");
                }
            }
        } catch (e) {
            console.error("Context Search failed:", e);
        }

        const systemPrompt = `You are Debo, an intelligent AI life companion. 
User Background Context:
${context || "No relevant past entries found."}

Be concise, empathetic, and refer to past entries if relevant.`;

        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, userId),
        });

        let model: any = null;

        // 1. Check User-Configured Provider
        if (prefs?.activeProvider && prefs.activeProvider !== "cloudflare") {
            const providerConfig = await db.query.aiProviders.findFirst({
                where: and(
                    eq(aiProviders.userId, userId),
                    eq(aiProviders.providerId, prefs.activeProvider)
                )
            });

            if (providerConfig?.apiKey) {
                try {
                    const key = await decrypt(providerConfig.apiKey);
                    if (prefs.activeProvider === "anthropic") {
                        model = createAnthropic({ apiKey: key })("claude-3-5-sonnet-20240620");
                    } else {
                        model = createOpenAI({ 
                            apiKey: key,
                            baseURL: providerConfig.baseUrl || undefined
                        })(prefs.activeProvider === "openai" ? "gpt-4o" : "gpt-4o"); 
                    }
                } catch (e) {
                    console.error(`Failed to load ${prefs.activeProvider}:`, e);
                }
            }
        }

        // 2. Fallback to System OpenAI (NVIDIA)
        if (!model) {
            const systemApiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
            if (systemApiKey) {
                model = createOpenAI({
                    apiKey: systemApiKey,
                    baseURL: env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1"
                })(env.OPENAI_MODEL || process.env.OPENAI_MODEL || "meta/llama-3.1-70b-instruct");
            }
        }

        // 3. Last Resort: Cloudflare Workers AI
        if (!model) {
            if (!env.AI) return new Response("No AI provider available", { status: 500 });
            
            const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
                messages: [{ role: "system", content: systemPrompt }, ...messages],
                stream: true
            });

            const stream = new ReadableStream({
                async start(controller) {
                    const reader = (aiResponse as any).getReader();
                    const decoder = new TextDecoder();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
                        for (const line of lines) {
                            try {
                                const data = JSON.parse(line.replace('data: ', ''));
                                if (data.response) {
                                    controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(data.response)}\n`));
                                }
                            } catch(e) {}
                        }
                    }
                    controller.close();
                }
            });

            return new Response(stream, {
                headers: { 
                    "Content-Type": "text/x-unknown",
                    "x-vercel-ai-data-stream": "v1"
                }
            });
        }

        // Standard Vercel AI SDK streaming for OpenAI/Anthropic/NVIDIA
        const tools: any = {
            getCalendarEvents: tool({
                description: "Get upcoming calendar events.",
                parameters: z.object({}),
                execute: async () => await getCalendarEvents(userId),
            } as any),
            getRecentEmails: tool({
                description: "Get recent emails.",
                parameters: z.object({}),
                execute: async () => await getRecentEmails(userId),
            } as any),
        };

        if (prefs?.mcpUrl) {
            try {
                const transport = new SSEClientTransport(new URL(prefs.mcpUrl));
                const client = new Client({ name: "debo", version: "1.0.0" }, { capabilities: {} });
                await client.connect(transport);
                const mcpTools = await client.listTools();
                for (const mcpTool of mcpTools.tools) {
                    tools[mcpTool.name] = tool({
                        description: mcpTool.description || "",
                        parameters: z.record(z.string(), z.any()),
                        execute: async (args: any) => await (client as any).callTool({ name: mcpTool.name, arguments: args })
                    } as any);
                }
            } catch (e) {
                console.error("MCP connection failed:", e);
            }
        }

        // Normalize messages to prevent schema errors with some providers
        const normalizedMessages = messages.map(m => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : 
                     Array.isArray(m.content) ? m.content.map((c: any) => c.text || '').join('') : 
                     m.text || ''
        }));

        const result = await streamText({
            model,
            system: systemPrompt,
            messages: normalizedMessages,
            tools,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error("Critical Chat Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
