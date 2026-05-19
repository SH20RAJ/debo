"use client";

import {
  ArrowLeft,
  BookOpen,
  Mic,
  FileText,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Clock,
  AlertCircle,
  Loader2,
  Play,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  User,
  Calendar,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SourceDetailPageProps {
  sourceId: string;
}

// Mock data for different source types
const MOCK_SOURCES: Record<
  string,
  {
    id: string;
    type: "journal" | "voice" | "file" | "link" | "meeting" | "task";
    title: string;
    date: string;
    status: "ready" | "processing" | "needs_review";
    summary: string;
    content: string;
    people: string[];
    tasks: { title: string; done: boolean }[];
    facts: string[];
    relatedSources: { id: string; title: string; type: string; date: string }[];
    transcript?: { time: string; speaker: string; text: string }[];
  }
> = {
  "1": {
    id: "1",
    type: "journal",
    title: "Product Ideas",
    date: "May 18, 2026",
    status: "ready",
    summary:
      "Three features that could differentiate us from competitors: voice-first capture, source-backed answers, and private memory graph.",
    content:
      "Three features that could differentiate us from competitors:\n\n1. Voice-first capture — let users record thoughts hands-free\n2. Source-backed answers — every AI response shows where it came from\n3. Private memory graph — users control what gets remembered\n\nWe should prioritize the voice capture flow. It's the most defensible moat and hardest to copy.\n\nNeed to research how Reflect and Mem handle voice. Also worth looking at Granola for meeting transcription UX.",
    people: ["Shaswat"],
    tasks: [
      { title: "Prototype voice capture flow", done: false },
      { title: "Research competitor voice features", done: false },
    ],
    facts: [
      "Voice-first capture is the top priority",
      "Source-backed answers are a key differentiator",
      "Private memory graph gives users control",
    ],
    relatedSources: [
      { id: "5", title: "Reflect App - Editor Deep Dive", type: "link", date: "May 15" },
      { id: "9", title: "Competitive Analysis 2026", type: "file", date: "May 10" },
    ],
  },
  "2": {
    id: "2",
    type: "voice",
    title: "Marketing Sync Follow-up",
    date: "May 17, 2026",
    status: "ready",
    summary:
      "You discussed Q4 allocation and promised Raj a finalized draft by Friday before the board meeting.",
    content: "Voice recording — 4 min 32 sec",
    people: ["Raj", "Sarah"],
    tasks: [
      { title: "Send Q4 budget allocation to Raj by Friday", done: false },
      { title: "Prepare board meeting slides", done: false },
    ],
    facts: [
      "Promised Raj Q4 budget by Friday",
      "Board meeting is next Monday",
      "Q4 allocation needs department-level breakdown",
    ],
    relatedSources: [
      { id: "3", title: "Q4 Allocation Draft", type: "file", date: "May 16" },
      { id: "4", title: "Sprint Planning - Week 20", type: "meeting", date: "May 15" },
    ],
    transcript: [
      { time: "0:00", speaker: "You", text: "Hey Raj, wanted to follow up on the Q4 budget discussion." },
      { time: "0:08", speaker: "Raj", text: "Yeah, I've been waiting on the department-level breakdown." },
      { time: "0:15", speaker: "You", text: "I'll have the finalized allocation ready by Friday. The board meeting is Monday, right?" },
      { time: "0:22", speaker: "Raj", text: "Correct. We need it before then so we can review over the weekend." },
      { time: "0:30", speaker: "You", text: "Got it. I'll send it by end of day Friday at the latest." },
      { time: "0:38", speaker: "Raj", text: "Perfect. Also, can you include the projected spend for each department?" },
      { time: "0:45", speaker: "You", text: "Already on it. I'm pulling the data from the last three quarters to show trends." },
      { time: "0:52", speaker: "Raj", text: "Great. That will help the board see the bigger picture." },
      { time: "1:00", speaker: "You", text: "I'll also add a summary slide with key highlights and risks." },
      { time: "1:08", speaker: "Raj", text: "Sounds good. Let me know if you need any data from my end." },
    ],
  },
  "3": {
    id: "3",
    type: "file",
    title: "Q4 Allocation Draft",
    date: "May 16, 2026",
    status: "needs_review",
    summary:
      "Budget allocation document with department-level breakdowns and projected spend for Q4.",
    content: "PDF Document — 12 pages\n\nDepartment allocations:\n- Engineering: 45%\n- Marketing: 20%\n- Sales: 15%\n- Operations: 10%\n- Research: 10%\n\nTotal Q4 budget: $2.4M\nProjected YoY growth: 18%",
    people: ["Raj", "Sarah"],
    tasks: [],
    facts: [
      "Total Q4 budget is $2.4M",
      "Engineering gets the largest allocation at 45%",
      "Projected 18% year-over-year growth",
    ],
    relatedSources: [
      { id: "2", title: "Marketing Sync Follow-up", type: "voice", date: "May 17" },
    ],
  },
};

const TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  journal: BookOpen,
  voice: Mic,
  file: FileText,
  link: LinkIcon,
  meeting: Users,
  task: CheckSquare,
};

