import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";

// ─── 1. users ────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

// ─── 2. workspaces ───────────────────────────────────────────────────────────

export const workspaces = pgTable(
  "workspaces",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    type: text("type", { enum: ["personal", "team"] }).notNull().default("personal"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("workspaces_owner_user_id_idx").on(t.ownerUserId),
    index("workspaces_type_idx").on(t.type),
  ],
);

// ─── 3. workspace_members ────────────────────────────────────────────────────

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role", { enum: ["owner", "admin", "member", "viewer"] })
      .notNull()
      .default("member"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("workspace_members_workspace_id_idx").on(t.workspaceId),
    index("workspace_members_user_id_idx").on(t.userId),
    uniqueIndex("workspace_members_unique_idx").on(t.workspaceId, t.userId),
  ],
);

// ─── 4. sources ──────────────────────────────────────────────────────────────

export const sources = pgTable(
  "sources",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    type: text("type", {
      enum: [
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
      ],
    }).notNull(),
    title: text("title"),
    description: text("description"),
    status: text("status", {
      enum: ["draft", "uploaded", "processing", "ready", "needs_review", "failed", "deleted"],
    })
      .notNull()
      .default("draft"),
    origin: text("origin", {
      enum: ["manual", "upload", "connector", "livekit", "import"],
    }),
    originalUrl: text("original_url"),
    connectorAccountId: text("connector_account_id"),
    externalId: text("external_id"),
    sourceDate: timestamp("source_date", { mode: "string" }),
    language: text("language"),
    privacyLevel: text("privacy_level", {
      enum: ["normal", "private", "sensitive"],
    })
      .notNull()
      .default("normal"),
    plainText: text("plain_text"),
    summary: text("summary"),
    metadataJson: text("metadata_json"),
    processingError: text("processing_error"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (t) => [
    index("sources_user_id_idx").on(t.userId),
    index("sources_workspace_id_idx").on(t.workspaceId),
    index("sources_type_idx").on(t.type),
    index("sources_status_idx").on(t.status),
    index("sources_source_date_idx").on(t.sourceDate),
    index("sources_deleted_at_idx").on(t.deletedAt),
  ],
);

// ─── 5. source_files ─────────────────────────────────────────────────────────

export const sourceFiles = pgTable(
  "source_files",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    r2Bucket: text("r2_bucket").notNull(),
    r2Key: text("r2_key").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    durationSeconds: real("duration_seconds"),
    checksumSha256: text("checksum_sha256"),
    uploadStatus: text("upload_status", {
      enum: ["pending", "uploaded", "failed"],
    })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("source_files_user_id_idx").on(t.userId),
    index("source_files_workspace_id_idx").on(t.workspaceId),
    index("source_files_source_id_idx").on(t.sourceId),
    index("source_files_upload_status_idx").on(t.uploadStatus),
  ],
);

// ─── 6. documents ────────────────────────────────────────────────────────────

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    format: text("format", {
      enum: [
        "blocknote_json",
        "markdown",
        "html",
        "plain_text",
        "transcript",
        "parsed_pdf",
      ],
    }).notNull(),
    contentJson: text("content_json"),
    contentText: text("content_text"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("documents_user_id_idx").on(t.userId),
    index("documents_workspace_id_idx").on(t.workspaceId),
    index("documents_source_id_idx").on(t.sourceId),
  ],
);

// ─── 7. transcripts ──────────────────────────────────────────────────────────

export const transcripts = pgTable(
  "transcripts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    provider: text("provider", {
      enum: ["deepgram", "assemblyai", "openai", "manual"],
    }).notNull(),
    text: text("text"),
    segmentsJson: text("segments_json"),
    speakersJson: text("speakers_json"),
    language: text("language"),
    confidence: real("confidence"),
    status: text("status", { enum: ["processing", "ready", "failed"] })
      .notNull()
      .default("processing"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("transcripts_user_id_idx").on(t.userId),
    index("transcripts_workspace_id_idx").on(t.workspaceId),
    index("transcripts_source_id_idx").on(t.sourceId),
    index("transcripts_status_idx").on(t.status),
  ],
);

// ─── 8. memory_chunks ────────────────────────────────────────────────────────

