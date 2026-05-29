"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Inbox,
  Link as LinkIcon,
  MessageSquare,
  Mic,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Counts {
  inbox: number | null;
  loading: boolean;
}

export function ActionTriad() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState<Counts>({ inbox: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    api.tasks
      .list("inbox")
      .then((data: unknown) => {
        if (cancelled) return;
        const len = Array.isArray(data) ? data.length : 0;
        setCounts({ inbox: len, loading: false });
      })
      .catch(() => {
        if (!cancelled) setCounts({ inbox: 0, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await toast.promise(api.media.upload(file), {
        loading: "Uploading...",
        success: `Uploaded ${file.name}`,
        error: (err) => (err instanceof Error ? err.message : "Upload failed"),
      });
    } finally {
      e.target.value = "";
    }
  };

  const saveLink = () => {
    const url = window.prompt("Paste a URL to save:");
    if (!url?.trim()) return;
    toast.promise(
      api.sources.create({
        type: "link",
        title: url,
        content: url,
        origin: "manual",
      }),
      {
        loading: "Saving link...",
        success: "Link saved",
        error: (err) => (err instanceof Error ? err.message : "Failed"),
      }
    );
  };

  return (
    <section className="mb-6">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFile}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* CAPTURE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group text-left rounded-2xl border-2 border-border bg-card p-4",
                "transition-all duration-200 cursor-pointer",
                "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
                "active:translate-y-0 active:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              )}
            >
              <TriadInner
                icon={Plus}
                label="Capture"
                hint="Journal, voice, file, link"
                accent="primary"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-xl">
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/journal")}
              className="rounded-lg cursor-pointer"
            >
              <BookOpen className="size-4 text-muted-foreground" />
              Write journal
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/voice")}
              className="rounded-lg cursor-pointer"
            >
              <Mic className="size-4 text-muted-foreground" />
              Record voice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => fileRef.current?.click()}
              className="rounded-lg cursor-pointer"
            >
              <Upload className="size-4 text-muted-foreground" />
              Upload file
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={saveLink}
              className="rounded-lg cursor-pointer"
            >
              <LinkIcon className="size-4 text-muted-foreground" />
              Save link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ASK */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/ask")}
          className={cn(
            "group text-left rounded-2xl border-2 border-border bg-card p-4",
            "transition-all duration-200 cursor-pointer",
            "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
            "active:translate-y-0 active:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          )}
        >
          <TriadInner
            icon={MessageSquare}
            label="Ask Debo"
            hint="Search your past with citations"
            accent="primary"
          />
        </button>

        {/* REVIEW */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/inbox")}
          className={cn(
            "group text-left rounded-2xl border-2 border-border bg-card p-4",
            "transition-all duration-200 cursor-pointer",
            "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
            "active:translate-y-0 active:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          )}
        >
          <TriadInner
            icon={Inbox}
            label="Review"
            hint={
              counts.loading
                ? "Loading..."
                : counts.inbox && counts.inbox > 0
                ? `${counts.inbox} item${counts.inbox === 1 ? "" : "s"} to triage`
                : "Inbox is clear"
            }
            accent="primary"
            badge={
              counts.inbox && counts.inbox > 0 ? (
                <Badge className="rounded-full bg-primary text-primary-foreground border-0 text-[10px] px-2 py-0">
                  {counts.inbox}
                </Badge>
              ) : counts.loading ? null : (
                <span className="text-muted-foreground">
                  <CheckCircle2 className="size-4" />
                </span>
              )
            }
          />
        </button>
      </div>
    </section>
  );
}

function TriadInner({
  icon: Icon,
  label,
  hint,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  accent: "primary";
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "size-10 rounded-xl shrink-0 flex items-center justify-center",
          "bg-primary/10 text-primary",
          "group-hover:bg-primary/15 transition-colors"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {badge}
          <ArrowUpRight className="size-3.5 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</p>
      </div>
    </div>
  );
}

// Compatibility export so the old import path still works if reused.
export { ActionTriad as QuickCapture };

// Suppress unused warning for Button import (kept for future expansion)
void Button;
