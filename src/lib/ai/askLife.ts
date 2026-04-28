/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { streamText } from "ai";
import { createTools } from "./tools";
import { db } from "@/db";
import { userPreferences, aiProviders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { decrypt } from "@/lib/encryption";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function askLifeStream(messages: any[], userId: string) {
    // 1. Get User's Preferred Model
    const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId)
    });

    const activeProviderId = prefs?.activeProvider || "cloudflare";
    
    let model: any;
    
    if (activeProviderId === "cloudflare") {
        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as any;
        
        // We'll use OpenAI-compatible workers AI if possible, 
        // but for now let's assume OpenAI fallback if not in production
        // In a real cloudflare env, we'd use a cloudflare provider for AI SDK
        // Since there's no official Cloudflare provider for AI SDK yet that's stable,
        // we might need to use OpenAI or Anthropic as primary for streaming tools.
        // Actually, let's check if the user has OpenAI/Anthropic configured.
    }

    const providerData = await db.query.aiProviders.findFirst({
        where: and(
            eq(aiProviders.userId, userId),
            eq(aiProviders.providerId, activeProviderId)
        )
    });

    // If no provider configured, try to find ANY provider with an API key
    let finalProviderData = providerData;
    if (!finalProviderData?.apiKey) {
        finalProviderData = await db.query.aiProviders.findFirst({
            where: and(
                eq(aiProviders.userId, userId)
            )
        });
    }

    if (!finalProviderData?.apiKey) {
        // Fallback to environment variables if available
        if (process.env.OPENAI_API_KEY) {
            model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })("gpt-4o");
        } else if (process.env.ANTHROPIC_API_KEY) {
            model = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })("claude-3-5-sonnet-20240620");
        } else {
            throw new Error("No AI provider configured. Please add an API key in settings.");
        }
    } else {
        const apiKey = await decrypt(finalProviderData.apiKey);
        if (finalProviderData.providerId === "openai") {
            model = createOpenAI({ apiKey })((finalProviderData as any).modelId || "gpt-4o");
        } else if (finalProviderData.providerId === "anthropic") {
            model = createAnthropic({ apiKey })((finalProviderData as any).modelId || "claude-3-5-sonnet-20240620");
        } else {
            const custom = createOpenAI({ apiKey, baseURL: finalProviderData.baseUrl || undefined });
            model = custom((finalProviderData as any).modelId || "model-id-needed");
        }
    }

    const tools = createTools(userId);

    return streamText({
        model,
        system: `You are Debo, the user's highly intelligent personal AI life companion. 
        Your goal is to help the user reflect on their life, answer questions about their past, 
        and provide insights based on their journals and memories.

        GUIDELINES:
        1. ALWAYS search for relevant information using tools before answering if the user asks about their past, habits, or specific events.
        2. Be empathetic, concise, and helpful.
        3. If you find citations (journal entries or memories), refer to them naturally.
        4. If you don't know something after searching, be honest and say you don't remember that yet.
        5. Use the user's tone and context to provide personalized responses.
        6. Think step-by-step. If a user asks a complex question, you might need to call multiple tools or search multiple times.

        Current date: ${new Date().toLocaleDateString()}
        `,
        messages,
        tools,
    });
}