export const memoryChunks = pgTable(
  "memory_chunks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    documentId: text("document_id").references(() => documents.id),
    transcriptId: text("transcript_id").references(() => transcripts.id),
    chunkIndex: integer("chunk_index").notNull(),
    text: text("text").notNull(),
    tokenCount: integer("token_count"),
    vectorId: text("vector_id"),
    startOffset: integer("start_offset"),
    endOffset: integer("end_offset"),
    pageNumber: integer("page_number"),
    startTime: real("start_time"),
    endTime: real("end_time"),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("memory_chunks_user_id_idx").on(t.userId),
    index("memory_chunks_workspace_id_idx").on(t.workspaceId),
    index("memory_chunks_source_id_idx").on(t.sourceId),
    index("memory_chunks_document_id_idx").on(t.documentId),
    index("memory_chunks_transcript_id_idx").on(t.transcriptId),
    index("memory_chunks_vector_id_idx").on(t.vectorId),
  ],
);

// ─── 9. memory_items ─────────────────────────────────────────────────────────

export const memoryItems = pgTable(
  "memory_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    type: text("type", {
      enum: [
        "fact",
        "preference",
        "task_hint",
        "decision",
        "idea",
        "promise",
        "reminder",
        "summary",
      ],
    }).notNull(),
    title: text("title"),
    content: text("content").notNull(),
    confidence: real("confidence"),
    importance: text("importance", { enum: ["low", "medium", "high"] })
      .notNull()
      .default("medium"),
    reviewStatus: text("review_status", {
      enum: ["auto_saved", "needs_review", "approved", "rejected"],
    })
      .notNull()
      .default("auto_saved"),
    validFrom: timestamp("valid_from", { mode: "string" }),
    validUntil: timestamp("valid_until", { mode: "string" }),
    model: text("model"),
    promptVersion: text("prompt_version"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("memory_items_user_id_idx").on(t.userId),
    index("memory_items_workspace_id_idx").on(t.workspaceId),
    index("memory_items_source_id_idx").on(t.sourceId),
    index("memory_items_type_idx").on(t.type),
    index("memory_items_review_status_idx").on(t.reviewStatus),
    index("memory_items_importance_idx").on(t.importance),
  ],
);

// ─── 10. entities ────────────────────────────────────────────────────────────

export const entities = pgTable(
  "entities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    type: text("type", {
      enum: [
        "person",
        "project",
        "company",
        "date",
        "topic",
        "file",
        "url",
        "location",
        "product",
      ],
    }).notNull(),
    value: text("value").notNull(),
    normalizedValue: text("normalized_value").notNull(),
    confidence: real("confidence"),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("entities_user_id_idx").on(t.userId),
    index("entities_workspace_id_idx").on(t.workspaceId),
    index("entities_source_id_idx").on(t.sourceId),
    index("entities_type_idx").on(t.type),
    index("entities_normalized_value_idx").on(t.normalizedValue),
    uniqueIndex("entities_unique_idx").on(t.userId, t.workspaceId, t.type, t.normalizedValue),
  ],
);

// ─── 11. people ──────────────────────────────────────────────────────────────

export const people = pgTable(
  "people",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    name: text("name").notNull(),
    aliasesJson: text("aliases_json"),
    relationship: text("relationship"),
    company: text("company"),
    role: text("role"),
    notes: text("notes"),
    lastMentionedAt: timestamp("last_mentioned_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("people_user_id_idx").on(t.userId),
    index("people_workspace_id_idx").on(t.workspaceId),
    index("people_name_idx").on(t.name),
  ],
);

// ─── 12. person_mentions ─────────────────────────────────────────────────────

export const personMentions = pgTable(
  "person_mentions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    personId: text("person_id")
      .notNull()
      .references(() => people.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    memoryItemId: text("memory_item_id").references(() => memoryItems.id),
    contextText: text("context_text"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("person_mentions_user_id_idx").on(t.userId),
    index("person_mentions_workspace_id_idx").on(t.workspaceId),
    index("person_mentions_person_id_idx").on(t.personId),
    index("person_mentions_source_id_idx").on(t.sourceId),
    index("person_mentions_memory_item_id_idx").on(t.memoryItemId),
  ],
);

// ─── 13. projects ────────────────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", { enum: ["active", "paused", "archived"] })
      .notNull()
      .default("active"),
    color: text("color"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("projects_user_id_idx").on(t.userId),
    index("projects_workspace_id_idx").on(t.workspaceId),
    index("projects_status_idx").on(t.status),
  ],
);

// ─── 14. project_links ───────────────────────────────────────────────────────

