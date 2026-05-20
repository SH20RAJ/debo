/**
 * Extract memory route — processes source content into structured memory items.
 *
 * Called internally after a source is ingested.
 * Extracts facts, decisions, tasks, entities, and summaries.
 */

import { Hono } from "hono";

const app = new Hono();

// POST / — extract memory items from source content
app.post("/", async (c) => {
  const body = await c.req.json();

  const sourceId: string = body.sourceId || "";
  const userId: string = body.userId || "";
  const content: string = body.content || "";
  const sourceType: string = body.sourceType || "journal";

  if (!sourceId || !userId || !content) {
    return c.json(
      { error: "sourceId, userId, and content are required" },
      400,
    );
  }

  // TODO: Implement full extraction pipeline
  // For now, return a stub response indicating the service is ready
  // but extraction logic needs to be wired up.
  //
  // The extraction pipeline should:
  // 1. Extract entities (people, companies, products, locations)
  // 2. Extract facts and decisions
  // 3. Extract task hints (promises, deadlines, todos)
  // 4. Generate a summary
  // 5. Identify emotions and sentiment
  //
  // This can use:
  // - Vercel AI SDK structured output (generateObject)
  // - Or the existing regex extractors in @debo/ai/extract

  return c.json({
    status: "stub",
    message:
      "Memory extraction endpoint is ready. Full LLM extraction pipeline pending implementation.",
    sourceId,
    userId,
    sourceType,
    extractedItems: [],
  });
});

export default app;
