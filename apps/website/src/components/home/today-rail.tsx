"use client";

import { useRouter } from "next/navigation";
import {
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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Item {
  id: string;
  title: string;
  meta: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  voice: Mic,
  audio: Mic,
  journal: Mic,
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

  const { data: sources, isLoading: loadingSources } = useSWR(
    "/api/sources",
    () => api.sources.list()
  );

  const { data: decisions, isLoading: loadingDecisions } = useSWR(
    "/api/decisions",
    () => api.decisions.list()
  );

  const merged: Item[] = [];

  for (const s of (Array.isArray(sources) ? sources : []) as any[]) {
    const created = s.createdAt ?? s.created_at;
    if (!isToday(created)) continue;
    merged.push({
      id: `s-${s.id}`,
      title: s.title || "Untitled capture",
      meta: timeLabel(created),
      icon: getSourceIcon(s.type ?? s.sourceType),
      href: `/dashboard/library/${s.id}`,
    });
  }
  for (const d of (Array.isArray(decisions) ? decisions : []) as any[]) {
    const decidedAt = d.decidedAt ?? d.decided_at ?? d.createdAt;
    if (!isToday(decidedAt)) continue;
    merged.push({
      id: `d-${d.id}`,
      title: d.title || "Decision",
      meta: timeLabel(decidedAt),
      icon: Gavel,
      href: "/dashboard/decisions",
    });
  }

  merged.sort((a, b) => b.meta.localeCompare(a.meta));
  const items = merged.slice(0, 6);
  const loading = loadingSources || loadingDecisions;

  return (
    <Card className="h-full">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Today</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/timeline")}>
            Timeline
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
              <Sparkles className="size-4 text-muted-foreground" />
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
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <p className="flex-1 truncate text-sm font-medium">{item.title}</p>
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
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
