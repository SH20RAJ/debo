import { mastra } from "@/mastra";
import { resolveUserId } from "@/actions/auth-sync";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();
  const agent = mastra.getAgent("debo");

  const result = await agent.stream(messages, {
    memory: {
        thread: "default", // We can improve this with thread IDs later
        resource: userId,
    },
    requestContext: {
        userId,
    }
  });

  return result.toDataStreamResponse();
}
