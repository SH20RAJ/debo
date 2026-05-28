"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Mic,
  Upload,
  Link,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { LucideIcon } from "lucide-react";

export function QuickCapture() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.media.upload(file);
      toast.success("File uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const cards: { label: string; icon: LucideIcon; shortcut?: string; action: () => void }[] = [
    { label: "Write Journal", icon: BookOpen, shortcut: "⌘J", action: () => router.push("/dashboard/journal") },
    { label: "Record Voice", icon: Mic, shortcut: "⌘⇧V", action: () => router.push("/dashboard/voice") },
    { label: "Upload File", icon: Upload, shortcut: "⌘U", action: () => fileInputRef.current?.click() },
    {
      label: "Save Link", icon: Link,
      action: () => {
        const url = window.prompt("Paste the URL:");
        if (url?.trim()) {
          toast.promise(
            api.sources.create({ type: "link", title: url, content: url, origin: "manual" }),
            { loading: "Saving link...", success: "Link saved!", error: (err) => err.message }
          );
        }
      },
    },
    { label: "Ask Debo", icon: MessageSquare, shortcut: "⌘A", action: () => router.push("/dashboard/ask") },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
        Quick Capture
      </h2>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
      <TooltipProvider>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {cards.map((card) => (
            <Tooltip key={card.label}>
              <TooltipTrigger asChild>
                <Card
                  onClick={card.action}
                  className={cn(
                    "rounded-2xl border-2 border-border bg-card p-0 cursor-pointer",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
                    "active:translate-y-0 active:shadow-sm",
                    "group"
                  )}
                >
                  <CardContent className="flex flex-col items-center justify-center gap-2.5 p-5">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl bg-accent flex items-center justify-center",
                        "transition-colors duration-200 group-hover:bg-primary/10"
                      )}
                    >
                      <card.icon className="w-5 h-5 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {uploading && card.label === "Upload File" ? "Uploading..." : card.label}
                    </span>
                    {card.shortcut && (
                      <span className="text-[11px] font-mono text-muted-foreground/70">
                        {card.shortcut}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              {card.shortcut && (
                <TooltipContent>
                  <p className="font-mono">{card.shortcut}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
}
