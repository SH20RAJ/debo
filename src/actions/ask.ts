"use server";

import { addChatMessage, createChat } from "@/actions/chat";
import { auth } from "@/lib/auth";
import { askLifeStream } from "@/lib/ai/askLife";
import { getLatestUserMessage, getMessageText, processConversationMemory } from "@/lib/chat/process";
import type { UIMessage } from "ai";
import { headers } from "next/headers";

export async function askQuestionAction(messages: UIMessage[], chatId?: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const activeChatId = chatId || (await createChat(getConversationTitle(messages)));
    const latestUserMessage = getLatestUserMessage(messages);

    if (latestUserMessage) {
        await addChatMessage(
            activeChatId,
            "user",
            getMessageText(latestUserMessage),
            { source: "chat", messageId: latestUserMessage.id }
        );
    }

    const { result, citations } = await askLifeStream(messages, session.user.id, {
        onFinish: async (event) => {
            const assistantText = event.text?.trim() || "";

            if (assistantText) {
                await addChatMessage(activeChatId, "assistant", assistantText, {
                    citations,
                    model: event.model.modelId,
                    stepCount: event.steps.length,
                });
            }

            await processConversationMemory({
                userId: session.user.id,
                messages,
            });
        },
    });

    return result.toUIMessageStreamResponse({
        originalMessages: messages,
        messageMetadata: () => ({ citations }),
        onError: (error) => {
            console.error("Ask stream error:", error);
            return "Debo ran into a problem while thinking through that.";
        },
    });
}

function getConversationTitle(messages: UIMessage[]) {
    const firstUserMessage = messages.find((message) => message.role === "user");
    const title = getMessageText(firstUserMessage);

    if (!title) {
        return "New Conversation";
    }

    return title.slice(0, 64);
}
