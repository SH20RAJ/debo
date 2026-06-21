"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Link as LinkIcon,
  Loader2,
  Mic,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useSWRConfig } from "swr";

const QUESTION_PREFIXES = [
  "who", "what", "when", "where", "why", "how", "which",
  "did", "do", "does", "is", "are", "was", "were", "can", "could", "should",
];

function classifyInput(raw: string): "ask" | "link" | "journal" {
  const text = raw.trim();
  if (!text) return "journal";
  if (text.startsWith("?") || text.endsWith("?")) return "ask";
  try {
    const url = new URL(text);
    if (url.protocol === "http:" || url.protocol === "https:") return "link";
  } catch {
    // not a URL
  }
  const firstWord = text.toLowerCase().split(/\s+/)[0]?.replace(/[^a-z]/g, "");
  if (firstWord && QUESTION_PREFIXES.includes(firstWord) && text.length < 200) {
    return "ask";
  }
  return "journal";
}

export function CaptureHero() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const text = value.trim();
    if (!text || busy) return;
    const intent = classifyInput(text);

    if (intent === "ask") {
      router.push(`/dashboard/ask?q=${encodeURIComponent(text)}`);
      return;
    }

    setBusy(true);
    try {
      if (intent === "link") {
        await api.sources.create({
          type: "link",
          title: text,
          content: text,
          origin: "manual",
        });
        toast.success("Link saved to memory");
      } else {
        await api.sources.create({
          type: "journal",
          title: text.split("\n")[0].slice(0, 80),
          content: text,
          origin: "manual",
        });
        toast.success("Captured to journal");
      }
      setValue("");
      // Optimistically trigger SWR mutations for related lists
      mutate("/api/sources");
      mutate("/api/decisions");
      mutate("/api/tasks?status=inbox");
      mutate("/api/inbox");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Enter" && !e.shiftKey && !value.includes("\n")) {
      e.preventDefault();
      submit();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await api.media.upload(file);
      toast.success(`Uploaded ${file.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const intent = classifyInput(value);
  const intentMeta =
    intent === "ask"
      ? { label: "Ask Debo", icon: Sparkles }
      : intent === "link"
      ? { label: "Save link", icon: LinkIcon }
      : { label: "Journal", icon: BookOpen };
  const IntentIcon = intentMeta.icon;

  return (
    <section className="mb-6">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFile}
      />
      <div
        className={cn(
          "rounded-3xl border border-border/80 bg-card p-5",
          "transition-all duration-300",
          "shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
          "focus-within:border-primary/40 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Capture a thought, paste a link, or ask a question..."
          rows={2}
          className={cn(
            "w-full resize-none bg-transparent text-base md:text-lg",
            "text-foreground placeholder:text-muted-foreground/60",
            "outline-none focus:outline-none border-0 p-0",
            "leading-relaxed"
          )}
        />

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/voice")}
          >
            <Mic className="size-4" />
            <span className="hidden sm:inline">Voice</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="size-4" />
            <span className="hidden sm:inline">Attach</span>
          </Button>

          <div className="ml-auto flex items-center gap-2">
            {value.trim() && (
              <span
                className={cn(
                  "hidden md:inline-flex items-center gap-1.5 text-xs font-semibold",
                  "text-primary"
                )}
              >
                <IntentIcon className="size-3.5" />
                {intentMeta.label}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={!value.trim() || busy}
              className={cn(
                "rounded-full gap-1.5 h-9 px-4 font-bold transition-all duration-200",
                "bg-primary text-primary-foreground",
                "shadow-[0_4px_12px_rgba(224,64,6,0.15)] hover:brightness-105 hover:shadow-[0_6px_16px_rgba(224,64,6,0.25)]",
                "active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {intentMeta.label}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