export const projectLinks = pgTable(
  "project_links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    sourceId: text("source_id").references(() => sources.id),
    memoryItemId: text("memory_item_id").references(() => memoryItems.id),
    relationType: text("relation_type", {
      enum: ["mentioned_in", "belongs_to", "decision_for", "task_for"],
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("project_links_user_id_idx").on(t.userId),
    index("project_links_workspace_id_idx").on(t.workspaceId),
    index("project_links_project_id_idx").on(t.projectId),
    index("project_links_source_id_idx").on(t.sourceId),
    index("project_links_memory_item_id_idx").on(t.memoryItemId),
  ],
);

// ─── 15. tasks ───────────────────────────────────────────────────────────────

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id").references(() => sources.id),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["inbox", "todo", "doing", "done", "dismissed"],
    })
      .notNull()
      .default("inbox"),
    dueAt: timestamp("due_at", { mode: "string" }),
    relatedPersonId: text("related_person_id").references(() => people.id),
    projectId: text("project_id").references(() => projects.id),
    confidence: real("confidence"),
    extractionStatus: text("extraction_status", {
      enum: ["manual", "extracted_pending", "extracted_approved", "rejected"],
    })
      .notNull()
      .default("manual"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("tasks_user_id_idx").on(t.userId),
    index("tasks_workspace_id_idx").on(t.workspaceId),
    index("tasks_source_id_idx").on(t.sourceId),
    index("tasks_status_idx").on(t.status),
    index("tasks_due_at_idx").on(t.dueAt),
    index("tasks_related_person_id_idx").on(t.relatedPersonId),
    index("tasks_project_id_idx").on(t.projectId),
    index("tasks_extraction_status_idx").on(t.extractionStatus),
  ],
);

// ─── 16. decisions ───────────────────────────────────────────────────────────

export const decisions = pgTable(
  "decisions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id").references(() => sources.id),
    projectId: text("project_id").references(() => projects.id),
    title: text("title").notNull(),
    decisionText: text("decision_text").notNull(),
    reason: text("reason"),
    status: text("status", { enum: ["active", "changed", "deprecated"] })
      .notNull()
      .default("active"),
    confidence: real("confidence"),
    decidedAt: timestamp("decided_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("decisions_user_id_idx").on(t.userId),
    index("decisions_workspace_id_idx").on(t.workspaceId),
    index("decisions_source_id_idx").on(t.sourceId),
    index("decisions_project_id_idx").on(t.projectId),
    index("decisions_status_idx").on(t.status),
  ],
);

// ─── 17. memory_relations ────────────────────────────────────────────────────

export const memoryRelations = pgTable(
  "memory_relations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    fromType: text("from_type", {
      enum: ["source", "memory_item", "person", "task", "project", "decision"],
    }).notNull(),
    fromId: text("from_id").notNull(),
    toType: text("to_type", {
      enum: ["source", "memory_item", "person", "task", "project", "decision"],
    }).notNull(),
    toId: text("to_id").notNull(),
    relationType: text("relation_type", {
      enum: ["mentions", "supports", "contradicts", "follows_up", "same_topic", "depends_on"],
    }).notNull(),
    confidence: real("confidence"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("memory_relations_user_id_idx").on(t.userId),
    index("memory_relations_workspace_id_idx").on(t.workspaceId),
    index("memory_relations_from_idx").on(t.fromType, t.fromId),
    index("memory_relations_to_idx").on(t.toType, t.toId),
    index("memory_relations_relation_type_idx").on(t.relationType),
  ],
);

// ─── 18. chat_threads ────────────────────────────────────────────────────────

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    title: text("title"),
    mode: text("mode", {
      enum: ["recall", "summarize", "plan", "draft", "task", "project"],
    })
      .notNull()
      .default("recall"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("chat_threads_user_id_idx").on(t.userId),
    index("chat_threads_workspace_id_idx").on(t.workspaceId),
  ],
);

// ─── 19. chat_messages ───────────────────────────────────────────────────────

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThreads.id),
    role: text("role", { enum: ["user", "assistant", "tool", "system"] }).notNull(),
    content: text("content").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("chat_messages_user_id_idx").on(t.userId),
    index("chat_messages_workspace_id_idx").on(t.workspaceId),
    index("chat_messages_thread_id_idx").on(t.threadId),
    index("chat_messages_created_at_idx").on(t.createdAt),
  ],
);

