"use client";

import { useEffect, useState } from "react";
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
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([api.sources.list(), api.decisions.list()])
      .then(([srcRes, decRes]) => {
        if (cancelled) return;

        const srcRaw =
          srcRes.status === "fulfilled"
            ? Array.isArray(srcRes.value)
              ? srcRes.value
              : (srcRes.value as any)?.sources ?? (srcRes.value as any)?.data ?? []
            : [];
        const decRaw =
          decRes.status === "fulfilled"
            ? Array.isArray(decRes.value)
              ? decRes.value
              : (decRes.value as any)?.decisions ?? (decRes.value as any)?.data ?? []
            : [];

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

        setItems(merged.slice(0, 6));
        setLoading(false);
        if (srcRes.status === "rejected" && decRes.status === "rejected") {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="rounded-2xl border-2 border-border bg-card p-0 h-full">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">
            Today
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => router.push("/dashboard/timeline")}
            className="text-muted-foreground rounded-lg"
          >
            Timeline
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-6">
            <Loader2 className="size-3.5 animate-spin" />
            Loading today...
          </div>
        ) : error ? (
          <p className="text-xs text-muted-foreground py-6">
            Couldn&apos;t load today&apos;s activity.
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-6 gap-2">
            <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground max-w-[18ch]">
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
                      "w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left",
                      "hover:bg-accent/50 transition-colors group"
                    )}
                  >
                    <div
                      className={cn(
                        "size-7 rounded-lg flex items-center justify-center shrink-0",
                        item.kind === "decision"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-muted-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <p className="flex-1 text-sm text-foreground truncate">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
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
