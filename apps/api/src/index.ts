import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { requireAuth } from "./lib/auth";
import { contextMiddleware } from "./lib/context";
import { errorHandler } from "./lib/errors";

import sourcesRouter from "./routes/sources";
import tasksRouter from "./routes/tasks";
import peopleRouter from "./routes/people";
import projectsRouter from "./routes/projects";
import askRouter from "./routes/ask";
import chatRouter from "./routes/chat";
import connectorsRouter from "./routes/connectors";
import voiceRouter from "./routes/voice";
import vaultRouter from "./routes/vault";
import uploadsRouter from "./routes/uploads";
import mailRouter from "./routes/mail";

const app = new Hono();

app.use("*", logger());
app.use("*", requestId());
app.use("*", cors({ origin: ["http://localhost:3000", "https://app.debo.life", "https://debo-app.shraj.workers.dev"] }));
app.onError(errorHandler);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/*", requireAuth);
app.use("/api/*", contextMiddleware);

app.route("/api/sources", sourcesRouter);
app.route("/api/tasks", tasksRouter);
app.route("/api/people", peopleRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/ask", askRouter);
app.route("/api/chat", chatRouter);
app.route("/api/connectors", connectorsRouter);
app.route("/api/voice", voiceRouter);
app.route("/api/vault", vaultRouter);
app.route("/api/uploads", uploadsRouter);
app.route("/api/mail", mailRouter);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;

const port = Number(process.env.PORT) || 3001;
console.log(`Debo API running on http://localhost:${port}`);

if (typeof Bun !== "undefined") {
  Bun.serve({ port, fetch: app.fetch });
} else {
  import("@hono/node-server").then(({ serve }) => {
    serve({ fetch: app.fetch, port });
  }).catch(() => {
    console.warn("Install @hono/node-server for Node.js support");
  });
}
