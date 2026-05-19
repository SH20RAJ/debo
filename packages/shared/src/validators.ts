// ============================================================================
// @debo/shared/validators
// Zod schemas for API input validation
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cuid = z.string().min(1);
const isoDateTime = z.string().datetime();

// ---------------------------------------------------------------------------
// Source schemas
// ---------------------------------------------------------------------------

/** Create a new source */
export const createSourceSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum([
    "journal",
    "voice",
    "audio",
    "video",
    "file",
    "image",
    "link",
    "email",
    "calendar",
    "notion",
    "github",
    "call",
    "manual",
  ]),
  description: z.string().max(2000).optional(),
  origin: z
    .enum(["manual", "upload", "connector", "livekit", "import"])
    .optional()
    .default("manual"),
  privacy_level: z
    .enum(["normal", "private", "sensitive"])
    .optional()
    .default("normal"),
  project_id: cuid.optional(),
  original_url: z.string().url().optional(),
  source_date: isoDateTime.optional(),
  language: z.string().max(10).optional(),
  plain_text: z.string().optional(),
  metadata_json: z.record(z.string(), z.unknown()).optional(),
});

/** Update an existing source */
export const updateSourceSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  privacy_level: z.enum(["normal", "private", "sensitive"]).optional(),
  project_id: cuid.optional().nullable(),
  language: z.string().max(10).optional().nullable(),
  plain_text: z.string().optional(),
  summary: z.string().optional().nullable(),
  metadata_json: z.record(z.string(), z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Task schemas
// ---------------------------------------------------------------------------

/** Create a new task */
export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  source_id: cuid.optional(),
  due_at: isoDateTime.optional(),
  related_person_id: cuid.optional(),
  project_id: cuid.optional(),
  status: z
    .enum(["inbox", "todo", "doing", "done", "dismissed"])
    .optional()
    .default("inbox"),
});

/** Update an existing task */
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["inbox", "todo", "doing", "done", "dismissed"]).optional(),
  due_at: isoDateTime.optional().nullable(),
  related_person_id: cuid.optional().nullable(),
  project_id: cuid.optional().nullable(),
});

// ---------------------------------------------------------------------------
// Person schemas
// ---------------------------------------------------------------------------

/** Create a new person */
export const createPersonSchema = z.object({
  name: z.string().min(1).max(200),
  relationship: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  aliases: z.array(z.string().max(100)).optional(),
});

// ---------------------------------------------------------------------------
// Ask / Chat schemas
// ---------------------------------------------------------------------------

/** Ask Debo a question */
export const askSchema = z.object({
  question: z.string().min(1).max(5000),
  mode: z
    .enum(["recall", "summarize", "plan", "draft", "task", "project"])
    .optional()
    .default("recall"),
  threadId: cuid.optional(),
  filters: z
    .object({
      sourceTypes: z
        .array(
          z.enum([
            "journal",
            "voice",
            "audio",
            "video",
            "file",
            "image",
            "link",
            "email",
            "calendar",
            "notion",
            "github",
            "call",
            "manual",
          ])
        )
        .optional(),
      dateRange: z.string().optional(),
      personId: cuid.optional(),
      projectId: cuid.optional(),
    })
    .optional(),
});

/** Create a new chat thread */
export const createChatThreadSchema = z.object({
  title: z.string().max(200).optional(),
  mode: z
    .enum(["recall", "summarize", "plan", "draft", "task", "project"])
    .optional()
    .default("recall"),
});

// ---------------------------------------------------------------------------
// Upload schemas
// ---------------------------------------------------------------------------

/** Request a presigned upload URL */
export const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mime_type: z.string().min(1).max(100),
  size_bytes: z.number().int().positive().max(100 * 1024 * 1024), // 100MB
  source_type: z
    .enum(["voice", "audio", "video", "file", "image"])
    .optional()
    .default("file"),
});

// ---------------------------------------------------------------------------
// Connector schemas
// ---------------------------------------------------------------------------

/** Connect an external service */
export const connectorConnectSchema = z.object({
  provider: z.enum([
    "gmail",
    "google_calendar",
    "notion",
    "github",
    "slack",
    "drive",
    "custom",
  ]),
  external_account_id: z.string().max(500).optional(),
  scopes: z.array(z.string()).optional(),
  sync_rules: z.record(z.string(), z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Export schemas
// ---------------------------------------------------------------------------

/** Export user data */
export const exportDataSchema = z.object({
  format: z.enum(["json", "markdown", "csv", "zip"]).optional().default("json"),
  include_files: z.boolean().optional().default(false),
  source_ids: z.array(cuid).optional(),
  date_from: isoDateTime.optional(),
  date_to: isoDateTime.optional(),
});

// ---------------------------------------------------------------------------
// Inferred types from schemas
// ---------------------------------------------------------------------------

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type AskInput = z.infer<typeof askSchema>;
export type CreateChatThreadInput = z.infer<typeof createChatThreadSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type ConnectorConnectInput = z.infer<typeof connectorConnectSchema>;
export type ExportDataInput = z.infer<typeof exportDataSchema>;
