"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ContextImportDialogProps = {
  variant?: "icon" | "panel";
  className?: string;
};

const sourceOptions = [
  { value: "auto", label: "Auto" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "cursor", label: "Cursor" },
  { value: "codex", label: "Codex" },
  { value: "gemini", label: "Gemini" },
  { value: "other", label: "Other" },
];

export function ContextImportDialog({
  variant = "icon",
  className,
}: ContextImportDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("auto");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [lastImport, setLastImport] = useState<{
    importedMessages: number;
    journalIds: string[];
  } | null>(null);

  const threadId = pathname?.startsWith("/chat/")
    ? decodeURIComponent(pathname.replace("/chat/", "").split("/")[0] || "")
    : null;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setContent(text);
    setTitle((current) => current || file.name.replace(/\.[^.]+$/, ""));
    toast.success("Import file loaded");
  };

  const handleImport = async () => {
    if (!content.trim()) {
      toast.error("Add an export file or paste context first");
      return;
    }

    setIsImporting(true);
    setLastImport(null);
    try {
      const res = await fetch("/api/chat/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          title: title.trim() || undefined,
          content,
          threadId,
        }),
      });
      const result = (await res.json()) as {
        error?: string;
        importedMessages?: number;
        journalIds?: string[];
        threadId?: string;
      };

      if (!res.ok) {
        throw new Error(result.error || `Import failed with ${res.status}`);
      }

      setLastImport({
        importedMessages: result.importedMessages || 0,
        journalIds: result.journalIds || [],
      });
      toast.success("Context imported into Debo");
      setOpen(false);
      if (result.threadId) {
        router.replace(`/chat/${encodeURIComponent(result.threadId)}`, { scroll: false });
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const trigger =
    variant === "panel" ? (
      <button
        className={cn(
          "group flex min-h-16 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-sky-300/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50",
          className
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/25 text-sky-300 transition group-hover:text-emerald-200">
          <BrainCircuit className="h-4 w-4" />
        </span>
        <span className="text-sm font-black uppercase tracking-[0.14em] text-white/85">
          Import context
        </span>
      </button>
    ) : (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-md border border-white/10 bg-white/[0.04] text-white/70 hover:border-sky-300/40 hover:text-sky-200",
          className
        )}
        aria-label="Import AI context"
      >
        <Upload className="h-4 w-4" />
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-white/10 bg-[#0b1113] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-[0.12em] text-white">
            <BrainCircuit className="h-4 w-4 text-sky-300" />
            Import AI Context
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Bring in exported ChatGPT, Claude, Cursor, Codex, Gemini, or markdown context.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-10 w-full border-white/10 bg-white/[0.03] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Import title"
              className="h-10 border-white/10 bg-white/[0.03] text-white placeholder:text-white/30"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.md,.csv"
            className="hidden"
            onChange={handleFile}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 justify-start gap-2 border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              Upload export
            </Button>
            <div className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 text-xs font-bold uppercase tracking-[0.16em] text-white/35">
              {lastImport ? <Check className="h-4 w-4 text-emerald-300" /> : <ArrowRight className="h-4 w-4 text-sky-300" />}
              {lastImport
                ? `${lastImport.importedMessages} messages indexed`
                : "JSON, Markdown, Text"}
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste exported conversations or AI IDE context..."
            className="min-h-64 resize-none border-white/10 bg-black/25 text-sm text-white placeholder:text-white/30"
          />
        </div>

        <DialogFooter className="border-white/10 bg-white/[0.03]">
          <Button
            type="button"
            className="gap-2 bg-sky-300 text-slate-950 hover:bg-sky-200"
            onClick={handleImport}
            disabled={isImporting || !content.trim()}
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
