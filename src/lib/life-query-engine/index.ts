import { searchJournals } from "@/actions/search";
import { getMemories } from "@/actions/memories";
import { generateText } from "ai";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/db";
import { userPreferences, aiProviders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { decrypt } from "@/lib/encryption";

export async function askLife(question: string, userId: string) {
    try {
        // 1. Parallel Context Gathering
        const [journalResults, memoryResults] = await Promise.all([
            searchJournals(question, 5),
            getMemories(question)
        ]);

        const journals = Array.isArray(journalResults) ? journalResults : [];
        const memories = (memoryResults as any).success ? (memoryResults as any).data : [];

        // 2. Format Context
        const journalContext = journals.map(j => `Entry (${j.createdAt}): ${j.content}`).join("\n\n");
        const memoryContext = memories.map((m: any) => `- ${m.content}`).join("\n");

        const fullContext = `
RELEVANT JOURNAL ENTRIES:
${journalContext || "No relevant entries found."}

RELEVANT PERSONAL FACTS (MEMORIES):
${memoryContext || "No relevant facts found."}
        `.trim();

        // 3. Get User's Preferred Model
        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, userId)
        });

        const activeProviderId = prefs?.activeProvider || "cloudflare";
        
        let model: any;
        
        if (activeProviderId === "cloudflare") {
            const ctx = await getCloudflareContext({ async: true });
            const env = ctx.env as CloudflareEnv;
            
            if (env.AI) {
                // Cloudflare Workers AI - simplified for now
                // We'll use a standard helper or just raw env.AI.run
                const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
                    messages: [
                        { role: "system", content: "You are Debo, a personal AI that understands the user's life deeply. Answer based ONLY on the provided context." },
                        { role: "user", content: `Context:\n${fullContext}\n\nQuestion: ${question}` }
                    ]
                });
                return {
                    success: true,
                    data: {
                        answer: (response as any).response || "I couldn't process that.",
                        sources: { journals, memories }
                    }
                };
            }
        }

        // Fallback or external providers
        const providerData = await db.query.aiProviders.findFirst({
            where: and(
                eq(aiProviders.userId, userId),
                eq(aiProviders.providerId, activeProviderId)
            )
        });

        if (!providerData?.apiKey) {
            return { success: false, error: "AI Provider not configured properly." };
        }

        const apiKey = await decrypt(providerData.apiKey);

        if (activeProviderId === "openai") {
            const openai = createOpenAI({ apiKey });
            model = openai("gpt-4o");
        } else if (activeProviderId === "anthropic") {
            const anthropic = createAnthropic({ apiKey });
            model = anthropic("claude-3-5-sonnet-20240620");
        } else {
            // Default to OpenAI if it looks compatible
            const custom = createOpenAI({ apiKey, baseURL: providerData.baseUrl || undefined });
            model = custom("model-id-needed");
        }

        const { text } = await generateText({
            model,
            system: "You are Debo, a personal AI that understands the user's life deeply. Use the provided journal entries and extracted memories to answer the user's question accurately and empatheticly. If the information isn't in the context, say you don't remember that yet.",
            prompt: `CONTEXT:\n${fullContext}\n\nUSER QUESTION: ${question}`,
        });

        return {
            success: true,
            data: {
                answer: text,
                sources: {
                    journals: journals.map(j => ({ id: j.id, title: j.title, createdAt: j.createdAt })),
                    memories: memories.map((m: any) => ({ id: m.id, content: m.content }))
                }
            }
        };

    } catch (error) {
        console.error("AskLife Engine Error:", error);
        return { success: false, error: "The memory engine encountered an error." };
    }
}
