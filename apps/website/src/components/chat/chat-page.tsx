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
import {
 MessageScrollerProvider,
 MessageScroller,
 MessageScrollerViewport,
 MessageScrollerContent,
 MessageScrollerItem,
 MessageScrollerButton,
} from "@/components/ui/message-scroller";
import {
 Message,
 MessageAvatar,
 MessageContent,
 MessageHeader,
 MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
 Attachment,
 AttachmentGroup,
 AttachmentMedia,
 AttachmentContent,
 AttachmentTitle,
 AttachmentDescription,
} from "@/components/ui/attachment";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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
 <h1 className="text-sm font-extrabold mt-3 mb-1 text-foreground" {...props}>
 {children}
 </h1>
 ),
 h2: ({ children, ...props }) => (
 <h2 className="text-xs font-bold mt-2.5 mb-1 text-foreground" {...props}>
 {children}
 </h2>
 ),
 h3: ({ children, ...props }) => (
 <h3 className="text-xs font-semibold mt-2 mb-0.5 text-foreground" {...props}>
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

function MessageListSkeleton() {
 return (
 <div className="max-w-3xl mx-auto flex flex-col gap-6">
 {/* Pulse skeleton block 1 (user message, right aligned) */}
 <Message align="end">
 <MessageContent>
 <MessageHeader>You</MessageHeader>
 <Bubble variant="default" align="end">
 <BubbleContent>
 <Skeleton className="h-5 w-48 bg-primary-foreground/20" />
 </BubbleContent>
 </Bubble>
 </MessageContent>
 <MessageAvatar>
 <Skeleton className="size-8 rounded-full" />
 </MessageAvatar>
 </Message>

 {/* Pulse skeleton block 2 (assistant message, left aligned) */}
 <Message align="start">
 <MessageAvatar>
 <Skeleton className="size-8 rounded-full" />
 </MessageAvatar>
 <MessageContent>
 <MessageHeader>Debo</MessageHeader>
 <Bubble variant="secondary" align="start">
 <BubbleContent className="space-y-2.5 w-[320px] md:w-[450px]">
 <Skeleton className="h-4 w-[90%]" />
 <Skeleton className="h-4 w-[75%]" />
 <Skeleton className="h-4 w-[40%]" />
 </BubbleContent>
 </Bubble>
 </MessageContent>
 </Message>
 </div>
 );
}

export function ChatPage({ threadId: initialThreadId }: { threadId?: string }) {
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

 const [isLoadingMessages, setIsLoadingMessages] = useState(false);

 const [historyOpen, setHistoryOpen] = useState(true);
 const [threadSearch, setThreadSearch] = useState("");
 const [renaming, setRenaming] = useState(false);
 const [tempTitle, setTempTitle] = useState("");
 const [inputText, setInputText] = useState("");

 const [selectedSource, setSelectedSource] = useState<any>(null);
 const [selectedToolCall, setSelectedToolCall] = useState<any>(null);
 const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);

 const handleSourceClick = async (sourceId: string) => {
 if (!sourceId) return;
 setLoadingSourceId(sourceId);
 try {
 const data = await api.sources.get(sourceId);
 setSelectedSource(data);
 setSelectedToolCall(null);
 } catch {
 toast.error("Failed to load source details.");
 } finally {
 setLoadingSourceId(null);
 }
 };

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
 window.history.replaceState(null, "", `/dashboard/chat/${headerThreadId}`);
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
 stop();
 changeActiveThreadId(threadId);

 if (threadCacheRef.current[threadId]) {
 setMessages(threadCacheRef.current[threadId]);
 if (updateUrl) {
 router.replace(`/dashboard/chat/${threadId}`);
 }
 return;
 }

 setIsLoadingMessages(true);
 setMessages([]);

 try {
 let data = null;
 let retries = 2;
 while (retries >= 0) {
 try {
 data = await api.ask.getThread(threadId);
 if (data) break;
 } catch (err: any) {
 if (retries > 0 && err.status === 404) {
 retries--;
 await new Promise((resolve) => setTimeout(resolve, 500));
 continue;
 }
 throw err;
 }
 retries--;
 }

 if (data) {
 const mappedMessages = data.messages.map((m: any) => ({
 id: m.id,
 role: m.role as "user" | "assistant",
 content: m.content || "",
 parts: [{ type: "text" as const, text: m.content || "" }],
 citations: m.citations || [],
 }));

 threadCacheRef.current[threadId] = mappedMessages;
 setMessages(mappedMessages);

 if (updateUrl) {
 router.replace(`/dashboard/chat/${threadId}`);
 }
 }
 } catch (err) {
 console.error("Failed to load thread:", err);
 toast.error("Conversation not found or failed to load.");
 changeActiveThreadId(null);
 setMessages([]);
 router.replace("/dashboard/chat");
 } finally {
 setIsLoadingMessages(false);
 }
 }, [router, setMessages, stop, changeActiveThreadId]);

 // Sync thread when initialThreadId prop changes
 useEffect(() => {
 if (initialThreadId) {
 if (initialThreadId !== activeThreadIdRef.current) {
 loadThread(initialThreadId, false);
 }
 } else {
 if (activeThreadIdRef.current !== null) {
 changeActiveThreadId(null);
 setMessages([]);
 }
 }
 }, [initialThreadId, loadThread, setMessages, changeActiveThreadId]);

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

 const isEmpty = messages.length === 0 && !isLoadingMessages && !error;

 const lastMessage = messages[messages.length - 1];
 const showThinkingSkeleton =
 (status === "submitted" || status === "streaming") &&
 (!lastMessage || lastMessage.role === "user");

 return (
 <div className="flex h-full bg-background relative overflow-hidden select-none">
 
 {/* Glow ambient aura background */}
 <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/[0.025] rounded-full blur-[120px] pointer-events-none z-0" />

 {/* Collapsible Left Sidebar for Thread History */}
 {historyOpen && (
 <div className="w-80 border-r border-border/40 bg-card/10 backdrop-blur-md flex flex-col shrink-0 z-20 relative h-full">
 <div className="flex flex-col h-full p-4 space-y-4">
 <div className="flex items-center justify-between">
 <Button
 variant="outline"
 size="sm"
 onClick={handleNewChat}
 className="h-8.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-xl hover:border-primary/20 hover:text-primary transition-all"
 >
 <Plus className="w-3.5 h-3.5" />
 New Chat
 </Button>
 {threads.length > 0 && (
 <Button
 size="sm"
 variant="ghost"
 className="h-8.5 px-3 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5 rounded-xl"
 onClick={handleDeleteAllThreads}
 >
 <Trash2 className="w-3.5 h-3.5" />
 Clear All
 </Button>
 )}
 </div>

 {/* Search Box */}
 <div className="relative group">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
 <Input
 type="text"
 placeholder="Search chat history..."
 value={threadSearch}
 onChange={(e) => setThreadSearch(e.target.value)}
 className="h-8.5 pl-8 pr-7 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus-visible:ring-primary"
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

 {/* Thread List Scroll Area */}
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
 onClick={() => loadThread(thread.id)}
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
 </div>
 )}

 {/* Main Chat Column */}
 <div className="flex-1 flex flex-col min-w-0 h-full bg-background relative z-10 min-h-0">
 
 {/* Chat Area Header */}
 <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-card/40 backdrop-blur-md shrink-0">
 <div className="flex items-center gap-3 min-w-0">
 <Button
 variant="outline"
 size="icon"
 onClick={() => setHistoryOpen(!historyOpen)}
 className={cn(
 "h-8 w-8 rounded-lg cursor-pointer transition-colors border-border/40 bg-card hover:bg-accent",
 historyOpen && "border-primary/20 text-primary bg-primary/5"
 )}
 >
 <Clock className="w-4 h-4" />
 </Button>

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
 <h2 className="text-sm font-bold truncate text-foreground">
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
 <h2 className="text-sm font-bold text-foreground flex items-center gap-2.5">
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
 </div>
 </div>

 {/* Chat message viewport wrapper */}
 <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-background">
 <MessageScrollerProvider autoScroll>
 <MessageScroller className="size-full">
 <MessageScrollerViewport className="flex-1 p-4 md:p-6">
 <MessageScrollerContent className="max-w-3xl mx-auto flex flex-col gap-6">
 {isLoadingMessages ? (
 <MessageListSkeleton />
 ) : isEmpty ? (
 /* Greeting / Landing State */
 <div className="flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-6 select-none my-auto py-12">
 <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
 <Activity className="size-8 text-primary" />
 </div>
 <div className="space-y-2">
 <h3 className="text-lg font-bold text-foreground tracking-tight">
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
 <>
 {messages.map((message, messageIndex) => {
 const isUser = message.role === "user";
 const text = getMessageText(message);
 const toolCalls = getToolCalls(message);
 const isLastMessage = messageIndex === messages.length - 1;

 const messageCitations = (message as any).citations || [];
 const hasCitations = messageCitations.length > 0;
 const hasToolCalls = toolCalls.length > 0;

 // Conditionally show assistant message container only if it has content, toolcalls, citations or is currently streaming
 const isStreaming = status === "submitted" || status === "streaming";
 const showMessage = isUser || text.trim() || hasToolCalls || hasCitations || (isLastMessage && isStreaming);

 if (!showMessage) return null;

 return (
 <MessageScrollerItem
 key={message.id}
 messageId={message.id}
 scrollAnchor={isUser}
 >
 <Message align={isUser ? "end" : "start"}>
 <MessageAvatar>
 <Avatar className="size-8">
 <AvatarImage src="" alt={isUser ? "You" : "Debo"} />
 <AvatarFallback className={isUser ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary text-xs font-semibold"}>
 {isUser ? "U" : "DB"}
 </AvatarFallback>
 </Avatar>
 </MessageAvatar>
 <MessageContent>
 <MessageHeader>
 {isUser ? "You" : "Debo"}
 </MessageHeader>
 {isUser ? (
 <Bubble variant="default" align="end">
 <BubbleContent>
 <p className="whitespace-pre-wrap font-medium text-white">{text}</p>
 </BubbleContent>
 </Bubble>
 ) : (
 (text.trim() || (isLastMessage && isStreaming)) && (
 <Bubble variant="secondary" align="start">
 <BubbleContent>
 {text.trim() ? (
 <MarkdownRenderer content={text} />
 ) : (
 <div className="flex flex-col gap-2.5 py-1 min-w-[200px]">
 <span className="shimmer text-muted-foreground">Thinking…</span>
 </div>
 )}
 </BubbleContent>
 </Bubble>
 )
 )}

 {/* Citations (Sources) */}
 {(() => {
 const messageCitations = (message as any).citations || [];
 if (messageCitations.length === 0) return null;
 return (
 <div className="flex flex-col gap-1.5 mt-2">
 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
 Sources
 </span>
 <AttachmentGroup>
 {messageCitations.map((cit: any) => (
 <Attachment
 key={cit.id}
 state="done"
 size="sm"
 className="cursor-pointer hover:border-primary/45 transition-colors"
 onClick={() => handleSourceClick(cit.sourceId || cit.id)}
 >
 <AttachmentMedia variant="icon">
 <Database className="size-3.5 text-primary" />
 </AttachmentMedia>
 <AttachmentContent>
 <AttachmentTitle>{cit.sourceTitle || "Source"}</AttachmentTitle>
 <AttachmentDescription>{cit.sourceType}</AttachmentDescription>
 </AttachmentContent>
 </Attachment>
 ))}
 </AttachmentGroup>
 </div>
 );
 })()}

 {/* Rendering Tool Logs inside assistant message */}
 {!isUser && toolCalls.length > 0 && (
 <div className="flex flex-col gap-1.5 mt-2">
 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
 Actions
 </span>
 <div className="flex flex-wrap gap-2">
 {toolCalls.map((tc: any, index: number) => {
 const name = tc.name || tc.toolName || "";
 const label = getToolNameReadable(name);
 const toolResults = Array.isArray(message.parts)
 ? message.parts.filter((p: any) => p.type === "tool-result")
 : [];
 const correspondingResult = toolResults.find((tr: any) => (tr as any).toolCallId === tc.toolCallId);
 const resultData = tc.result || (correspondingResult as any)?.result;
 const isCompleted = tc.state === "result" || tc.result !== undefined || !!correspondingResult;

 return (
 <Attachment
 key={index}
 state={isCompleted ? "done" : "processing"}
 size="sm"
 className={cn(
 "transition-colors",
 isCompleted && "cursor-pointer hover:border-emerald-500/40"
 )}
 onClick={() => {
 if (isCompleted) {
 setSelectedToolCall({
 name: label,
 args: tc.args,
 result: resultData,
 });
 setSelectedSource(null);
 }
 }}
 >
 <AttachmentMedia variant="icon">
 {isCompleted ? (
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
 ) : (
 <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
 )}
 </AttachmentMedia>
 <AttachmentContent>
 <AttachmentTitle>{label}</AttachmentTitle>
 <AttachmentDescription>{name}</AttachmentDescription>
 </AttachmentContent>
 </Attachment>
 );
 })}
 </div>
 </div>
 )}
 </MessageContent>
 {/* Avatar rendered at start of Message for correct placement */}
 </Message>
 </MessageScrollerItem>
 );
 })}

 {showThinkingSkeleton && (
 <MessageScrollerItem messageId="thinking" scrollAnchor>
 <Message align="start">
 <MessageAvatar>
 <Avatar className="size-8">
 <AvatarImage src="" alt="Debo" />
 <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
 DB
 </AvatarFallback>
 </Avatar>
 </MessageAvatar>
 <MessageContent>
 <MessageHeader>Debo</MessageHeader>
 <Bubble variant="secondary" align="start">
 <BubbleContent>
 <div className="flex flex-col gap-2.5 py-1 min-w-[200px]">
 <span className="shimmer text-muted-foreground">Thinking…</span>
 </div>
 </BubbleContent>
 </Bubble>
 </MessageContent>
 </Message>
 </MessageScrollerItem>
 )}

 {error && (
 <Marker variant="separator">
 <MarkerContent className="text-destructive font-semibold flex items-center gap-1.5">
 <AlertTriangle className="size-3.5" />
 Error: {error.message || "Failed to parse message from stream."}
 </MarkerContent>
 </Marker>
 )}
 </>
 )}
 </MessageScrollerContent>
 </MessageScrollerViewport>
 <MessageScrollerButton />
 </MessageScroller>
 </MessageScrollerProvider>

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

 {/* Collapsible Details Panel on the right */}
 {(selectedSource || selectedToolCall) && (
 <div className="w-[420px] border-l border-border/40 bg-card/15 backdrop-blur-lg flex flex-col shrink-0 overflow-hidden h-full z-20 relative">
 {/* Header */}
 <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-card/40 backdrop-blur-md shrink-0">
 <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
 {selectedSource ? "Source details" : "Action details"}
 </h3>
 <Button
 size="icon"
 variant="ghost"
 onClick={() => {
 setSelectedSource(null);
 setSelectedToolCall(null);
 }}
 className="h-8 w-8 rounded-lg cursor-pointer hover:bg-accent/40"
 >
 <X className="w-4 h-4" />
 </Button>
 </div>

 {/* Details Content */}
 <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0 select-text">
 {selectedSource && (
 <div className="space-y-4">
 <div>
 <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
 {selectedSource.type || "Source"}
 </span>
 <h2 className="text-base font-bold text-foreground mt-2">
 {selectedSource.title || "Untitled Source"}
 </h2>
 <div className="text-[10px] text-muted-foreground mt-1">
 Created: {new Date(selectedSource.createdAt).toLocaleString()}
 </div>
 </div>
 <hr className="border-border/40" />
 <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap select-text selection:bg-primary/25 bg-muted/10 p-4 rounded-2xl border border-border/20 font-mono">
 {selectedSource.plainText || "No content available."}
 </div>
 </div>
 )}

 {selectedToolCall && (
 <div className="space-y-4">
 <div>
 <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
 Action Executed
 </span>
 <h2 className="text-base font-bold text-foreground mt-2">
 {selectedToolCall.name}
 </h2>
 </div>
 <hr className="border-border/40" />
 <div className="space-y-4">
 <div>
 <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 mb-1.5">Arguments</h4>
 <pre className="text-[10px] bg-muted/40 p-3 rounded-xl border border-border/20 overflow-x-auto text-foreground font-mono">
 {JSON.stringify(selectedToolCall.args, null, 2)}
 </pre>
 </div>
 <div>
 <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 mb-1.5">Output</h4>
 <pre className="text-[10px] bg-muted/40 p-3 rounded-xl border border-border/20 overflow-x-auto text-foreground font-mono">
 {typeof selectedToolCall.result === "string"
 ? selectedToolCall.result
 : JSON.stringify(selectedToolCall.result, null, 2)}
 </pre>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 </div>
 );
}

export function ChatSkeleton() {
 return (
 <div className="flex h-full bg-background relative overflow-hidden select-none">
 {/* Main Chat Column */}
 <div className="flex-1 flex flex-col min-w-0 h-full bg-background relative z-10 min-h-0">
 {/* Chat Area Header */}
 <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-card/40 backdrop-blur-md shrink-0">
 <div className="flex items-center gap-3">
 <Skeleton className="h-5 w-20" />
 <Skeleton className="h-4 w-16" />
 </div>
 <Skeleton className="h-8.5 w-20 rounded-xl" />
 </div>

 {/* Messages Viewport */}
 <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
 <MessageListSkeleton />
 </div>

 {/* Input Bar Outline */}
 <div className="p-4 border-t border-border/40 bg-card/10 shrink-0">
 <Skeleton className="max-w-3xl mx-auto h-12 rounded-3xl" />
 </div>
 </div>
 </div>
 );
}
