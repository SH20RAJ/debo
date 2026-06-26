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
  Send,
  StopCircle,
  Activity,
  User,
  Sparkles,
  Database,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { api } from "@/lib/api";
import { stackClientApp } from "@/stack/client";
import { toast } from "sonner";
import { Streamdown, type Components } from "streamdown";
import { createCodePlugin } from "@streamdown/code";

const codePlugin = createCodePlugin({
  themes: ["github-light", "github-dark"],
});

interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

function getMessageText(message: any): string {
  if (typeof message.content === "string" && message.content.trim() !== "") {
    return message.content;
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text || "")
      .join("\n");
  }
  return "";
}

function getToolCalls(message: any): any[] {
  const toolCalls: any[] = [];
  if (Array.isArray(message.toolCalls)) {
    toolCalls.push(...message.toolCalls);
  }
  if (Array.isArray(message.parts)) {
    message.parts.forEach((part: any) => {
      if (
        part.type === "tool-call" ||
        part.type === "dynamic-tool" ||
        (typeof part.type === "string" && part.type.startsWith("tool-"))
      ) {
        toolCalls.push(part);
      }
    });
  }
  return toolCalls;
}

function getToolNameReadable(name: string): string {
  const mapping: Record<string, string> = {
    queryTasks: "Searching tasks",
    query_tasks: "Searching tasks",
    queryJournals: "Searching memory logs",
    query_journals: "Searching memory logs",
    queryVoiceNotes: "Searching voice notes",
    query_voice_notes: "Searching voice notes",
    queryMail: "Searching emails",
    query_mail: "Searching emails",
    get_iot_device_states: "Checking smart home status",
    control_iot_device: "Sending smart home command",
    web_fetch: "Reading webpage content",
    query_connectors: "Checking integrations list"
  };
  return mapping[name] || `Running ${name}`;
}

