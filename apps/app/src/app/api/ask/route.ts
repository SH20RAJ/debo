import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const question = body.question || "";
  const mode = body.mode || "recall";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Simulate retrieval
      send({ event: "retrieval_started", chunks: 3 });
      await sleep(200);

      send({ event: "source_found", sourceType: "journal", title: "Product Ideas", snippet: "Key product decisions and feature ideas..." });
      send({ event: "source_found", sourceType: "voice", title: "Marketing Sync", snippet: "Discussion about Q4 budget allocation..." });
      send({ event: "source_found", sourceType: "email", title: "Team Update", snippet: "Weekly progress and blockers..." });

      // Stream answer tokens
      const answer = generateAnswer(question, mode);
      const words = answer.split(" ");
      for (let i = 0; i < words.length; i++) {
        send({ event: "answer_delta", delta: (i > 0 ? " " : "") + words[i] });
        await sleep(30);
      }

      // Citations
      send({ event: "citation_added", citation: { id: "cit_1", sourceType: "journal", title: "Product Ideas", snippet: "Key product decisions...", confidence: "strong" } });
      send({ event: "citation_added", citation: { id: "cit_2", sourceType: "voice", title: "Marketing Sync", snippet: "Q4 budget discussion...", confidence: "partial" } });

      // Related memories
      send({ event: "related_memory", memory: { id: "mem_1", title: "Weekly Review", type: "journal", summary: "End of week reflection" } });

      // Suggested follow-ups
      send({ event: "suggested_followup", question: "What tasks are pending from this?" });
      send({ event: "suggested_followup", question: "Summarize my last 7 days" });

      // Done
      send({
        event: "done",
        answer,
        citations: [
          { id: "cit_1", sourceType: "journal", title: "Product Ideas", snippet: "Key product decisions...", confidence: "strong", relevanceScore: 0.9 },
          { id: "cit_2", sourceType: "voice", title: "Marketing Sync", snippet: "Q4 budget discussion...", confidence: "partial", relevanceScore: 0.7 },
        ],
        confidence: 0.75,
        intent: "memory_recall",
        mode,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateAnswer(question: string, mode: string): string {
  const q = question.toLowerCase();

  if (q.includes("promise") || q.includes("commit")) {
    return "Based on your memory, you made several commitments recently. In your Marketing Sync voice note, you discussed the Q4 budget allocation and agreed to finalize the numbers by end of week. You also mentioned reviewing the product roadmap with the engineering team. Your journal entries from last week reference a commitment to improve the onboarding flow based on user feedback.";
  }

  if (q.includes("summarize") || q.includes("summary") || q.includes("week")) {
    return "Here's a summary of your last 7 days: You had 3 journal entries covering product strategy, a marketing sync meeting, and a weekly review. Key themes include Q4 planning, product feature prioritization, and team alignment. You created 2 new tasks and completed 1. Your most active project is the main product initiative.";
  }

  if (q.includes("task") || q.includes("todo")) {
    return "I found several tasks in your memory. You have 3 active tasks: finalize Q4 budget numbers, review landing page designs, and follow up on the engineering proposal. There are also 2 tasks extracted from your recent voice notes that need review.";
  }

  if (q.includes("who") || q.includes("person") || q.includes("people")) {
    return "From your memory, I can see mentions of several people. Your most frequently mentioned contacts appear in your meeting notes and voice transcripts. Recent interactions include discussions about project timelines, budget reviews, and team coordination.";
  }

  if (mode === "summarize") {
    return `Based on your stored memories, here's a summary related to "${question}": Your recent journal entries and voice notes contain relevant context. The key themes include product development, team collaboration, and strategic planning. I found connections across 3 different source types in your memory graph.`;
  }

  return `Based on your stored memories, I found relevant information about "${question}". Your memory graph contains entries from journals, voice notes, and other sources that relate to this topic. The most relevant sources are your recent journal entries and meeting notes. I'd recommend reviewing the cited sources for more detailed context.`;
}
