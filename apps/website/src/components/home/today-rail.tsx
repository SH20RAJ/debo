"use client";

import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Gavel,
  Link as LinkIcon,
  Loader2,
  Mail,
  Mic,
  Sparkles,
} from "lucide-react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type ItemKind = "source" | "decision";

interface TodayItem {
  id: string;
  kind: ItemKind;
  title: string;
  meta: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  ts: number;
}

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  voice: Mic,
  audio: Mic,
  journal: BookOpen,
  link: LinkIcon,
  email: Mail,
  debo_mail: Mail,
};

function getSourceIcon(type?: string) {
  return (type && SOURCE_ICONS[type]) || FileText;
}

function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function timeLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TodayRail() {
  const router = useRouter();

  const { data: sources, isLoading: loadingSources, error: sourcesError } = useSWR(
    "/api/sources",
    () => api.sources.list()
  );

  const { data: decisions, isLoading: loadingDecisions, error: decisionsError } = useSWR(
    "/api/decisions",
    () => api.decisions.list()
  );

  const loading = loadingSources || loadingDecisions;
  const hasError = !!(sourcesError && decisionsError);

  const srcRaw = Array.isArray(sources)
    ? sources
    : (sources as any)?.sources ?? (sources as any)?.data ?? [];

  const decRaw = Array.isArray(decisions)
    ? decisions
    : (decisions as any)?.decisions ?? (decisions as any)?.data ?? [];

  const merged: TodayItem[] = [];

  for (const s of srcRaw as any[]) {
    const created = s.createdAt ?? s.created_at ?? s.updatedAt;
    if (!isToday(created)) continue;
    merged.push({
      id: `s-${s.id}`,
      kind: "source",
      title: s.title || "Untitled capture",
      meta: timeLabel(created),
      icon: getSourceIcon(s.type ?? s.sourceType),
      href: `/dashboard/library/${s.id}`,
      ts: new Date(created).getTime(),
    });
  }

  for (const d of decRaw as any[]) {
    const decidedAt = d.decidedAt ?? d.decided_at ?? d.createdAt ?? d.created_at;
    if (!isToday(decidedAt)) continue;
    merged.push({
      id: `d-${d.id}`,
      kind: "decision",
      title: d.title || "Decision",
      meta: timeLabel(decidedAt),
      icon: Gavel,
      href: "/dashboard/decisions",
      ts: new Date(decidedAt).getTime(),
    });
  }

  merged.sort((a, b) => b.ts - a.ts);
  const items = merged.slice(0, 6);

  return (
    <Card className="rounded-[1.75rem] border border-border/80 bg-card p-0 h-full shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-[var(--font-nunito)]">
            Today
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => router.push("/dashboard/timeline")}
            className="text-muted-foreground hover:text-primary rounded-lg text-xs"
          >
            Timeline
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-8 justify-center">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading today...
          </div>
        ) : hasError ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            Couldn&apos;t load today&apos;s activity.
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="size-10 rounded-2xl bg-accent flex items-center justify-center">
              <Sparkles className="size-4 text-primary/70" />
            </div>
            <p className="text-xs text-muted-foreground max-w-[20ch] leading-relaxed">
              Nothing captured yet today. Drop a thought above.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-2xl px-2.5 py-2 text-left",
                      "hover:bg-primary/5 transition-all group duration-200"
                    )}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                        item.kind === "decision"
                          ? "bg-primary/10 text-primary group-hover:scale-105"
                          : "bg-accent text-muted-foreground group-hover:scale-105"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <p className="flex-1 text-sm text-foreground truncate font-medium group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground shrink-0 bg-secondary px-2 py-0.5 rounded-full">
                      {item.meta}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
