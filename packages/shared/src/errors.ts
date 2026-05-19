// ============================================================================
// @debo/shared/errors
// Typed error classes for the Debo backend
// ============================================================================

/**
 * Base error class for all Debo application errors.
 * Includes a machine-readable `code` and HTTP `statusCode`.
 */
export class DeboError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, message: string, code: string) {
    super(message);
    this.name = "DeboError";
    this.statusCode = statusCode;
    this.code = code;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

/** Resource not found (404) */
export class NotFoundError extends DeboError {
  constructor(resource: string, id?: string) {
    const msg = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`;
    super(404, msg, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/** Missing or invalid authentication (401) */
export class UnauthorizedError extends DeboError {
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/** Authenticated but insufficient permissions (403) */
export class ForbiddenError extends DeboError {
  constructor(message = "Insufficient permissions") {
    super(403, message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/** Request input validation failed (400) */
export class ValidationError extends DeboError {
  public readonly fields: Record<string, string[]> | undefined;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.fields = fields;
  }

  override toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fields ? { fields: this.fields } : {}),
      },
    };
  }
}

/** Resource conflict — duplicate or state conflict (409) */
export class ConflictError extends DeboError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
    this.name = "ConflictError";
  }
}

/** Too many requests (429) */
export class RateLimitError extends DeboError {
  public readonly retryAfter: number | undefined;

  constructor(message = "Rate limit exceeded", retryAfter?: number) {
    super(429, message, "RATE_LIMITED");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }

  override toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.retryAfter ? { retryAfter: this.retryAfter } : {}),
      },
    };
  }
}
