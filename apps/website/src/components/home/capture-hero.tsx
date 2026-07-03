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
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

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
    <Card className="mb-6">
      <CardContent className="space-y-4">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Capture a thought, paste a link, or ask a question..."
          rows={2}
          className="resize-none border-0 bg-transparent text-base md:text-lg leading-relaxed shadow-none focus-visible:ring-0 p-0"
        />
        <div className="flex items-center gap-2 border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/voice")}
          >
            <Mic />
            <span className="hidden sm:inline">Voice</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip />
            <span className="hidden sm:inline">Attach</span>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {value.trim() && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <IntentIcon className="size-3.5" />
                {intentMeta.label}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={!value.trim() || busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : (
                <>
                  {intentMeta.label}
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
