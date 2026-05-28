"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PenSquare, ShieldCheck } from "lucide-react";
import { MailSidebar } from "./mail-sidebar";
import { MailThreadList } from "./mail-thread-list";
import { MailThreadDetail, type MailThreadContext } from "./mail-thread-detail";
import { MailComposeModal } from "./mail-compose-modal";
import { MailAddressCard } from "./mail-address-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export type MailFolder = "inbox" | "sent" | "starred" | "archived" | "drafts" | "memory";

export interface MailAddress {
  username: string;
  address: string;
}

export interface MailThread {
  id: string;
  subject: string;
  lastMessageAt: string | null;
  createdAt: string;
  messageCount?: number;
  memorySavedCount?: number;
  lastMessage?: {
    id: string;
    senderAddress: string;
    senderUserId: string;
    body: string;
    status: string;
    isMemorySaved: number;
    createdAt: string;
  } | null;
  participant?: {
    role: string;
    lastReadAt: string | null;
    archivedAt: string | null;
    deletedAt: string | null;
  };
}

export interface MailMessage {
  id: string;
  threadId: string;
  senderUserId: string;
  senderAddress: string;
  recipientUserId: string;
  recipientAddress: string;
  subject: string;
  body: string;
  status: string;
  isMemorySaved: number;
  sourceId: string | null;
  createdAt: string;
  readAt: string | null;
}

type ThreadDetailResponse = {
  thread: MailThread;
  messages: MailMessage[];
  context: MailThreadContext;
};

export function MailShell() {
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [address, setAddress] = useState<MailAddress | null>(null);
  const [threads, setThreads] = useState<MailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadDetail, setThreadDetail] = useState<ThreadDetailResponse | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddress = useCallback(async () => {
    const result = await api.mail.getAddress();
    setAddress(result);
  }, []);

  const loadThreads = useCallback(async (nextFolder = folder) => {
    setLoadingThreads(true);
    setError(null);

    try {
      const result = await api.mail.listThreads(nextFolder);
      setThreads(result.threads ?? []);
    } catch {
      setError("Could not load Debo Mail.");
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  }, [folder]);

  const loadThreadDetail = useCallback(async (threadId: string) => {
    setLoadingDetail(true);
    setError(null);

    try {
      const detail = await api.mail.getThread(threadId);
      setThreadDetail(detail);
      await api.mail.markRead(threadId);
      await loadThreads();
    } catch {
      setError("Could not load this thread.");
      setThreadDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [loadThreads]);

  useEffect(() => {
    loadAddress().catch(() => setError("Could not load your Debo Mail address."));
  }, [loadAddress]);

  useEffect(() => {
    setSelectedThread(null);
    setThreadDetail(null);
    setMobileView("list");
    loadThreads(folder);
  }, [folder, loadThreads]);

  useEffect(() => {
    if (loadingThreads) return;

    const firstThreadId = threads[0]?.id ?? null;
    if (!selectedThread && firstThreadId) {
      setSelectedThread(firstThreadId);
      return;
    }

    if (selectedThread && !threads.some((thread) => thread.id === selectedThread)) {
      setSelectedThread(firstThreadId);
    }
  }, [loadingThreads, selectedThread, threads]);

  useEffect(() => {
    if (!selectedThread) {
      setThreadDetail(null);
      return;
    }

    loadThreadDetail(selectedThread);
  }, [selectedThread, loadThreadDetail]);

  const folderCounts = useMemo(() => {
    const inbox = threads.filter((thread) => thread.participant?.role === "recipient" && !thread.participant?.lastReadAt).length;
    return { inbox };
  }, [threads]);

  const handleThreadSelect = (id: string) => {
    setSelectedThread(id);
    setMobileView("detail");
  };

  const handleSent = async (threadId?: string) => {
    await loadThreads(folder);
    if (threadId) setSelectedThread(threadId);
  };

  const handleReply = async (body: string) => {
    if (!threadDetail || !address) return;

    const lastInbound = [...threadDetail.messages]
      .reverse()
      .find((message) => message.senderAddress !== address.address);
    const recipient = lastInbound?.senderAddress ?? threadDetail.context.participants.find((participant) => !participant.isYou)?.address;
    if (!recipient) return;

    const result = await api.mail.send({
      to: recipient,
      subject: threadDetail.thread.subject,
      body,
      threadId: threadDetail.thread.id,
    });

    await loadThreadDetail(result.threadId ?? threadDetail.thread.id);
  };

  const handleArchive = async () => {
    if (!selectedThread) return;
    await api.mail.archiveThread(selectedThread);
    await loadThreads(folder);
  };

  const handleDelete = async () => {
    if (!selectedThread) return;
    await api.mail.deleteThread(selectedThread);
    setSelectedThread(null);
    await loadThreads(folder);
  };

  const handleSaveToMemory = async (messageId: string) => {
    await api.mail.saveToMemory(messageId);
    if (selectedThread) await loadThreadDetail(selectedThread);
  };

  const sidebar = (
    <>
      <div className="p-3">
        <Button
          onClick={() => setComposeOpen(true)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-[0_3px_0_var(--border)]"
        >
          <PenSquare className="w-4 h-4 mr-2" />
          Compose
        </Button>
      </div>
      {address && <MailAddressCard address={address} />}
      <div className="mx-3 mb-2 rounded-xl border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Internal only
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Debo Mail delivers only between claimed @debo.life addresses. External email is blocked.
        </p>
      </div>
      <MailSidebar folder={folder} onFolderChange={setFolder} counts={folderCounts} />
    </>
  );

  const list = (
    <MailThreadList
      threads={threads}
      selectedId={selectedThread}
      loading={loadingThreads}
      onSelect={handleThreadSelect}
    />
  );

  const detail = selectedThread && threadDetail ? (
    <MailThreadDetail
      thread={threadDetail.thread}
      messages={threadDetail.messages}
      context={threadDetail.context}
      currentAddress={address?.address ?? ""}
      loading={loadingDetail}
      onArchive={handleArchive}
      onDelete={handleDelete}
      onReply={handleReply}
      onSaveToMemory={handleSaveToMemory}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <p className="text-lg font-medium">{loadingThreads ? "Loading mail" : "Select a conversation"}</p>
        <p className="text-sm mt-1">
          {loadingThreads ? "Fetching your internal Debo threads" : "Choose a thread from the list to read it"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="hidden md:flex w-full">
        <div className="w-[220px] border-r border-border shrink-0 flex flex-col">{sidebar}</div>
        <div className="w-[340px] border-r border-border shrink-0">
          {error && <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</div>}
          {list}
        </div>
        <div className="flex-1 min-w-0">{detail}</div>
      </div>

      <div className="md:hidden flex flex-col w-full">
        {mobileView === "list" || !selectedThread ? (
          <div className="flex flex-col h-full">
            {sidebar}
            {error && <div className="border-y border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</div>}
            {list}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-border">
              <button
                onClick={() => {
                  setSelectedThread(null);
                  setMobileView("list");
                }}
                className="text-sm text-primary font-medium px-2 py-1"
              >
                Back to inbox
              </button>
            </div>
            {detail}
          </div>
        )}
      </div>

      <MailComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={(message) => api.mail.send(message)}
        onSent={handleSent}
      />
    </div>
  );
}
