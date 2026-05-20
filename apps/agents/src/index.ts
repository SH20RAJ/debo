/**
 * Debo Agents Service — Standalone AI intelligence service.
 *
 * This service is NOT publicly accessible. It is called internally
 * by apps/api via HTTP, authenticated with AGENTS_INTERNAL_SECRET.
 *
 * Endpoints:
 *   POST /ask              — Source-backed Ask Debo (streaming)
 *   POST /extract-memory   — Extract memory items from source content
 *   GET  /health           — Health check
 */

import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requireInternalAuth } from "./lib/auth";

import askRouter from "./routes/ask";
import extractMemoryRouter from "./routes/extract-memory";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://app.debo.life",
    ],
  }),
);

// Health check (no auth required)
app.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "debo-agents",
    timestamp: new Date().toISOString(),
  }),
);

// All AI routes require internal auth
app.use("/ask", requireInternalAuth);
app.use("/extract-memory", requireInternalAuth);

app.route("/ask", askRouter);
app.route("/extract-memory", extractMemoryRouter);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;

// ─── Server startup ────────────────────────────────────────────────────────

const port = Number(process.env.AGENTS_PORT) || 3002;
console.log(`Debo Agents service running on http://localhost:${port}`);

if (typeof Bun !== "undefined") {
  Bun.serve({ port, fetch: app.fetch });
} else {
  import("@hono/node-server")
    .then(({ serve }) => {
      serve({ fetch: app.fetch, port });
    })
    .catch(() => {
      console.warn("Install @hono/node-server for Node.js support");
    });
}