function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  const fixedContent = content
    .replace(/^(\d+)\.\s*\n+\s*\n*/gm, "$1. ")
    .replace(/```([^\n]*)/g, (_match, langRaw) => {
      const lang = String(langRaw || "").trim().toLowerCase();
      if (!lang) return "```";
      const normalized = lang.split(/\s+/)[0];
      const allowedLangs = new Set([
        "bash", "diff", "html", "js", "json", "jsx", "md", "markdown", "sh", "shell", "text", "ts", "tsx", "yml", "yaml"
      ]);
      return allowedLangs.has(normalized) ? `\`\`\`${normalized}` : "```text";
    });

  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1 className="text-sm font-extrabold mt-3 mb-1 text-foreground font-[var(--font-heading)]" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-xs font-bold mt-2.5 mb-1 text-foreground font-[var(--font-heading)]" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-xs font-semibold mt-2 mb-0.5 text-foreground font-[var(--font-heading)]" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="text-[13px] leading-relaxed text-foreground/90 my-1" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-outside space-y-0.5 text-[13px] mb-2.5 pl-4 text-foreground/90" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside space-y-0.5 text-[13px] mb-2.5 pl-4.5 text-foreground/90" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-[13px] pl-0.5 text-foreground/90" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-extrabold text-foreground" {...props}>
        {children}
      </strong>
    ),
    a: ({ href, children, ...props }) => {
      if (!href) return <span>{children}</span>;
      const isExternal = href.startsWith("http") || href.startsWith("mailto:");
      return (
        <a
          {...props}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary font-semibold hover:underline"
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote className="pl-3 italic my-2 border-l-2 border-border text-muted-foreground text-xs" {...props}>
        {children}
      </blockquote>
    ),
    hr: ({ ...props }) => (
      <hr className="my-3 border-border/40" {...props} />
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-3 border border-border rounded-xl">
        <table className="w-full text-xs text-left border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th className="font-bold px-3 py-1.5 bg-muted border-b border-border text-foreground" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-3 py-1.5 border-b border-border text-foreground/80" {...props}>
        {children}
      </td>
    ),
  };

  return (
    <div className={cn("overflow-hidden break-words [&_li>p]:inline [&_li>p]:mb-0", className)}>
      <Streamdown components={components} plugins={{ code: codePlugin }}>
        {fixedContent}
      </Streamdown>
    </div>
  );
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
  const activeThreadIdRef = useRef<string | null>(null);

  const changeActiveThreadId = useCallback((id: string | null) => {
    activeThreadIdRef.current = id;
    setActiveThreadId(id);
  }, []);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [inputText, setInputText] = useState("");
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId);
  }, [threads, activeThreadId]);

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
      body: () => ({
        threadId: activeThreadIdRef.current || undefined,
      }),
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        try {
          const user = await stackClientApp.getUser();
          if (user) {
            const token = await user.getAccessToken();
            if (token) {
              headers.set("x-stack-access-token", token);
            }
          }
        } catch (err) {
          console.error("Failed to get stack access token:", err);
        }

        const response = await globalThis.fetch(input, {
          ...init,
          headers,
        });
        const headerThreadId = response.headers.get("x-thread-id");
        const currentThreadId = activeThreadIdRef.current;
        if (headerThreadId && headerThreadId !== currentThreadId) {
          changeActiveThreadId(headerThreadId);
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

  // Auto Scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Fetch and hydrate past messages for specific thread
  const loadThread = useCallback(async (threadId: string, updateUrl = true) => {
    stop();

    if (threadCacheRef.current[threadId]) {
      setMessages(threadCacheRef.current[threadId]);
      changeActiveThreadId(threadId);
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
          parts: [{ type: "text" as const, text: m.content || "" }],
        }));

        threadCacheRef.current[threadId] = mappedMessages;
        setMessages(mappedMessages);
        changeActiveThreadId(threadId);

        if (updateUrl) {
          router.replace(`/dashboard/chat?threadId=${threadId}`);
        }
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
      toast.error("Conversation not found or failed to load.");
      changeActiveThreadId(null);
      setMessages([]);
      router.replace("/dashboard/chat");
    }
  }, [router, setMessages, stop, changeActiveThreadId]);

  // Sync thread when URL params change
  useEffect(() => {
    const threadId = searchParams.get("threadId");

    if (threadId) {
      if (threadId !== activeThreadIdRef.current) {
        loadThread(threadId, false);
      }
    } else {
      if (activeThreadIdRef.current !== null) {
        changeActiveThreadId(null);
        setMessages([]);
      }
    }
  }, [searchParams, loadThread, setMessages, changeActiveThreadId]);

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
    changeActiveThreadId(null);
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

  const handleDeleteAllThreads = async () => {
    if (threads.length === 0) return;
    if (!confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
      return;
    }
    try {
      await api.ask.deleteAllThreads();
      mutateThreads([], false);
      handleNewChat();
      toast.success("All conversations cleared.");
    } catch {
      toast.error("Failed to clear conversations.");
    }
  };

  const handleStartRename = () => {
    if (!activeThread) return;
    setTempTitle(activeThread.title || "Conversation");
    setRenaming(true);
  };

  const handleSaveRename = async () => {
    if (!activeThreadId || !tempTitle.trim()) {
      setRenaming(false);
      return;
    }
    try {
      await api.ask.renameThread(activeThreadId, tempTitle.trim());
      mutateThreads(
        threads.map((t) =>
          t.id === activeThreadId ? { ...t, title: tempTitle.trim() } : t
        ),
        false
      );
      toast.success("Thread renamed.");
    } catch {
      toast.error("Failed to rename thread.");
    } finally {
      setRenaming(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || status === "streaming") return;
    sendMessage({ text: inputText.trim() });
    setInputText("");
  };

  const handleSuggestionClick = (val: string) => {
    sendMessage({ text: val });
  };

  const suggestions = useMemo(() => [
    { label: "What did I write in my journal recently?", icon: Sparkles },
    { label: "Show me my pending inbox tasks", icon: Database },
    { label: "What did I do yesterday according to location?", icon: Calendar },
  ], []);

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => (t.title || "Conversation").toLowerCase().includes(q));
  }, [threads, threadSearch]);

  const isEmpty = messages.length === 0 && !error;

  return (
    <div className="flex h-full bg-background relative overflow-hidden select-none">
      
      {/* Thread History Drawer Overlay */}
      <Drawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Memory Threads"
        description="Search or manage your past conversations."
      >
        <div className="flex flex-col h-full space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleNewChat();
                setHistoryOpen(false);
              }}
              className="h-8.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </Button>
            {threads.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8.5 px-3 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5"
                onClick={handleDeleteAllThreads}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>

          {/* Search box */}
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
            <Input
              type="text"
              placeholder="Search chat history..."
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              className="h-8.5 pl-8 pr-7 text-xs rounded-lg border border-border bg-background/50 focus:bg-background focus-visible:ring-primary"
            />
            {threadSearch && (
              <button
                type="button"
                onClick={() => setThreadSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List scroll area */}
          <div className="flex-1 overflow-y-auto min-h-0 py-2 scrollbar-none space-y-1 pr-1">
            {loadingThreads ? (
              <div className="flex items-center justify-center py-12 text-xs text-muted-foreground/75 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-primary" />
                Loading history...
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 px-4 select-none">
                <Clock className="w-5 h-5 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider">
                  {threadSearch ? "No results found" : "No past chats"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredThreads.map((thread) => {
                  const isActive = activeThreadId === thread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        loadThread(thread.id);
                        setHistoryOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border border-transparent group",
                        isActive
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground/45")} />
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
      </Drawer>

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-background relative z-10 min-h-0">
        
        {/* Glow ambient aura background */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/[0.025] rounded-full blur-[120px] pointer-events-none" />

        {/* Chat Area Header */}
        <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-card/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {activeThreadId ? (
              renaming ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename();
                      if (e.key === "Escape") setRenaming(false);
                    }}
                    className="h-8 py-1 px-2 text-xs bg-zinc-900/60 border-zinc-700 max-w-[200px]"
                    autoFocus
                  />
                  <Button size="sm" variant="default" onClick={handleSaveRename} className="h-8 px-2.5 text-[10px] rounded-lg">
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRenaming(false)} className="h-8 px-2 text-[10px] rounded-lg">
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group min-w-0">
                  <h2 className="text-sm font-bold truncate text-foreground font-[var(--font-nunito)]">
                    {activeThread?.title || "Conversation"}
                  </h2>
                  <button
                    onClick={handleStartRename}
                    className="opacity-0 group-hover:opacity-100 text-[9px] text-muted-foreground/60 hover:text-foreground transition-all px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/40"
                  >
                    Rename
                  </button>
                </div>
              )
            ) : (
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2.5 font-[var(--font-nunito)]">
                Ask Debo
                <Badge variant="outline" className="border-primary/25 bg-primary/5 text-[9px] font-bold text-primary py-0 px-2 rounded-lg">
                  recall active
                </Badge>
              </h2>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
            {status === "streaming" && (
              <span className="flex items-center gap-1.5 text-primary text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                Thinking...
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="h-8.5 px-3 rounded-lg border border-border bg-card hover:bg-accent text-foreground hover:text-accent-foreground text-xs flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              History
            </Button>
          </div>
        </div>

        {/* Chat message viewport wrapper */}
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-background">
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-none"
          >
            {isEmpty ? (
              /* Greeting / Landing State */
              <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-6 select-none my-auto">
                <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                  <Activity className="size-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight font-[var(--font-nunito)]">
                    Ask your past memory OS
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                    Search notes, health stats, location traces, tasks, and connected app telemetry. Debo answers using backing citations.
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 gap-2">
                  {suggestions.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s.label)}
                        className="w-full text-left p-3.5 rounded-2xl border border-border hover:border-primary/20 bg-card hover:bg-primary/[0.015] hover:shadow-xs transition-all flex items-center gap-3 group text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                      >
                        <div className="size-7 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="size-3.5 text-muted-foreground/80 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="truncate">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message List */
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  const text = getMessageText(message);
                  const toolCalls = getToolCalls(message);

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full flex-col gap-1.5",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      {/* Avatar/Name indicator */}
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
                        {isUser ? (
                          <>
                            You <User className="size-2.5" />
                          </>
                        ) : (
                          <>
                            Debo <Activity className="size-2.5 text-primary" />
                          </>
                        )}
                      </span>

                      {/* Bubble */}
                      <div
                        className={cn(
                          "rounded-3xl px-5 py-3.5 text-sm leading-relaxed max-w-[85%] border shadow-xs transition-colors",
                          isUser
                            ? "bg-primary text-primary-foreground border-primary/10 shadow-[0_3px_0_#b53305]"
                            : "bg-card text-foreground border-border"
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap font-medium">{text}</p>
                        ) : (
                          <MarkdownRenderer content={text} />
                        )}

                        {/* Rendering Tool Logs inside assistant bubble */}
                        {!isUser && toolCalls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-border/40">
                            {toolCalls.map((tc: any, index: number) => {
                              const name = tc.name || tc.toolName || "";
                              const label = getToolNameReadable(name);
                              const isCompleted = tc.state === "result" || tc.result !== undefined;

                              return (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-[10px] font-semibold py-1 px-3 rounded-full flex items-center gap-1.5 bg-muted/40 border-border/40 text-muted-foreground/80 shadow-2xs"
                                >
                                  {isCompleted ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  ) : (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin text-primary shrink-0" />
                                  )}
                                  {label}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-xs max-w-3xl mx-auto">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span className="font-semibold leading-relaxed">
                      Error: {error.message || "Failed to parse message from stream."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Ingestion Area */}
          <div className="p-4 border-t border-border/40 bg-card/60 backdrop-blur-md shrink-0">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSend} className="relative flex items-center">
                <Input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask your past OS..."
                  disabled={status === "streaming"}
                  className="w-full pr-12 pl-4 py-6 rounded-3xl border-border bg-muted/30 focus-visible:bg-card focus-visible:ring-primary text-sm shadow-xs transition-all"
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {status === "streaming" ? (
                    <Button
                      type="button"
                      onClick={stop}
                      size="icon"
                      variant="ghost"
                      className="size-8.5 rounded-full text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <StopCircle className="size-4.5" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!inputText.trim()}
                      size="icon"
                      className="size-8.5 rounded-full bg-primary text-primary-foreground shadow-[0_2px_0_#b53305] hover:brightness-105 active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:active:translate-y-0 cursor-pointer"
                    >
                      <Send className="size-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
