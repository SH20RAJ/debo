// ============================================================================
// @debo/shared/types
// TypeScript types matching the Debo database schema
// ============================================================================

// ---------------------------------------------------------------------------
// Enums & Literal Unions
// ---------------------------------------------------------------------------

/** Type of source content */
export type SourceType =
  | "journal"
  | "voice"
  | "audio"
  | "video"
  | "file"
  | "image"
  | "link"
  | "email"
  | "calendar"
  | "notion"
  | "github"
  | "call"
  | "manual";

/** Processing status of a source */
export type SourceStatus =
  | "draft"
  | "uploaded"
  | "processing"
  | "ready"
  | "needs_review"
  | "failed"
  | "deleted";

/** How the source was created */
export type SourceOrigin = "manual" | "upload" | "connector" | "livekit" | "import";

/** Privacy classification */
export type PrivacyLevel = "normal" | "private" | "sensitive";

/** Category of extracted memory item */
export type MemoryItemType =
  | "fact"
  | "preference"
  | "task_hint"
  | "decision"
  | "idea"
  | "promise"
  | "reminder"
  | "summary";

/** Importance level */
export type MemoryItemImportance = "low" | "medium" | "high";

/** Review status for AI-generated items */
export type MemoryItemReviewStatus =
  | "auto_saved"
  | "needs_review"
  | "approved"
  | "rejected";

/** Type of detected entity */
export type EntityType =
  | "person"
  | "project"
  | "company"
  | "date"
  | "topic"
  | "file"
  | "url"
  | "location"
  | "product";

/** Task lifecycle status */
export type TaskStatus = "inbox" | "todo" | "doing" | "done" | "dismissed";

/** Whether a task was manually created or AI-extracted */
export type ExtractionStatus =
  | "manual"
  | "extracted_pending"
  | "extracted_approved"
  | "rejected";

/** Decision lifecycle status */
export type DecisionStatus = "active" | "changed" | "deprecated";

/** Direction type for memory relations */
export type FromToType =
  | "source"
  | "memory_item"
  | "person"
  | "task"
  | "project"
  | "decision";

/** Type of relation between memory nodes */
export type RelationType =
  | "mentions"
  | "supports"
  | "contradicts"
  | "follows_up"
  | "same_topic"
  | "depends_on";

/** Chat thread interaction mode */
export type ChatThreadMode =
  | "recall"
  | "summarize"
  | "plan"
  | "draft"
  | "task"
  | "project";

/** Role of a chat participant */
export type ChatMessageRole = "user" | "assistant" | "tool" | "system";

/** Supported connector providers */
export type ConnectorProvider =
  | "gmail"
  | "google_calendar"
  | "notion"
  | "github"
  | "slack"
  | "drive"
  | "custom";

/** Connector account status */
export type ConnectorAccountStatus =
  | "connected"
  | "disconnected"
  | "expired"
  | "error"
  | "paused";

/** Background job status */
export type JobStatus = "queued" | "running" | "success" | "failed" | "cancelled";

/** File upload status */
export type UploadStatus = "pending" | "uploaded" | "failed";

/** Transcript provider */
export type TranscriptProvider = "deepgram" | "assemblyai" | "openai" | "manual";

/** Transcript processing status */
export type TranscriptStatus = "processing" | "ready" | "failed";

/** Document content format */
export type DocumentFormat =
  | "blocknote_json"
  | "markdown"
  | "html"
  | "plain_text"
  | "transcript"
  | "parsed_pdf";

/** Workspace type */
export type WorkspaceType = "personal" | "team";

/** Workspace member role */
export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

/** Project status */
export type ProjectStatus = "active" | "paused" | "archived";

/** Project link relation type */
export type ProjectLinkRelationType =
  | "mentioned_in"
  | "belongs_to"
  | "decision_for"
  | "task_for";

/** Voice session mode */
export type VoiceSessionMode =
  | "talk"
  | "debrief"
  | "plan"
  | "meeting"
  | "pitch_practice";

/** Voice session status */
export type VoiceSessionStatus = "active" | "ended" | "failed";

/** Connector sync run status */
export type ConnectorSyncRunStatus =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "partial";

// ---------------------------------------------------------------------------
// Table Row Types
// ---------------------------------------------------------------------------

