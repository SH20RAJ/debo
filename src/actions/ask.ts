"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { askLife } from "@/lib/life-query-engine";

export async function askQuestionAction(question: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    if (!question || question.length < 3) {
        return { success: false, error: "Question too short." };
    }

    try {
        const result = await askLife(question, session.user.id);
        return result;
    } catch (error) {
        console.error("Ask action error:", error);
        return { success: false, error: "Failed to query your life." };
    }
}