// ─── 20. answer_citations ────────────────────────────────────────────────────

export const answerCitations = pgTable(
  "answer_citations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    messageId: text("message_id")
      .notNull()
      .references(() => chatMessages.id),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    chunkId: text("chunk_id").references(() => memoryChunks.id),
    quoteText: text("quote_text"),
    pageNumber: integer("page_number"),
    startTime: real("start_time"),
    endTime: real("end_time"),
    confidence: real("confidence"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("answer_citations_user_id_idx").on(t.userId),
    index("answer_citations_workspace_id_idx").on(t.workspaceId),
    index("answer_citations_message_id_idx").on(t.messageId),
    index("answer_citations_source_id_idx").on(t.sourceId),
    index("answer_citations_chunk_id_idx").on(t.chunkId),
  ],
);

// ─── 21. connector_accounts ──────────────────────────────────────────────────

export const connectorAccounts = pgTable(
  "connector_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    provider: text("provider", {
      enum: ["gmail", "google_calendar", "notion", "github", "slack", "drive", "custom"],
    }).notNull(),
    status: text("status", {
      enum: ["connected", "disconnected", "expired", "error", "paused"],
    })
      .notNull()
      .default("disconnected"),
    externalAccountId: text("external_account_id"),
    scopesJson: text("scopes_json"),
    syncRulesJson: text("sync_rules_json"),
    lastSyncedAt: timestamp("last_synced_at", { mode: "string" }),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("connector_accounts_user_id_idx").on(t.userId),
    index("connector_accounts_workspace_id_idx").on(t.workspaceId),
    index("connector_accounts_provider_idx").on(t.provider),
    index("connector_accounts_status_idx").on(t.status),
  ],
);

// ─── 22. connector_sync_runs ─────────────────────────────────────────────────

export const connectorSyncRuns = pgTable(
  "connector_sync_runs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    connectorAccountId: text("connector_account_id")
      .notNull()
      .references(() => connectorAccounts.id),
    status: text("status", {
      enum: ["queued", "running", "success", "failed", "partial"],
    })
      .notNull()
      .default("queued"),
    startedAt: timestamp("started_at", { mode: "string" }),
    finishedAt: timestamp("finished_at", { mode: "string" }),
    importedCount: integer("imported_count").default(0),
    error: text("error"),
    metadataJson: text("metadata_json"),
  },
  (t) => [
    index("connector_sync_runs_user_id_idx").on(t.userId),
    index("connector_sync_runs_workspace_id_idx").on(t.workspaceId),
    index("connector_sync_runs_connector_account_id_idx").on(t.connectorAccountId),
    index("connector_sync_runs_status_idx").on(t.status),
  ],
);

// ─── 23. jobs ────────────────────────────────────────────────────────────────

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id").references(() => sources.id),
    type: text("type").notNull(),
    status: text("status", {
      enum: ["queued", "running", "success", "failed", "cancelled"],
    })
      .notNull()
      .default("queued"),
    providerJobId: text("provider_job_id"),
    attempts: integer("attempts").notNull().default(0),
    error: text("error"),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("jobs_user_id_idx").on(t.userId),
    index("jobs_workspace_id_idx").on(t.workspaceId),
    index("jobs_source_id_idx").on(t.sourceId),
    index("jobs_type_idx").on(t.type),
    index("jobs_status_idx").on(t.status),
  ],
);

// ─── 24. audit_logs ──────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_user_id_idx").on(t.userId),
    index("audit_logs_workspace_id_idx").on(t.workspaceId),
    index("audit_logs_action_idx").on(t.action),
    index("audit_logs_target_idx").on(t.targetType, t.targetId),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ],
);

// ─── 25. voice_sessions ──────────────────────────────────────────────────────

export const voiceSessions = pgTable(
  "voice_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    sourceId: text("source_id").references(() => sources.id),
    roomName: text("room_name").notNull(),
    status: text("status", { enum: ["active", "completed", "failed"] })
      .notNull()
      .default("active"),
    startedAt: timestamp("started_at", { mode: "string" }),
    endedAt: timestamp("ended_at", { mode: "string" }),
    durationSeconds: integer("duration_seconds"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("voice_sessions_user_id_idx").on(t.userId),
    index("voice_sessions_workspace_id_idx").on(t.workspaceId),
    index("voice_sessions_source_id_idx").on(t.sourceId),
    index("voice_sessions_status_idx").on(t.status),
  ],
);
