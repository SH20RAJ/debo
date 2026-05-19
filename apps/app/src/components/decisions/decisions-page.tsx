"use client";

import { useState } from "react";
import { Diamond, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DecisionStatus = "active" | "changed" | "deprecated";

interface Decision {
  id: string;
  title: string;
  decisionText: string;
  reason?: string;
  status: DecisionStatus;
  source: string;
  decidedAt: string;
  confidence: number;
}

const mockDecisions: Decision[] = [
  {
    id: "1",
    title: "Use R2 for storage",
    decisionText: "Cloudflare R2 will be the primary storage solution for all files, audio, and video content.",
    reason: "Cheaper for files/audio/video, no egress fees",
    status: "active",
    source: "backend.md",
    decidedAt: "2025-12-15",
    confidence: 95,
  },
  {
    id: "2",
    title: "Use BlockNote for editor",
    decisionText: "BlockNote will be the rich text editor component for the journal and document features.",
    reason: "Faster than building on raw Tiptap",
    status: "active",
    source: "techstack.md",
    decidedAt: "2025-12-10",
    confidence: 90,
  },
  {
    id: "3",
    title: "Use Mastra for agent backend",
    decisionText: "Mastra framework will orchestrate all AI agents, tools, and workflows in the backend.",
    reason: "TypeScript-first, fits Debo better than raw AI SDK",
    status: "active",
    source: "techstack.md",
    decidedAt: "2025-12-08",
    confidence: 92,
  },
  {
    id: "4",
    title: "Use Better Auth instead of Clerk",
    decisionText: "Better Auth replaced Clerk as the authentication provider for the application.",
    reason: "Privacy/memory product needs more control",
    status: "changed",
    source: "techstack.md",
    decidedAt: "2025-11-28",
    confidence: 88,
  },
  {
    id: "5",
    title: "Launch with Neon Postgres only",
    decisionText: "Initial launch will use Neon Postgres as the sole database, deferring specialized vector stores.",
    reason: "Start simple, add Turbopuffer later for scale",
    status: "active",
    source: "architecture meeting",
    decidedAt: "2025-11-20",
    confidence: 85,
  },
  {
    id: "6",
    title: "Use LiveKit for voice",
    decisionText: "LiveKit will handle all realtime voice AI interactions and WebRTC connections.",
    reason: "Handles realtime voice AI parts well",
    status: "active",
    source: "techstack.md",
    decidedAt: "2025-11-15",
    confidence: 91,
  },
  {
    id: "7",
    title: "Single-user workspace first",
    decisionText: "Launch focuses on single-user workspaces with team features deferred to post-launch.",
    reason: "Ship fast, add teams later",
    status: "active",
    source: "backend.md",
    decidedAt: "2025-11-10",
    confidence: 87,
  },
  {
    id: "8",
    title: "Store BlockNote JSON + plain text mirror",
    decisionText: "Documents stored as BlockNote JSON for editing with a parallel plain text column for search and embeddings.",
    reason: "JSON for editing, text for search/embeddings",
    status: "active",
    source: "techstack.md",
    decidedAt: "2025-11-05",
    confidence: 93,
  },
];

const statusConfig: Record<DecisionStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-700 border-green-200" },
  changed: { label: "Changed", className: "bg-amber-100 text-amber-700 border-amber-200" },
  deprecated: { label: "Deprecated", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

function getMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupByMonth(decisions: Decision[]): Record<string, Decision[]> {
  return decisions.reduce((acc, decision) => {
    const month = getMonthYear(decision.decidedAt);
    if (!acc[month]) acc[month] = [];
    acc[month].push(decision);
    return acc;
  }, {} as Record<string, Decision[]>);
}

export function DecisionsPage() {
  const [filter, setFilter] = useState<DecisionStatus | "all">("all");
  const [decisions, setDecisions] = useState<Decision[]>(mockDecisions);

  const filteredDecisions = filter === "all" 
    ? decisions 
    : decisions.filter((d) => d.status === filter);

  const grouped = groupByMonth(filteredDecisions);
  const months = Object.keys(grouped);

  const updateStatus = (id: string, newStatus: DecisionStatus) => {
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Decision Log
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? "s" : ""} logged
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "changed", "deprecated"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-xl",
              filter === status && "shadow-[0_3px_0_var(--border)]"
            )}
          >
            {status === "all" ? "All" : statusConfig[status].label}
          </Button>
        ))}
      </div>

      {/* Decision List */}
      {filteredDecisions.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Diamond className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No decisions logged yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
              Debo extracts decisions from your journals, voice notes, and meetings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {months.map((month) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                {month}
              </h2>
              <div className="space-y-3">
                {grouped[month].map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    onStatusChange={updateStatus}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DecisionCard({
  decision,
  onStatusChange,
}: {
  decision: Decision;
  onStatusChange: (id: string, status: DecisionStatus) => void;
}) {
  const { label, className } = statusConfig[decision.status];

  return (
    <Card className="rounded-xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Diamond className="w-5 h-5 text-primary shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground leading-tight">
                  {decision.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {decision.decisionText}
                </p>
              </div>
              <Badge variant="outline" className={cn("shrink-0", className)}>
                {label}
              </Badge>
            </div>

            {decision.reason && (
              <div className="mt-2 flex items-start gap-2 text-sm">
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground italic">
                  {decision.reason}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded-md">
                {decision.source}
              </span>
              <span>
                {new Date(decision.decidedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>Confidence: {decision.confidence}%</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 px-2 text-xs"
                  >
                    Actions <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  {decision.status !== "changed" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(decision.id, "changed")}
                    >
                      Mark as Changed
                    </DropdownMenuItem>
                  )}
                  {decision.status !== "deprecated" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(decision.id, "deprecated")}
                    >
                      Mark as Deprecated
                    </DropdownMenuItem>
                  )}
                  {decision.status !== "active" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(decision.id, "active")}
                    >
                      Mark as Active
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