const TYPE_LABELS: Record<string, string> = {
  journal: "Journal",
  voice: "Voice note",
  file: "File",
  link: "Link",
  meeting: "Meeting",
  task: "Task",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ready: {
    label: "Ready",
    color: "text-green-600 bg-green-500/10 border-green-500/20",
    icon: CheckSquare,
  },
  processing: {
    label: "Processing",
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    icon: Loader2,
  },
  needs_review: {
    label: "Needs review",
    color: "text-orange-600 bg-orange-500/10 border-orange-500/20",
    icon: AlertCircle,
  },
};

export function SourceDetailPage({ sourceId }: SourceDetailPageProps) {
  const source = MOCK_SOURCES[sourceId] ?? MOCK_SOURCES["1"];
  const TypeIcon = TYPE_ICONS[source.type] ?? FileText;
  const statusCfg = STATUS_CONFIG[source.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-4">
        <Link
          href="/dashboard/library"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Library
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <TypeIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">
                  {source.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TypeIcon className="w-3.5 h-3.5" />
                    {TYPE_LABELS[source.type]}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {source.date}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border",
                      statusCfg.color
                    )}
                  >
                    <StatusIcon
                      className={cn(
                        "w-3 h-3",
                        source.status === "processing" && "animate-spin"
                      )}
                    />
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                <MessageSquare className="w-3.5 h-3.5" />
                Ask about this
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-foreground rounded-lg border border-border hover:border-primary/20 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Create task
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 hover:bg-destructive/20 transition-colors ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Summary */}
          <Section title="Summary">
            <p className="text-sm text-foreground leading-relaxed">
              {source.summary}
            </p>
          </Section>

          {/* Content / Transcript */}
          <Section title={source.type === "voice" ? "Transcript" : "Content"}>
            {source.transcript ? (
              <TranscriptViewer segments={source.transcript} />
            ) : (
              <div className="p-4 rounded-xl bg-secondary/60 border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {source.content}
                </pre>
              </div>
            )}
          </Section>

          {/* Voice player placeholder */}
          {source.type === "voice" && (
            <Section title="Audio">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/60 border border-border">
                <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                </button>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      0:00
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      4:32
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Extracted Memories */}
          <Section title="Extracted memories">
            <div className="space-y-4">
              {/* People */}
              {source.people.length > 0 && (
                <SubSection icon={User} title="People">
                  <div className="flex flex-wrap gap-2">
                    {source.people.map((person) => (
                      <span
                        key={person}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-secondary rounded-full text-foreground border border-border"
                      >
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                          {person[0]}
                        </div>
                        {person}
                      </span>
                    ))}
                  </div>
                </SubSection>
              )}

              {/* Tasks */}
              {source.tasks.length > 0 && (
                <SubSection icon={CheckSquare} title="Tasks">
                  <div className="space-y-2">
                    {source.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border shrink-0",
                            task.done
                              ? "bg-primary border-primary"
                              : "border-border"
                          )}
                        />
                        <span
                          className={cn(
                            task.done && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </SubSection>
              )}

              {/* Facts */}
              {source.facts.length > 0 && (
                <SubSection icon={Lightbulb} title="Key facts">
                  <div className="space-y-1.5">
                    {source.facts.map((fact, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {fact}
                      </div>
                    ))}
                  </div>
                </SubSection>
              )}
            </div>
          </Section>

          {/* Related Sources */}
          {source.relatedSources.length > 0 && (
            <Section title="Related sources">
              <div className="space-y-2">
                {source.relatedSources.map((related) => {
                  const RelIcon = TYPE_ICONS[related.type] ?? FileText;
                  return (
                    <Link
                      key={related.id}
                      href={`/dashboard/library/${related.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <RelIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {related.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {related.type} &middot; {related.date}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper components ---

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SubSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TranscriptViewer({
  segments,
}: {
  segments: { time: string; speaker: string; text: string }[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex gap-3 px-4 py-2.5 hover:bg-secondary/60 transition-colors"
          >
            <span className="text-[11px] text-muted-foreground font-mono w-10 shrink-0 pt-0.5">
              {seg.time}
            </span>
            <div className="flex-1">
              <span className="text-xs font-semibold text-foreground">
                {seg.speaker}
              </span>
              <p className="text-sm text-foreground mt-0.5">{seg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
