import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, asc, desc, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
        // List all chats for user
        const userChats = await db.query.chats.findMany({
            where: eq(chats.userId, session.user.id),
            orderBy: [desc(chats.updatedAt)],
        });
        return Response.json(userChats);
    }

    // List messages for specific chat
    const chatMessages = await db.query.messages.findMany({
        where: eq(messages.chatId, chatId),
        orderBy: [asc(messages.createdAt)],
    });

    return Response.json({
        messages: chatMessages.map(m => ({
            id: m.id,
            role: m.role,
            content: JSON.parse(m.content),
            createdAt: m.createdAt,
        }))
    });
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new Response("Unauthorized", { status: 401 });

    const body = await req.json() as { chatId: string; message?: any; parentId?: string; title?: string };
    const { chatId, message, parentId, title } = body;

    // 1. Ensure chat exists or create it
    let chat = await db.query.chats.findFirst({
        where: and(eq(chats.id, chatId), eq(chats.userId, session.user.id)),
    });

    if (!chat) {
        await db.insert(chats).values({
            id: chatId,
            userId: session.user.id,
            title: title || "New Chat",
        });
    }

    // 2. Append message
    if (message) {
        await db.insert(messages).values({
            id: message.id || crypto.randomUUID(),
            chatId: chatId,
            role: message.role,
            content: JSON.stringify(message.content),
        });
    }

    return Response.json({ success: true });
}
