"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { askLifeStream } from "@/lib/ai/askLife";

export async function askQuestionAction(messages: any[]) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const result = await askLifeStream(messages, session.user.id);

    return result.toTextStreamResponse();
}
