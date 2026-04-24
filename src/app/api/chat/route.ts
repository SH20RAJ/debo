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
import { userPreferences, aiProviders, journals } from "@/db/schema";
import { eq, and, desc as drizzleDesc } from "drizzle-orm";
import { getCalendarEvents, getRecentEmails } from "@/lib/integrations";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return new Response("Unauthorized", { status: 401 });

        const { messages, chatId } = await req.json() as { messages: any[], chatId?: string };
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

        const ctx = await getCloudflareContext({ async: true }).catch(() => null);
        const env = (ctx?.env || process.env) as any;

        if (lastMessage.trim() && (env.MEM0_API_KEY)) {
            const mem0 = new MemoryClient({ 
                apiKey: env.MEM0_API_KEY, 
                host: "https://api.mem0.ai" 
            });
            if (ctx?.ctx?.waitUntil) {
                ctx.ctx.waitUntil(
                    mem0.add([{ role: "user", content: lastMessage }], { userId })
                    .catch(e => console.error("Mem0 Add error:", e))
                );
            } else {
                // Fallback for non-cloudflare environments
                mem0.add([{ role: "user", content: lastMessage }], { userId })
                    .catch(e => console.error("Mem0 Add error:", e));
            }
        }

        let context = "";
        try {
            const relevantJournals = await searchJournals(lastMessage, 4);
            if (relevantJournals.length > 0) {
                context += "From Past Entries:\n" + relevantJournals.map(j => `- ${j.content}`).join("\n");
            }

            const mem0Key = env.MEM0_API_KEY;
            if (lastMessage.trim() && mem0Key) {
                const mem0 = new MemoryClient({ apiKey: mem0Key, host: "https://api.mem0.ai" });
                const memories = await mem0.search(lastMessage, { filters: { userId: userId } });
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

        // 1. User Provider
        if (prefs?.activeProvider && prefs.activeProvider !== "cloudflare") {
            const providerConfig = await db.query.aiProviders.findFirst({
                where: and(eq(aiProviders.userId, userId), eq(aiProviders.providerId, prefs.activeProvider))
            });

            if (providerConfig?.apiKey) {
                try {
                    const key = await decrypt(providerConfig.apiKey);
                    if (prefs.activeProvider === "anthropic") {
                        model = createAnthropic({ apiKey: key })("claude-3-5-sonnet-20240620");
                    } else {
                        model = createOpenAI({ 
                            apiKey: key, 
                            baseURL: providerConfig.baseUrl || undefined,
                        })(prefs.activeProvider === "openai" ? "gpt-4o" : "gpt-4o"); 
                    }
                } catch (e) {
                    console.error(`Failed to load ${prefs.activeProvider}:`, e);
                }
            }
        }

        // 2. System Default (Cloudflare AI Gateway)
        if (!model) {
            const systemApiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
            if (systemApiKey) {
                // EXTREMELY IMPORTANT: Use a custom fetch to force standard OpenAI format and headers
                // This prevents the SDK from auto-detecting 'cloudflare' and trying to hit /responses
                const systemOpenAI = createOpenAI({
                    apiKey: systemApiKey,
                    baseURL: env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || "https://gateway.ai.cloudflare.com/v1/091539408595ba99a0ef106d42391d5b/default/compat",
                    headers: {
                        'cf-aig-authorization': `Bearer ${systemApiKey}`
                    },
                });
                model = systemOpenAI(env.OPENAI_MODEL || process.env.OPENAI_MODEL || "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast");
            }
        }

        if (!model) {
            if (!env.AI) return new Response("No AI provider available", { status: 500 });
            const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
                messages: [{ role: "system", content: systemPrompt }, ...messages],
                stream: true
            });
            return new Response(aiResponse as any);
        }

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
            tools: {
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
                searchJournalEntries: tool({
                    description: "Search through past journal entries for relevant context.",
                    parameters: z.object({
                        query: z.string().describe("The search query"),
                    }),
                    execute: async ({ query }: { query: string }) => await searchJournals(query, 5),
                } as any),
                getLatestJournals: tool({
                    description: "Get the most recent journal entries.",
                    parameters: z.object({
                        limit: z.number().optional().default(5),
                    }),
                    execute: async ({ limit }: { limit?: number }) => {
                        return await db.query.journals.findMany({
                            where: eq(journals.userId, userId),
                            orderBy: [drizzleDesc(journals.createdAt)],
                            limit: limit || 5,
                        });
                    },
                } as any),
            }
        });

        const response = result.toTextStreamResponse();
        return new Response(response.body, {
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                "x-vercel-ai-data-stream": "v1",
            },
        });

    } catch (error) {
        console.error("Critical Chat Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
