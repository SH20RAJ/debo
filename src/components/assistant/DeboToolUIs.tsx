"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  BookOpen,
  Brain,
  Search,
  Clock,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type ToolResultRecord = Record<string, unknown>;

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function recordValue(value: unknown): ToolResultRecord {
  return value && typeof value === "object" ? value as ToolResultRecord : {};
}

// ── Journal Created ──
export const CreateJournalToolUI = makeAssistantToolUI({
  toolName: "createJournalTool",
  render: ({ args, result }) => (
    <div className="my-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border-b border-border/30">
        <BookOpen className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Journal Saved
        </span>
        {result ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground ml-auto animate-spin" />
        )}
      </div>
      <div className="px-4 py-3 space-y-1">
        {args?.title && (
          <p className="text-sm font-medium text-foreground">{String(args.title)}</p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-3">
          {String(args?.content || "").slice(0, 200)}
          {String(args?.content || "").length > 200 ? "…" : ""}
        </p>
      </div>
    </div>
  ),
});

// ── Memory Added ──
export const AddMemoryToolUI = makeAssistantToolUI({
  toolName: "addMemoryTool",
  render: ({ args, result }) => (
    <div className="my-2 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-violet-500/10 border border-violet-500/20">
      <Brain className="h-4 w-4 text-violet-500" />
      <span className="text-sm text-violet-700 dark:text-violet-300">
        {String(args?.fact || "").slice(0, 100)}
        {String(args?.fact || "").length > 100 ? "…" : ""}
      </span>
      {result ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0" />
      )}
    </div>
  ),
});

// ── Timeline Fetched ──
export const GetTimelineToolUI = makeAssistantToolUI({
  toolName: "getTimelineTool",
  render: ({ args, result: _r }) => {
    const result = _r as unknown;
    return (
    <div className="my-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border-b border-border/30">
        <Clock className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Timeline — {String(args?.grouping || "daily")}
        </span>
        {result ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 ml-auto" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground ml-auto animate-spin" />
        )}
      </div>
      {Boolean(result) && (
        <div className="px-4 py-3 text-xs text-muted-foreground">
          {Array.isArray(result) ? `${result.length} events loaded` : "Timeline loaded"}
        </div>
      )}
    </div>
    );
  },
});

// ── Search Results ──
export const SearchJournalsToolUI = makeAssistantToolUI({
  toolName: "searchJournalsTool",
  render: ({ args, result: _r }) => {
    const result = _r as unknown;
    const results = Array.isArray(result) ? result as ToolResultRecord[] : [];
    return (
    <div className="my-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-border/30">
        <Search className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Searching: &quot;{String(args?.query || "")}&quot;
        </span>
        {result ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 ml-auto" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground ml-auto animate-spin" />
        )}
      </div>
      {results.length > 0 && (
        <div className="px-4 py-2 space-y-1.5">
          {results.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <p className="text-xs text-muted-foreground line-clamp-1">
                {textValue(r.content) || textValue(r.title) || JSON.stringify(r).slice(0, 80)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    );
  },
});

// ── Memories Retrieved ──
export const GetMemoriesToolUI = makeAssistantToolUI({
  toolName: "getMemoriesTool",
  render: ({ result: _r }) => {
    const result = _r as unknown;
    const results = Array.isArray(result) ? result as ToolResultRecord[] : [];
    return (
    <div className="my-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/10 border-b border-border/30">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
          Memories
        </span>
        {result ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 ml-auto" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground ml-auto animate-spin" />
        )}
      </div>
      {results.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5">
          {results.slice(0, 5).map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
            >
              {textValue(m.content).slice(0, 40) || "Memory"}
            </span>
          ))}
        </div>
      )}
    </div>
    );
  },
});

// ── Pattern Analysis ──
export const DetectPatternsToolUI = makeAssistantToolUI({
  toolName: "queryGraphTool",
  render: ({ result: rawResult }) => {
    const result = recordValue(rawResult);
    const sentiment = textValue(result.sentiment);
    const suggestedAction = textValue(result.suggestedAction);
    const sentimentColors: Record<string, string> = {
      positive: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      negative: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      neutral: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      growth: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    };

    return (
      <div className="my-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border-b border-border/30">
          <TrendingUp className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Pattern Analysis
          </span>
          {result ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 ml-auto" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground ml-auto animate-spin" />
          )}
        </div>
        {Boolean(rawResult) && (
          <div className="px-4 py-3 space-y-2">
            <p className="text-sm text-foreground">{textValue(result.insight)}</p>
            {sentiment && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  sentimentColors[sentiment] || sentimentColors.neutral
                }`}
              >
                {sentiment}
              </span>
            )}
            {suggestedAction && (
              <p className="text-xs text-muted-foreground italic">
                💡 {suggestedAction}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
});

// ── Sub-agent Tool UIs (for the orchestrator) ──
export const AgentCompanionToolUI = makeAssistantToolUI({
  toolName: "agent-companion",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Debo Companion is thinking…</span>
        </div>
      );
    }
    return null; // The result text is shown by the assistant message itself
  },
});

export const AgentLibrarianToolUI = makeAssistantToolUI({
  toolName: "agent-librarian",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Debo Librarian is searching…</span>
        </div>
      );
    }
    return null;
  },
});

export const AgentAnalystToolUI = makeAssistantToolUI({
  toolName: "agent-analyst",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Debo Analyst is analyzing…</span>
        </div>
      );
    }
    return null;
  },
});

/**
 * Mount this component once in the layout to register all tool UIs globally.
 * It renders nothing visible — it only registers tool UI renderers.
 */
export function DeboToolUIs() {
  return (
    <>
      <CreateJournalToolUI />
      <AddMemoryToolUI />
      <GetTimelineToolUI />
      <SearchJournalsToolUI />
      <GetMemoriesToolUI />
      <DetectPatternsToolUI />
      <AgentCompanionToolUI />
      <AgentLibrarianToolUI />
      <AgentAnalystToolUI />
    </>
  );
}
