export type SourceType =
  | "journal"
  | "voice"
  | "file"
  | "link"
  | "meeting"
  | "email"
  | "calendar"
  | "task";

export type SourceStatus =
  | "ready"
  | "processing"
  | "needs_review"
  | "failed";

export type MemorySource = {
  id: string;
  type: SourceType;
  title: string;
  summary: string;
  createdAt: string;
  status: SourceStatus;
  people: string[];
  projects: string[];
  taskCount: number;
  sourceLabel: string;
};

export type DeboTask = {
  id: string;
  title: string;
  status: "inbox" | "todo" | "doing" | "done" | "dismissed";
  dueDate?: string;
  relatedPerson?: string;
  sourceId?: string;
  confidence: "strong" | "partial" | "weak";
  extractionStatus?: "manual" | "extracted_pending" | "extracted_approved" | "rejected";
};

export type PersonMemory = {
  id: string;
  name: string;
  context: string;
  lastMentioned: string;
  openTaskCount: number;
  memoryCount: number;
  avatar?: string;
};

export type ProjectMemory = {
  id: string;
  name: string;
  description: string;
  pinnedMemories: number;
  openTasks: number;
  people: string[];
  extractionStatus?: "manual" | "extracted_pending" | "extracted_approved" | "rejected";
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Citation[];
  suggestedActions?: string[];
};

export type Citation = {
  id: string;
  sourceType: SourceType;
  title: string;
  excerpt: string;
  date: string;
  confidence: "strong" | "partial" | "weak";
};

export type Connector = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  status: "not_connected" | "connected" | "syncing" | "needs_attention" | "paused";
  permissions: string[];
  permission?: string;
  category: string;
};

export type VoiceSession = {
  id: string;
  title: string;
  duration: number;
  transcript?: string;
  createdAt: string;
  status: "recording" | "transcribing" | "ready";
};

export type TimelineItem = {
  id: string;
  type: string;
  title: string;
  summary: string;
  date: string;
  people: string[];
  sourceId?: string;
};

export type OpenLoop = {
  id: string;
  text: string;
  source: string;
  sourceType: SourceType;
  actions: string[];
};
