// ============================================================================
// @debo/shared/constants
// Shared constants for the Debo backend
// ============================================================================

import type {
  SourceType,
  SourceStatus,
  MemoryItemType,
  EntityType,
  TaskStatus,
  ConnectorProvider,
} from "./types.js";

// ---------------------------------------------------------------------------
// Enum arrays (useful for validation, iteration, Zod .enum())
// ---------------------------------------------------------------------------

/** All supported source types */
export const SOURCE_TYPES: readonly SourceType[] = [
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
] as const;

/** All source lifecycle statuses */
export const SOURCE_STATUSES: readonly SourceStatus[] = [
  "draft",
  "uploaded",
  "processing",
  "ready",
  "needs_review",
  "failed",
  "deleted",
] as const;

/** All memory item types */
export const MEMORY_ITEM_TYPES: readonly MemoryItemType[] = [
  "fact",
  "preference",
  "task_hint",
  "decision",
  "idea",
  "promise",
  "reminder",
  "summary",
] as const;

/** All entity types */
export const ENTITY_TYPES: readonly EntityType[] = [
  "person",
  "project",
  "company",
  "date",
  "topic",
  "file",
  "url",
  "location",
  "product",
] as const;

/** All task statuses */
export const TASK_STATUSES: readonly TaskStatus[] = [
  "inbox",
  "todo",
  "doing",
  "done",
  "dismissed",
] as const;

/** All connector providers */
export const CONNECTOR_PROVIDERS: readonly ConnectorProvider[] = [
  "gmail",
  "google_calendar",
  "notion",
  "github",
  "slack",
  "drive",
  "custom",
] as const;

/** All background job types */
export const JOB_TYPES: readonly string[] = [
  "ingest-source",
  "transcribe-audio",
  "transcribe-video",
  "parse-document",
  "parse-link",
  "summarize-source",
  "extract-memory",
  "extract-tasks",
  "extract-entities",
  "chunk-source",
  "embed-chunks",
  "index-vectors",
  "sync-connector",
  "generate-weekly-review",
  "export-user-data",
  "delete-source-data",
  "delete-user-data",
] as const;

// ---------------------------------------------------------------------------
// R2 Storage
// ---------------------------------------------------------------------------

/**
 * R2 key prefix for source originals.
 * Pattern: workspaces/{workspaceId}/users/{userId}/sources/{sourceId}/original/
 */
export const R2_KEY_PREFIX =
  "workspaces/{workspaceId}/users/{userId}/sources/{sourceId}/original/" as const;

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

/** Maximum file upload size: 100 MB */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Maximum audio recording length: 3600 seconds (60 minutes) */
export const MAX_AUDIO_LENGTH = 3600;

/** Chunk size range in tokens (target ~400-900) */
export const CHUNK_SIZE = { min: 400, max: 900 } as const;

/** Chunk overlap range in tokens (target ~60-120) */
export const CHUNK_OVERLAP = { min: 60, max: 120 } as const;
