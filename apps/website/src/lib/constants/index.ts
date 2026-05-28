import type { SourceType, SourceStatus } from "../types";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  journal: "Journal",
  voice: "Voice note",
  file: "File",
  link: "Link",
  meeting: "Meeting",
  email: "Email",
  calendar: "Calendar",
  task: "Task",
};

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  needs_review: "Needs review",
  failed: "Failed",
};

export const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  journal: "text-violet-600 dark:text-violet-400",
  voice: "text-indigo-600 dark:text-indigo-400",
  file: "text-sky-600 dark:text-sky-400",
  link: "text-teal-600 dark:text-teal-400",
  meeting: "text-amber-600 dark:text-amber-400",
  email: "text-rose-600 dark:text-rose-400",
  calendar: "text-emerald-600 dark:text-emerald-400",
  task: "text-slate-600 dark:text-slate-400",
};

export const SOURCE_TYPE_BG: Record<SourceType, string> = {
  journal: "bg-violet-100 dark:bg-violet-950/40",
  voice: "bg-indigo-100 dark:bg-indigo-950/40",
  file: "bg-sky-100 dark:bg-sky-950/40",
  link: "bg-teal-100 dark:bg-teal-950/40",
  meeting: "bg-amber-100 dark:bg-amber-950/40",
  email: "bg-rose-100 dark:bg-rose-950/40",
  calendar: "bg-emerald-100 dark:bg-emerald-950/40",
  task: "bg-slate-100 dark:bg-slate-950/40",
};

export const SOURCE_TYPE_ICONS: Record<SourceType, string> = {
  journal: "notebook-pen",
  voice: "mic",
  file: "file-text",
  link: "globe",
  meeting: "users",
  email: "mail",
  calendar: "calendar",
  task: "check-circle",
};

export const CONFIDENCE_LABELS: Record<
  "strong" | "partial" | "weak",
  string
> = {
  strong: "Strong source match",
  partial: "Partial source match",
  weak: "Needs more context",
};

export const CONFIDENCE_COLORS: Record<
  "strong" | "partial" | "weak",
  string
> = {
  strong: "text-emerald-700 dark:text-emerald-400",
  partial: "text-amber-700 dark:text-amber-400",
  weak: "text-slate-500 dark:text-slate-400",
};

export const TASK_STATUS_LABELS: Record<
  "todo" | "doing" | "done" | "dismissed",
  string
> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
  dismissed: "Dismissed",
};

export const CONNECTOR_STATUS_LABELS: Record<
  "not_connected" | "connected" | "syncing" | "needs_attention",
  string
> = {
  not_connected: "Not connected",
  connected: "Connected",
  syncing: "Syncing",
  needs_attention: "Needs attention",
};
