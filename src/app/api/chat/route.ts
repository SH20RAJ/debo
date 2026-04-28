/* eslint-disable @typescript-eslint/no-explicit-any */
import { askQuestionAction } from "@/actions/ask";

export const runtime = "edge";

export async function POST(req: Request) {
    const body = await req.json() as any;
    const { messages } = body;
    return await askQuestionAction(messages);
}
