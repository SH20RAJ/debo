// CACHE_BUST: 1
import { askQuestionAction } from "@/actions/ask";
import type { UIMessage } from "ai";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json() as { messages?: UIMessage[]; chatId?: string };
    const { messages, chatId } = body;

    if (!Array.isArray(messages)) {
        return new Response("Invalid chat payload", { status: 400 });
    }

    return await askQuestionAction(messages, chatId);
}
