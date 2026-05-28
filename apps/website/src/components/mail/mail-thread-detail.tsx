"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Brain,
  CheckCircle2,
  MessageSquareReply,
  MoreHorizontal,
  Send,
  Sparkles,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MailMessage, MailThread } from "./mail-shell";

export type MailThreadContext = {
  participants: Array<{
    address: string;
    role: string;
    isYou?: boolean;
  }>;
  savedCount?: number;
  internalOnly?: boolean;
  relatedMemories?: Array<{
    id: string;
    title: string;
    snippet: string;
  }>;
  possibleTasks?: string[];
  sourceStatus?: string;
};

interface MailThreadDetailProps {
  thread: MailThread;
  messages: MailMessage[];
  context: MailThreadContext;
  currentAddress: string;
  loading?: boolean;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
  onReply: (body: string) => Promise<void>;
  onSaveToMemory: (messageId: string) => Promise<void>;
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MailThreadDetail({
  thread,
  messages,
  context,
  currentAddress,
  loading = false,
  onArchive,
  onDelete,
  onReply,
  onSaveToMemory,
}: MailThreadDetailProps) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const otherParticipant = useMemo(
    () =>
      context.participants.find((participant) => !participant.isYou)?.address ??
      messages.find((message) => message.senderAddress !== currentAddress)?.senderAddress ??
      "teammate@debo.life",
    [context.participants, currentAddress, messages],
  );

  const savedCount = messages.filter((message) => message.isMemorySaved === 1 || savingIds.has(message.id)).length;
  const latestMessage = messages[messages.length - 1];
  const possibleTasks = context.possibleTasks?.length
    ? context.possibleTasks
    : ["Save key context to memory", "Follow up with the sender"];

  async function handleReply() {
    const body = reply.trim();
    if (!body) return;
    setSending(true);
    try {
      await onReply(body);
      setReply("");
    } finally {
      setSending(false);
    }
  }

  async function handleSave(messageId: string) {
    setSavingIds((current) => new Set(current).add(messageId));
    await onSaveToMemory(messageId);
  }

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_300px] max-xl:grid-cols-1">
      <section className="flex h-full min-w-0 flex-col">
        <div className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-foreground">{thread.subject}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {loading ? "Refreshing" : `${messages.length} message${messages.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Archive" onClick={onArchive}>
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="More">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {messages.map((message) => {
            const isSentByMe = message.senderAddress === currentAddress;
            const isSaved = message.isMemorySaved === 1 || savingIds.has(message.id);

            return (
              <article key={message.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      isSentByMe ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary",
                    )}
                  >
                    {message.senderAddress.split("@")[0].slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{message.senderAddress.split("@")[0]}</span>
                      <span className="truncate text-[11px] text-muted-foreground">{message.senderAddress}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">to {message.recipientAddress}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatFullDate(message.createdAt)}</span>
                </div>

                <div className="pl-11">
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{message.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => handleSave(message.id)} disabled={isSaved}>
                        {isSaved ? <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> : <Brain className="mr-2 h-3.5 w-3.5" />}
                        {isSaved ? "Saved" : "Save to memory"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs">
                        <SquarePen className="mr-2 h-3.5 w-3.5" />
                        Turn into task
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs">
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        Ask Debo
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-border px-6 py-4">
          <div className="rounded-xl border border-border bg-muted/35 p-3">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
              placeholder={`Reply to ${otherParticipant}`}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">Internal Debo Mail only. External emails are not supported.</p>
              <Button size="sm" className="h-8 rounded-lg" onClick={handleReply} disabled={sending || !reply.trim()}>
                <Send className="mr-2 h-3.5 w-3.5" />
                {sending ? "Sending" : "Reply"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <aside className="border-l border-border bg-background/60 p-5 max-xl:hidden">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Context</p>
            <div className="mt-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {otherParticipant.split("@")[0].slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{otherParticipant}</p>
                  <p className="text-xs text-muted-foreground">Internal Debo user</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border bg-background p-2">
                  <p className="text-muted-foreground">Messages</p>
                  <p className="mt-1 font-semibold text-foreground">{messages.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-2">
                  <p className="text-muted-foreground">Saved</p>
                  <p className="mt-1 font-semibold text-foreground">{savedCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Memory actions</p>
            <div className="mt-3 space-y-2">
              <Button variant="outline" className="w-full justify-start rounded-lg" disabled={!latestMessage} onClick={() => latestMessage && handleSave(latestMessage.id)}>
                <Brain className="mr-2 h-4 w-4" />
                Save latest message
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-lg">
                <MessageSquareReply className="mr-2 h-4 w-4" />
                Ask Debo about this
              </Button>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Possible tasks</p>
            <div className="mt-3 space-y-2">
              {possibleTasks.map((task) => (
                <div key={task} className="rounded-lg border border-border bg-card p-3 text-xs text-foreground/85">
                  {task}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
