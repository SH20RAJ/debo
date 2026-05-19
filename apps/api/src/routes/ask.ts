import { Hono } from "hono";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const question = body.question || "";

  return c.json({
    id: `ans_${Date.now()}`,
    question,
    answer: `This is a placeholder answer for: "${question}". The real Ask Debo pipeline will search your memory graph, retrieve relevant sources, and generate a source-backed answer.`,
    citations: [
      { id: "cit_mock_1", sourceType: "journal", title: "Example Source", snippet: "Relevant snippet from one of your sources.", score: 0.92 },
    ],
    confidence: 0.0,
    userId: ctx.userId,
    createdAt: new Date().toISOString(),
  });
});

export default app;
