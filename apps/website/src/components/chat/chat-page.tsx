"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AgentChat } from "@/components/agent-elements/agent-chat";

interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // SWR Thread Listing
  const { data: threads = [], isLoading: loadingThreads, mutate: mutateThreads } = useSWR<ChatThread[]>(
    "/api/chat/threads",
    api.ask.listThreads,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");

  const activeThreadIdRef = useRef(activeThreadId);
  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  // Vercel AI SDK useChat integration (v6 transport style)
  const {
    messages,
    setMessages,
    sendMessage,
    stop,
    status,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        threadId: activeThreadId,
      },
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await globalThis.fetch(input, init);
        const headerThreadId = response.headers.get("x-thread-id");
        const currentThreadId = activeThreadIdRef.current;
        if (headerThreadId && headerThreadId !== currentThreadId) {
          setActiveThreadId(headerThreadId);
          router.replace(`/dashboard/chat?threadId=${headerThreadId}`);
          mutateThreads();
        }
        return response;
      }
    }),
    onError(err) {
      console.error("Vercel AI SDK error:", err);
      toast.error(err.message || "Failed to process chat message.");
    }
  });

  const threadCacheRef = useRef<Record<string, any[]>>({});

  // Fetch and hydrate past messages for specific thread
  const loadThread = useCallback(async (threadId: string, updateUrl = true) => {
    // Stop active streams
    stop();

    // Load from cache instantly
    if (threadCacheRef.current[threadId]) {
      setMessages(threadCacheRef.current[threadId]);
      setActiveThreadId(threadId);
      if (updateUrl) {
        router.replace(`/dashboard/chat?threadId=${threadId}`);
      }
    }

    try {
      const data = await api.ask.getThread(threadId);
      if (data) {
        const mappedMessages = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content || "",
        }));

        threadCacheRef.current[threadId] = mappedMessages;
        setMessages(mappedMessages);
        setActiveThreadId(threadId);

        if (updateUrl) {
          router.replace(`/dashboard/chat?threadId=${threadId}`);
        }
      }
    } catch {
      toast.error("Failed to load thread details.");
    }
  }, [router, setMessages, stop]);

  // Sync thread when URL params change
  useEffect(() => {
    const threadId = searchParams.get("threadId");

    if (threadId) {
      if (threadId !== activeThreadId) {
        loadThread(threadId, false);
      }
    } else {
      if (activeThreadId !== null) {
        setActiveThreadId(null);
        setMessages([]);
      }
    }
  }, [searchParams, activeThreadId, loadThread, setMessages]);

  // Handle direct query parameters (e.g. greeting or widget clicks)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      router.replace("/dashboard/chat");
      sendMessage({ text: q });
    }
  }, [searchParams, sendMessage, router]);

  const handleNewChat = () => {
    stop();
    setActiveThreadId(null);
    setMessages([]);
    router.replace("/dashboard/chat");
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.ask.deleteThread(threadId);
      mutateThreads(threads.filter((t) => t.id !== threadId), false);
      if (activeThreadId === threadId) {
        handleNewChat();
      }
      toast.success("Conversation deleted.");
    } catch {
      toast.error("Failed to delete conversation.");
    }
  };

  const handleAgentSend = useCallback((msg: { role: "user"; content: string }) => {
    sendMessage({
      text: msg.content,
    });
  }, [sendMessage]);

  const suggestions = useMemo(() => [
    { id: "s1", label: "What did I write in my journal recently?", value: "What did I write in my journal recently?" },
    { id: "s2", label: "Check my inbox tasks", value: "Show me my pending inbox tasks." },
    { id: "s3", label: "Summarize recent voice calls", value: "What was discussed in my recent voice conversations?" },
  ], []);

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => (t.title || "Conversation").toLowerCase().includes(q));
  }, [threads, threadSearch]);

  return (
    <div className="flex h-full bg-background relative overflow-hidden">
      
      {/* 1. Collapsible Thread History Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-200 ease-in-out relative shrink-0 min-h-0",
          sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4.5 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 font-[var(--font-nunito)]">
            History
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer hover:bg-accent/60"
            onClick={handleNewChat}
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Thread History Search */}
        <div className="px-4 py-2.5 border-b border-border/60">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
            <Input
              type="text"
              placeholder="Search chat history..."
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              className="h-8.5 pl-8 pr-7 text-xs rounded-lg border border-border bg-background focus:bg-background focus-visible:ring-primary"
            />
            {threadSearch && (
              <button
                type="button"
                onClick={() => setThreadSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-emerald-500/25 scrollbar-track-transparent">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-12 text-xs text-muted-foreground/75 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Loading history...
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-12 px-4 select-none">
              <Clock className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                {threadSearch ? "No results found" : "No past chats"}
              </p>
            </div>
          ) : (
            <div className="px-2.5 space-y-1">
              {filteredThreads.map((thread) => {
                const isActive = activeThreadId === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => loadThread(thread.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-transparent group",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/20 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive && "text-primary")} />
                      <span className="truncate pr-2">{thread.title || "Conversation"}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteThread(thread.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle Handle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute w-4.5 h-12 bg-card border border-border border-l-0 rounded-r-xl z-20 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all shadow-sm"
        style={{ left: sidebarCollapsed ? 0 : "255px", top: "50%", transform: "translateY(-50%)" }}
      >
        {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* 2. Main Chat Column (Completely using AgentChat with 0 custom components) */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-background relative z-10 min-h-0 p-4">
        <AgentChat
          messages={messages as any}
          status={status}
          onSend={handleAgentSend}
          onStop={stop}
          error={error}
          suggestions={suggestions}
          emptyStatePosition="center"
          className="flex-1"
        />
      </div>

    </div>
  );
}
