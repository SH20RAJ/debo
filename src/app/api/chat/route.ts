import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchJournals } from "../../(dashboard)/dashboard/search-actions";
import { MemoryClient } from "mem0ai";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return new Response("Unauthorized", { status: 401 });

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;
        const userId = session.user.id;

        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as any;

        // 1. Asynchronously save interaction to memory to progressively build facts
        if (env.MEM0_API_KEY) {
            const mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY, host: "https://api.mem0.ai" });
            ctx.waitUntil(
                mem0.add([{ role: "user", content: lastMessage }], { user_id: userId })
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
                const memories = await mem0.search(lastMessage, { user_id: userId });
                if (memories && memories.length > 0) {
                    context += "\n\nFacts about user:\n" + memories.map((m: any) => `- ${m.memory}`).join("\n");
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

        // 3. Inference via Cloudflare
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            stream: true
        });

        // 4. Transform Cloudflare text stream into Vercel AI SDK DataStreamResponse
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
                                // Protocol packet `0: "content"`
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

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
