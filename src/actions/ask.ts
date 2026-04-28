"use server";

import { auth } from "@/lib/auth";
import { askLifeStream } from "@/lib/ai/askLife";
import type { UIMessage } from "ai";
import { headers } from "next/headers";

export async function askQuestionAction(messages: UIMessage[]) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const { result, citations } = await askLifeStream(messages, session.user.id);

    return result.toUIMessageStreamResponse({
        originalMessages: messages,
        messageMetadata: () => ({ citations }),
        onError: (error) => {
            console.error("Ask stream error:", error);
            return "Debo ran into a problem while thinking through that.";
        },
    });
}
