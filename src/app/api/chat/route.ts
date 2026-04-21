import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchJournals } from "../../(dashboard)/dashboard/search-actions";
import { MemoryClient } from "mem0ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { decrypt } from "@/lib/encryption";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return new Response("Unauthorized", { status: 401 });

        const { messages } = await req.json() as { messages: any[] };
        const lastMsgObj = messages?.[messages.length - 1];
        
        let lastMessage = "";
        if (lastMsgObj) {
            if (typeof lastMsgObj.content === "string") {
                lastMessage = lastMsgObj.content;
            } else if (Array.isArray(lastMsgObj.content)) {
                // Handle multi-modal content types properly
                lastMessage = lastMsgObj.content
                    .filter((c: any) => c.type === "text")
                    .map((c: any) => c.text)
                    .join(" ");
            }
        }
        const userId = session.user.id;

        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as any;

        // 1. Asynchronously save interaction to memory to progressively build facts
        if (env.MEM0_API_KEY) {
            const mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY, host: "https://api.mem0.ai" });
            ctx.ctx.waitUntil(
                mem0.add([{ role: "user", content: lastMessage }], { userId })
                .catch(e => console.error("Mem0 Add error:", e))
            );
        }

        // 2. Build Intelligent Context
        let context = "";
        try {
            // A. Fetch Semantic Vectorize Journals
            const relevantJournals = await searchJournals(lastMessage, 4);
            if (relevantJournals.length > 0) {
                context += "From Past Entries:\n" + relevantJournals.map(j => `- ${j.content}`).join("\n");
            }

            // B. Fetch Distilled Mem0 Facts
            if (env.MEM0_API_KEY) {
                const mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY, host: "https://api.mem0.ai" });
                const memories = await mem0.search(lastMessage, { filters: { user_id: userId } });
                if (memories && memories.results && memories.results.length > 0) {
                    context += "\n\nFacts about user:\n" + memories.results.map((m: any) => `- ${m.memory}`).join("\n");
                }
            }
        } catch (e) {
            console.error("Context Search via Mem0/Vectorize failed:", e);
        }

        const systemPrompt = `You are Debo, an intelligent AI life companion. 
Debo is empathetic, curious, and helpful. You transform simple text entries into deep understanding.

User Background Context:
${context || "No relevant past entries or facts found."}

Guidelines:
- Reference past facts and entries naturally if they relate to the user's message.
- Be concise.
- You are their partner in growth.`;

        if (!env.AI) return new Response("Cloudflare AI binding missing", { status: 500 });

        // 3. Dynamic Model Selection
        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, userId),
        });

        let provider = "cloudflare";
        let model: any = null;

        if (prefs?.activeProvider === "openai" && prefs.openaiKey) {
            try {
                const key = decrypt(prefs.openaiKey);
                const openaiProvider = createOpenAI({ apiKey: key });
                model = openaiProvider("gpt-4o");
                provider = "openai";
            } catch (e) {
                console.error("Failed to initialize OpenAI, falling back to Cloudflare:", e);
            }
        } else if (prefs?.activeProvider === "anthropic" && prefs.anthropicKey) {
            try {
                const key = decrypt(prefs.anthropicKey);
                const anthropicProvider = createAnthropic({ apiKey: key });
                model = anthropicProvider("claude-3-5-sonnet-20240620");
                provider = "anthropic";
            } catch (e) {
                console.error("Failed to initialize Anthropic, falling back to Cloudflare:", e);
            }
        }

        // 4. Inference
        if (provider === "cloudflare") {
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
        } else {
            // Use Vercel AI SDK for BYOK providers
            const result = await streamText({
                model,
                system: systemPrompt,
                messages,
            });

            return result.toTextStreamResponse();
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
