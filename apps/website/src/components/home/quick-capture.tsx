"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Inbox,
  Link as LinkIcon,
  MessageSquare,
  Mic,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

export function ActionTriad() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

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
    <div className="mb-6">
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Card className="cursor-pointer transition-colors hover:bg-muted/40">
              <CardContent className="flex items-start gap-3 p-5">
                <TriadInner
                  icon={Plus}
                  label="Capture"
                  hint="Journal, voice, file, link"
                />
              </CardContent>
            </Card>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/dashboard/journal")}>
              <BookOpen />
              Write journal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/voice")}>
              <Mic />
              Record voice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => fileRef.current?.click()}>
              <Upload />
              Upload file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={saveLink}>
              <LinkIcon />
              Save link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => router.push("/dashboard/ask")}
          className="text-left"
        >
          <Card className="transition-colors hover:bg-muted/40">
            <CardContent className="flex items-start gap-3 p-5">
              <TriadInner
                icon={MessageSquare}
                label="Ask Debo"
                hint="Search your past with citations"
              />
            </CardContent>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/inbox")}
          className="text-left"
        >
          <Card className="transition-colors hover:bg-muted/40">
            <CardContent className="flex items-start gap-3 p-5">
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
              />
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  );
}

function TriadInner({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {hint}
        </p>
      </div>
    </>
  );
}

// Compatibility export.
export { ActionTriad as QuickCapture };