/** Source — the anchor table for trust. Anything Debo can remember from. */
export interface Source {
  id: string;
  user_id: string;
  workspace_id: string;
  type: SourceType;
  title: string;
  description: string | null;
  status: SourceStatus;
  origin: SourceOrigin;
  original_url: string | null;
  connector_account_id: string | null;
  external_id: string | null;
  source_date: string | null;
  language: string | null;
  privacy_level: PrivacyLevel;
  plain_text: string | null;
  summary: string | null;
  metadata_json: Record<string, unknown> | null;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Source file — R2 object reference for audio, video, PDFs, images */
export interface SourceFile {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string;
  r2_bucket: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  duration_seconds: number | null;
  checksum_sha256: string | null;
  upload_status: UploadStatus;
  created_at: string;
}

/** Document — BlockNote/journal content and parsed documents */
export interface Document {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string;
  format: DocumentFormat;
  content_json: Record<string, unknown> | null;
  content_text: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

/** Transcript — transcribed audio/video with segments */
export interface Transcript {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string;
  provider: TranscriptProvider;
  text: string;
  segments_json: TranscriptSegment[] | null;
  speakers_json: Record<string, unknown> | null;
  language: string | null;
  confidence: number | null;
  status: TranscriptStatus;
  created_at: string;
  updated_at: string;
}

/** Individual transcript segment with timing */
export interface TranscriptSegment {
  start_time: number;
  end_time: number;
  speaker: string | null;
  text: string;
  confidence: number | null;
}

/** Memory chunk — a searchable piece of a source */
export interface MemoryChunk {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string;
  document_id: string | null;
  transcript_id: string | null;
  chunk_index: number;
  text: string;
  token_count: number;
  vector_id: string | null;
  start_offset: number | null;
  end_offset: number | null;
  page_number: number | null;
  start_time: number | null;
  end_time: number | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

/** Memory item — a distilled, useful fact extracted from sources */
export interface MemoryItem {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string;
  type: MemoryItemType;
  title: string;
  content: string;
  confidence: number;
  importance: MemoryItemImportance;
  review_status: MemoryItemReviewStatus;
  valid_from: string | null;
  valid_until: string | null;
  model: string | null;
  prompt_version: string | null;
  created_at: string;
  updated_at: string;
}

/** Entity — a detected object (person, project, company, etc.) */
export interface Entity {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string;
  type: EntityType;
  value: string;
  normalized_value: string | null;
  confidence: number;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

/** Person — a known individual in the user's memory */
export interface Person {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  aliases_json: string[] | null;
  relationship: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
  last_mentioned_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Person mention — link between a person and a source/memory item */
export interface PersonMention {
  id: string;
  user_id: string;
  workspace_id: string;
  person_id: string;
  source_id: string;
  memory_item_id: string | null;
  context_text: string | null;
  created_at: string;
}

/** Project — a tracked initiative or area of work */
export interface Project {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string | null;
  created_at: string;
  updated_at: string;
}

/** Project link — relation between a project and source/memory item */
export interface ProjectLink {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id: string;
  source_id: string;
  memory_item_id: string | null;
  relation_type: ProjectLinkRelationType;
  created_at: string;
}

/** Task — manually created or extracted from a source */
export interface Task {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_at: string | null;
  related_person_id: string | null;
  project_id: string | null;
  confidence: number | null;
  extraction_status: ExtractionStatus;
  created_at: string;
  updated_at: string;
}

/** Decision — a useful product/work/life conclusion */
export interface Decision {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string | null;
  project_id: string | null;
  title: string;
  decision_text: string;
  reason: string | null;
  status: DecisionStatus;
  confidence: number | null;
  decided_at: string | null;
  created_at: string;
}

/** Memory relation — edge in the memory graph */
export interface MemoryRelation {
  id: string;
  user_id: string;
  workspace_id: string;
  from_type: FromToType;
  from_id: string;
  to_type: FromToType;
  to_id: string;
  relation_type: RelationType;
  confidence: number;
  created_at: string;
}

/** Chat thread — a conversation session */
export interface ChatThread {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string | null;
  mode: ChatThreadMode;
  created_at: string;
  updated_at: string;
}

/** Chat message — a single message in a thread */
export interface ChatMessage {
  id: string;
  user_id: string;
  workspace_id: string;
  thread_id: string;
  role: ChatMessageRole;
  content: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

/** Answer citation — proof for an AI-generated answer */
export interface AnswerCitation {
  id: string;
  user_id: string;
  workspace_id: string;
  message_id: string;
  source_id: string;
  chunk_id: string | null;
  quote_text: string;
  page_number: number | null;
  start_time: number | null;
  end_time: number | null;
  confidence: number;
  created_at: string;
}

/** Connector account — linked external service */
export interface ConnectorAccount {
  id: string;
  user_id: string;
  workspace_id: string;
  provider: ConnectorProvider;
  status: ConnectorAccountStatus;
  external_account_id: string | null;
  scopes_json: string[] | null;
  sync_rules_json: Record<string, unknown> | null;
  last_synced_at: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Connector sync run — a single sync execution */
export interface ConnectorSyncRun {
  id: string;
  user_id: string;
  workspace_id: string;
  connector_account_id: string;
  status: ConnectorSyncRunStatus;
  started_at: string | null;
  finished_at: string | null;
  imported_count: number;
  error: string | null;
  metadata_json: Record<string, unknown> | null;
}

/** Job — background processing task */
export interface Job {
  id: string;
  user_id: string;
  workspace_id: string;
  source_id: string | null;
  type: string;
  status: JobStatus;
  provider_job_id: string | null;
  attempts: number;
  error: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Audit log — record of a sensitive action */
export interface AuditLog {
  id: string;
  user_id: string;
  workspace_id: string;
  action: string;
  target_type: string;
  target_id: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

/** Voice session — a LiveKit realtime voice call */
export interface VoiceSession {
  id: string;
  user_id: string;
  workspace_id: string;
  livekit_room_name: string;
  source_id: string | null;
  mode: VoiceSessionMode;
  status: VoiceSessionStatus;
  started_at: string;
  ended_at: string | null;
  metadata_json: Record<string, unknown> | null;
}

/** Workspace */
export interface Workspace {
  id: string;
  owner_user_id: string;
  name: string;
  type: WorkspaceType;
  created_at: string;
  updated_at: string;
}

/** Workspace member */
export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  created_at: string;
}

/** User profile */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
