"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ChatArea, type Message } from "@/components/ask/chat-area";
import { Composer } from "@/components/ask/composer";
import { SourceRail, type RelatedMemory } from "@/components/ask/source-rail";
import { type SourceData } from "@/components/ask/source-citation";

interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface AskEvent {
  type: string;
  [key: string]: unknown;
}

function createSSEParser() {
  let buffer = "";
  return function parse(chunk: string): AskEvent[] {
    buffer += chunk;
    const events: AskEvent[] = [];
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      for (const line of part.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            events.push(JSON.parse(line.slice(6)));
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
    return events;
  };
}

function mapSource(raw: Record<string, unknown>): SourceData {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    type: (raw.type as SourceData["type"]) ?? (raw.sourceType as SourceData["type"]) ?? "file",
    label: String(raw.label ?? raw.title ?? "Source"),
    detail: String(raw.detail ?? raw.meta ?? raw.snippet ?? ""),
    confidence: (raw.confidence as SourceData["confidence"]) ?? "partial",
    excerpt: raw.excerpt ? String(raw.excerpt) : (raw.snippet ? String(raw.snippet) : undefined),
    timestamp: raw.timestamp ? String(raw.timestamp) : undefined,
    people: raw.people as string[] | undefined,
    relatedTasks: raw.relatedTasks as string[] | undefined,
  };
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Thread state
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat message & rail state
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSources, setActiveSources] = useState<SourceData[]>([]);
  const [relatedMemories, setRelatedMemories] = useState<RelatedMemory[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const isInitialLoad = useRef(true);

  // Fetch all threads
  const fetchThreads = useCallback(async () => {
    try {
      const data = await api.ask.listThreads();
      if (data) setThreads(data);
    } catch {
      toast.error("Failed to load thread history.");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  // Fetch specific thread messages
  const loadThread = useCallback(async (threadId: string) => {
    // Abort active streams if any
    if (abortRef.current) {
      abortRef.current.abort();
      setIsResponding(false);
    }

    try {
      const data = await api.ask.getThread(threadId);
      if (data) {
        const mappedMessages = data.messages.map((m: any) => {
          let sources: SourceData[] = [];
          if (m.citations && m.citations.length > 0) {
            sources = m.citations.map((c: any) => ({
              id: c.sourceId,
              type: c.sourceType || "file",
              label: c.sourceTitle || "Source",
              excerpt: c.quoteText,
              confidence: typeof c.confidence === "number" 
                ? (c.confidence >= 0.85 ? "strong" : c.confidence >= 0.55 ? "partial" : "weak") 
                : "partial",
            }));
          }
          return {
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content || "",
            sources: sources.length > 0 ? sources : undefined,
          };
        });

        setMessages(mappedMessages);
        setActiveThreadId(threadId);

        // Populate rails with the last assistant message's sources if available
        const lastAssistant = [...mappedMessages].reverse().find(m => m.role === "assistant");
        if (lastAssistant && lastAssistant.sources) {
          setActiveSources(lastAssistant.sources);
        } else {
          setActiveSources([]);
        }
        setRelatedMemories([]);
        setFollowUps([]);
      }
    } catch {
      toast.error("Failed to load thread.");
    }
  }, []);

  // Initialize page, handle query params
  useEffect(() => {
    fetchThreads().then(() => {
      const q = searchParams.get("q");
      const threadId = searchParams.get("threadId");

      if (threadId) {
        loadThread(threadId);
      } else if (q) {
        handleSend(q);
      }
    });
  }, [fetchThreads]);

  // Handle stream send
  const handleSend = useCallback(async (text: string, mode?: string) => {
    if (isResponding) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsResponding(true);
    setActiveSources([]);
    setRelatedMemories([]);
    setFollowUps([]);

    let answer = "";
    const sources: SourceData[] = [];
    const related: RelatedMemory[] = [];
    const followupQuestions: string[] = [];

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const response = await api.ask.stream({
        question: text,
        mode: mode || "recall",
        threadId: activeThreadId || undefined,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      const parse = createSSEParser();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const events = parse(decoder.decode(value, { stream: true }));

        for (const event of events) {
          switch (event.type) {
            case "retrieval_started": {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: "", retrievalActive: true }
                    : m
                )
              );
              break;
            }

            case "source_found": {
              const src = mapSource(event as Record<string, unknown>);
              sources.push(src);
              setActiveSources([...sources]);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, sources: [...sources] }
                    : m
                )
              );
              break;
            }

            case "answer_delta": {
              const token = String(event.token ?? event.delta ?? event.text ?? "");
              answer += token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: answer, retrievalActive: false }
                    : m
                )
              );
              break;
            }

            case "citation_added": {
              const citation = mapSource(event as Record<string, unknown>);
              if (!sources.find((s) => s.id === citation.id)) {
                sources.push(citation);
                setActiveSources([...sources]);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, sources: [...sources] }
                      : m
                  )
                );
              }
              break;
            }

            case "related_memory": {
              related.push({
                id: String(event.id ?? crypto.randomUUID()),
                type: (event.sourceType as SourceData["type"]) ?? "file",
                title: String(event.title ?? ""),
                meta: String(event.meta ?? ""),
              });
              setRelatedMemories([...related]);
              break;
            }

            case "suggested_followup": {
              const q = String(event.question ?? event.text ?? "");
              if (q) followupQuestions.push(q);
              setFollowUps([...followupQuestions]);
              break;
            }

            case "done": {
              let finalSources = sources;
              if (event.sources) {
                finalSources = (event.sources as Record<string, unknown>[]).map(mapSource);
                setActiveSources(finalSources);
              }
              if (event.followUps || event.follow_ups) {
                const ups = (event.followUps ?? event.follow_ups) as string[];
                setFollowUps(ups);
              }
              if (event.related) {
                setRelatedMemories(event.related as RelatedMemory[]);
              }

              // Update the active thread ID if it was newly created
              if (event.threadId && typeof event.threadId === "string") {
                setActiveThreadId(event.threadId);
                // Refresh list of threads to include the new one
                fetchThreads();
              }

              let finalActions: any[] = [];
              if (event.actionSuggestions) {
                finalActions = (event.actionSuggestions as any[]).map(a => ({
                  id: String(a.id ?? crypto.randomUUID()),
                  label: String(a.label ?? a.text ?? ""),
                  kind: a.kind || "ask"
                }));
              }

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: answer || m.content,
                        sources: finalSources,
                        suggestedActions: finalActions.length > 0 ? finalActions : undefined,
                        retrievalActive: false
                      }
                    : m
                )
              );
              break;
            }

            case "error": {
              throw new Error(String(event.message ?? "Stream error"));
            }
          }
        }
      }
    } catch (err: unknown) {
      if (abort.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      console.error("Ask stream error:", err);
      toast.error(msg);

      if (!answer) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Hmm, I couldn't reach my AI brain just now. Give it another try in a sec.",
                  retrievalActive: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsResponding(false);
      abortRef.current = null;
    }
  }, [activeThreadId, isResponding, fetchThreads]);

  const handleNewChat = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setActiveThreadId(null);
    setMessages([]);
    setActiveSources([]);
    setRelatedMemories([]);
    setFollowUps([]);
    setIsResponding(false);
    // Clear search parameters
    router.replace("/dashboard/chat");
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.ask.deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) {
        handleNewChat();
      }
      toast.success("Conversation deleted.");
    } catch {
      toast.error("Failed to delete conversation.");
    }
  };

  const handlePromptClick = useCallback(
    (prompt: string) => {
      handleSend(prompt, "recall");
    },
    [handleSend]
  );

  const handleFollowUpClick = useCallback(
    (question: string) => {
      handleSend(question, "recall");
    },
    [handleSend]
  );

  return (
    <div className="flex h-full bg-[#090d08] relative overflow-hidden select-none">
      {/* 1. Collapsible Thread History Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-white/5 bg-[#0b0f09]/80 backdrop-blur-md transition-all duration-200 ease-in-out select-none relative shrink-0",
          sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 font-[var(--font-nunito)]">
            History
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={handleNewChat}
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-12 text-xs text-muted-foreground/75 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Loading history...
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-12 px-4 select-none">
              <Clock className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                No past chats
              </p>
            </div>
          ) : (
            <div className="px-2 space-y-0.5">
              {threads.map((thread) => {
                const isActive = activeThreadId === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => loadThread(thread.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all group",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive && "text-primary")} />
                      <span className="truncate pr-2">{thread.title || "Conversation"}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteThread(thread.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Sidebar Toggle Handle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-white/5 hover:bg-white/10 border border-l-0 border-white/5 rounded-r-lg z-25 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all shadow-md"
        style={{ left: sidebarCollapsed ? 0 : "255px" }}
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* 2. Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <ChatArea
          messages={messages}
          isResponding={isResponding}
          onPromptClick={handlePromptClick}
        />
        <Composer onSend={handleSend} isResponding={isResponding} />
      </div>

      {/* 3. Right Source Rail */}
      <SourceRail
        sources={activeSources}
        related={relatedMemories}
        followUps={followUps}
        onFollowUpClick={handleFollowUpClick}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-[#090d08] text-xs text-muted-foreground/60 font-semibold select-none">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading chat interface...
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
