"use client";

import { useState, useEffect } from "react";
import { Diamond, ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

interface Decision {
  id: string;
  title: string;
  decisionText: string;
  reason?: string;
  status: "active" | "changed" | "deprecated";
  source: string;
  decidedAt: string;
  confidence: number;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  changed: {
    label: "Changed",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30",
  },
  deprecated: {
    label: "Deprecated",
    className:
      "bg-muted text-muted-foreground border-border",
  },
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
  const [filter, setFilter] = useState<string>("all");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.decisions
      .list(filter === "all" ? undefined : filter)
      .then((data: any) => setDecisions(Array.isArray(data) ? data : []))
      .catch(() => setDecisions([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.decisions.update(id, { status: newStatus });
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: newStatus as Decision["status"] } : d
        )
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
          Decision Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading
            ? "Loading..."
            : `${decisions.length} decision${
                decisions.length !== 1 ? "s" : ""
              } logged`}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "changed", "deprecated"] as const).map((status) => {
          const isActive = filter === status;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border-2",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_3px_0_#46A302]"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {status === "all" ? "All" : statusConfig[status].label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
          <Loader2 className="size-4 animate-spin" />
          Loading decisions...
        </div>
      ) : decisions.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <Diamond className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[32ch]">
            Debo extracts decisions from your journals, voice notes, and meetings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupByMonth(decisions)).map(
            ([month, monthDecisions]) => (
              <div key={month}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {month}
                </h2>
                <div className="space-y-2">
                  {monthDecisions.map((decision) => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      onStatusChange={updateStatus}
                    />
                  ))}
                </div>
              </div>
            )
          )}
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
  onStatusChange: (id: string, status: string) => void;
}) {
  const { label, className } = statusConfig[decision.status];

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex gap-3">
        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Diamond className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight font-[var(--font-nunito)]">
                {decision.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {decision.decisionText}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0 rounded-full text-[10px]", className)}
            >
              {label}
            </Badge>
          </div>

          {decision.reason && (
            <div className="mt-2 flex items-start gap-2 text-xs">
              <ArrowRight className="size-3 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground italic">
                {decision.reason}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground flex-wrap">
            <span className="bg-accent rounded-md px-2 py-0.5">
              {decision.source}
            </span>
            <span>
              {new Date(decision.decidedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>{decision.confidence}% confidence</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-auto h-7 px-2 text-[11px] rounded-lg hover:bg-accent/60"
                >
                  Actions <ChevronDown className="size-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {decision.status !== "active" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(decision.id, "active")}
                  >
                    Mark as Active
                  </DropdownMenuItem>
                )}
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
