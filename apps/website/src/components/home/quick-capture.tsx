"use client";

import { useRef } from "react";
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
import useSWR from "swr";
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

export function ActionTriad() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch inbox tasks with SWR
  const { data: inboxTasks, isLoading } = useSWR(
    "/api/tasks?status=inbox",
    () => api.tasks.list({ status: "inbox" })
  );

  const inboxCount = Array.isArray(inboxTasks) ? inboxTasks.length : 0;

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
                "group text-left ios-card border border-border/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              )}
            >
              <TriadInner
                icon={Plus}
                label="Capture"
                hint="Journal, voice, file, link"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border/60">
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/journal")}
              className="rounded-xl cursor-pointer py-2 px-3 focus:bg-accent/60"
            >
              <BookOpen className="size-4 text-muted-foreground mr-2" />
              Write journal
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/voice")}
              className="rounded-xl cursor-pointer py-2 px-3 focus:bg-accent/60"
            >
              <Mic className="size-4 text-muted-foreground mr-2" />
              Record voice
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5 border-border/40" />
            <DropdownMenuItem
              onClick={() => fileRef.current?.click()}
              className="rounded-xl cursor-pointer py-2 px-3 focus:bg-accent/60"
            >
              <Upload className="size-4 text-muted-foreground mr-2" />
              Upload file
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={saveLink}
              className="rounded-xl cursor-pointer py-2 px-3 focus:bg-accent/60"
            >
              <LinkIcon className="size-4 text-muted-foreground mr-2" />
              Save link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ASK */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/ask")}
          className={cn(
            "group text-left ios-card border border-border/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          )}
        >
          <TriadInner
            icon={MessageSquare}
            label="Ask Debo"
            hint="Search your past with citations"
          />
        </button>

        {/* REVIEW */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/inbox")}
          className={cn(
            "group text-left ios-card border border-border/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          )}
        >
          <TriadInner
            icon={Inbox}
            label="Review"
            hint={
              isLoading
                ? "Loading..."
                : inboxCount > 0
                ? `${inboxCount} item${inboxCount === 1 ? "" : "s"} to triage`
                : "Inbox is clear"
            }
            badge={
              inboxCount > 0 ? (
                <Badge className="rounded-full bg-primary text-primary-foreground border-0 text-[10px] font-bold px-2 py-0.5 shadow-xs">
                  {inboxCount}
                </Badge>
              ) : isLoading ? null : (
                <span className="text-primary">
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
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 w-full">
      <div
        className={cn(
          "size-10 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-300",
          "bg-primary/10 text-primary",
          "group-hover:scale-105 group-hover:bg-primary/15"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground font-[var(--font-nunito)]">{label}</span>
          {badge}
          <ArrowUpRight className="size-3.5 text-primary/60 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0" />
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
