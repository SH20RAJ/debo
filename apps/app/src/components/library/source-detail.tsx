"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Mic,
  FileText,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Calendar,
  AlertCircle,
  Loader2,
  Play,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  User,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MEMORIES } from "@/lib/mock";
import type { MemorySource, SourceType, SourceStatus } from "@/lib/types";

interface SourceDetailPageProps {
  sourceId: string;
}

// Extended mock detail data (content, tasks, facts, transcript, related)
const DETAIL_EXTRA: Record<
  string,
  {
    content: string;
    tasks: { title: string; done: boolean }[];
    facts: string[];
    relatedSources: { id: string; title: string; type: string; date: string }[];
    transcript?: { time: string; speaker: string; text: string }[];
  }
> = {
  "mem-001": {
    content: "Voice recording -- 4 min 32 sec",
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
      { id: "mem-002", title: "Q4 Allocation Draft", type: "file", date: "May 15" },
      { id: "mem-004", title: "Customer Call with Sarah", type: "meeting", date: "May 16" },
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
  "mem-002": {
    content: "PDF Document -- 12 pages\n\nDepartment allocations:\n- Engineering: 45%\n- Marketing: 20%\n- Sales: 15%\n- Operations: 10%\n- Research: 10%\n\nTotal Q4 budget: $2.4M\nProjected YoY growth: 18%",
    tasks: [],
    facts: [
      "Total Q4 budget is $2.4M",
      "Engineering gets the largest allocation at 45%",
      "Projected 18% year-over-year growth",
    ],
    relatedSources: [
      { id: "mem-001", title: "Marketing Sync Follow-up", type: "voice", date: "May 17" },
    ],
  },
  "mem-003": {
    content: "Three features that could differentiate us from competitors:\n\n1. Voice-first capture -- let users record thoughts hands-free\n2. Source-backed answers -- every AI response shows where it came from\n3. Private memory graph -- users control what gets remembered\n\nWe should prioritize the voice capture flow. It's the most defensible moat and hardest to copy.",
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
      { id: "mem-008", title: "Research on Qdrant Performance", type: "link", date: "May 11" },
    ],
  },
};

const TYPE_ICONS: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  journal: BookOpen,
  voice: Mic,
  file: FileText,
  link: LinkIcon,
  meeting: Users,
  task: CheckSquare,
  email: FileText,
  calendar: Calendar,
};

const TYPE_LABELS: Record<SourceType, string> = {
  journal: "Journal",
  voice: "Voice note",
  file: "File",
  link: "Link",
  meeting: "Meeting",
  task: "Task",
  email: "Email",
  calendar: "Calendar",
};

const STATUS_CONFIG: Record<
  SourceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  ready: { label: "Ready", variant: "default", icon: CheckSquare },
  processing: { label: "Processing", variant: "secondary", icon: Loader2 },
  needs_review: { label: "Needs review", variant: "outline", icon: AlertCircle },
  failed: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

export function SourceDetailPage({ sourceId }: SourceDetailPageProps) {
  const source = MEMORIES.find((m) => m.id === sourceId) ?? MEMORIES[0];
  const extra = DETAIL_EXTRA[source.id] ?? DETAIL_EXTRA["mem-003"];
  const TypeIcon = TYPE_ICONS[source.type] ?? FileText;
  const statusCfg = STATUS_CONFIG[source.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/dashboard/library">
            <ArrowLeft className="size-4" />
            Library
          </Link>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <TypeIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">
                  {source.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1.5">
                    <TypeIcon className="size-3.5" />
                    {TYPE_LABELS[source.type]}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {new Date(source.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Badge variant={statusCfg.variant} className="gap-1">
                    <StatusIcon
                      className={cn("size-3", source.status === "processing" && "animate-spin")}
                    />
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5">
                <MessageSquare className="size-3.5" />
                Ask about this
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Create task
              </Button>
              <Button variant="destructive" size="sm" className="gap-1.5 ml-auto">
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Summary */}
          <Section title="Summary">
            <p className="text-sm text-foreground leading-relaxed">
              {source.summary}
            </p>
          </Section>

          {/* Content / Transcript */}
          <Section title={source.type === "voice" ? "Transcript" : "Content"}>
            {extra.transcript ? (
              <Tabs defaultValue="transcript">
                <TabsList variant="line">
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                <TabsContent value="transcript">
                  <TranscriptViewer segments={extra.transcript} />
                </TabsContent>
                <TabsContent value="summary">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-foreground leading-relaxed">
                        {source.summary}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {extra.content}
                  </pre>
                </CardContent>
              </Card>
            )}
          </Section>

          {/* Voice player placeholder */}
          {source.type === "voice" && (
            <Section title="Audio">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Button size="icon" className="size-10 rounded-full shrink-0">
                      <Play className="size-4 ml-0.5" />
                    </Button>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-0 bg-primary rounded-full" />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[11px] text-muted-foreground">0:00</span>
                        <span className="text-[11px] text-muted-foreground">4:32</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>
          )}

          {/* Extracted Memories */}
          <Section title="Extracted memories">
            <div className="space-y-6">
              {/* People */}
              {source.people.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-foreground">People</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {source.people.map((person) => (
                      <Badge key={person} variant="secondary" className="gap-1.5 py-1 px-2.5">
                        <Avatar size="sm" className="size-4">
                          <AvatarFallback className="text-[9px]">{person[0]}</AvatarFallback>
                        </Avatar>
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {extra.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-foreground">Tasks</h3>
                  </div>
                  <div className="space-y-2">
                    {extra.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <div
                          className={cn(
                            "size-4 rounded border shrink-0",
                            task.done ? "bg-primary border-primary" : "border-border"
                          )}
                        />
                        <span className={cn(task.done && "line-through text-muted-foreground")}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facts */}
              {extra.facts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-foreground">Key facts</h3>
                  </div>
                  <div className="space-y-1.5">
                    {extra.facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {fact}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Related Sources */}
          {extra.relatedSources.length > 0 && (
            <Section title="Related sources">
              <div className="space-y-2">
                {extra.relatedSources.map((related) => {
                  const RelIcon = TYPE_ICONS[related.type as SourceType] ?? FileText;
                  return (
                    <Link
                      key={related.id}
                      href={`/dashboard/library/${related.id}`}
                      className="block"
                    >
                      <Card className="flex-row items-center gap-3 p-3 py-3 hover:border-primary/20 hover:shadow-md transition-all">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <RelIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {related.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {related.type} &middot; {related.date}
                          </p>
                        </div>
                        <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Helper components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function TranscriptViewer({
  segments,
}: {
  segments: { time: string; speaker: string; text: string }[];
}) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="divide-y divide-border">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors"
          >
            <span className="text-[11px] text-muted-foreground font-mono w-10 shrink-0 pt-0.5">
              {seg.time}
            </span>
            <div className="flex-1">
              <span className="text-xs font-semibold text-foreground">{seg.speaker}</span>
              <p className="text-sm text-foreground mt-0.5">{seg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
