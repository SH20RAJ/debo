import type { Context } from "hono";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} ${id} not found`, 404, "NOT_FOUND");
  }
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof ZodError) {
    return c.json(
      { error: "Validation failed", issues: err.issues },
      422
    );
  }
  if (err instanceof AppError) {
    return c.json({ error: err.message, code: err.code }, err.status as any);
  }
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
}
