"use client";

import { useState } from "react";
import { MailSidebar } from "./mail-sidebar";
import { MailThreadList } from "./mail-thread-list";
import { MailThreadDetail } from "./mail-thread-detail";
import { MailComposeModal } from "./mail-compose-modal";
import { MailAddressCard } from "./mail-address-card";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

export type MailFolder = "inbox" | "sent" | "starred" | "archived" | "drafts" | "memory";

export interface MailThread {
  id: string;
  subject: string;
  lastMessageAt: string | null;
  createdAt: string;
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

// Mock data for MVP
const MOCK_ADDRESS = {
  username: "shaswat",
  address: "shaswat@debo.life",
};

const MOCK_THREADS: MailThread[] = [
  {
    id: "thread-1",
    subject: "Q4 budget follow-up",
    lastMessageAt: "2026-05-19T10:30:00Z",
    createdAt: "2026-05-19T10:30:00Z",
    lastMessage: {
      id: "msg-1",
      senderAddress: "raj@debo.life",
      senderUserId: "user-raj",
      body: "Hey, wanted to follow up on the Q4 budget numbers we discussed. Can you review the attached memory?",
      status: "delivered",
      isMemorySaved: 0,
      createdAt: "2026-05-19T10:30:00Z",
    },
    participant: { role: "recipient", lastReadAt: null, archivedAt: null, deletedAt: null },
  },
  {
    id: "thread-2",
    subject: "Landing page revamp idea",
    lastMessageAt: "2026-05-18T15:00:00Z",
    createdAt: "2026-05-18T15:00:00Z",
    lastMessage: {
      id: "msg-2",
      senderAddress: "dev@debo.life",
      senderUserId: "user-dev",
      body: "I have some ideas for the landing page redesign. Let me know when you're free to discuss.",
      status: "read",
      isMemorySaved: 1,
      createdAt: "2026-05-18T15:00:00Z",
    },
    participant: { role: "recipient", lastReadAt: "2026-05-18T16:00:00Z", archivedAt: null, deletedAt: null },
  },
  {
    id: "thread-3",
    subject: "Internal test mail",
    lastMessageAt: "2026-05-17T09:00:00Z",
    createdAt: "2026-05-17T09:00:00Z",
    lastMessage: {
      id: "msg-3",
      senderAddress: "shaswat@debo.life",
      senderUserId: "user-shaswat",
      body: "Testing the Debo Mail system. This is an internal message.",
      status: "read",
      isMemorySaved: 0,
      createdAt: "2026-05-17T09:00:00Z",
    },
    participant: { role: "sender", lastReadAt: "2026-05-17T09:01:00Z", archivedAt: null, deletedAt: null },
  },
];

const MOCK_MESSAGES: Record<string, MailMessage[]> = {
  "thread-1": [
    {
      id: "msg-1",
      threadId: "thread-1",
      senderUserId: "user-raj",
      senderAddress: "raj@debo.life",
      recipientUserId: "user-shaswat",
      recipientAddress: "shaswat@debo.life",
      subject: "Q4 budget follow-up",
      body: "Hey, wanted to follow up on the Q4 budget numbers we discussed. Can you review the attached memory?",
      status: "delivered",
      isMemorySaved: 0,
      sourceId: null,
      createdAt: "2026-05-19T10:30:00Z",
      readAt: null,
    },
  ],
  "thread-2": [
    {
      id: "msg-2",
      threadId: "thread-2",
      senderUserId: "user-dev",
      senderAddress: "dev@debo.life",
      recipientUserId: "user-shaswat",
      recipientAddress: "shaswat@debo.life",
      subject: "Landing page revamp idea",
      body: "I have some ideas for the landing page redesign. Let me know when you're free to discuss. I've been thinking about a more minimal approach with the Debo green accent.",
      status: "read",
      isMemorySaved: 1,
      sourceId: "source-1",
      createdAt: "2026-05-18T15:00:00Z",
      readAt: "2026-05-18T16:00:00Z",
    },
  ],
  "thread-3": [
    {
      id: "msg-3",
      threadId: "thread-3",
      senderUserId: "user-shaswat",
      senderAddress: "shaswat@debo.life",
      recipientUserId: "user-dev",
      recipientAddress: "dev@debo.life",
      subject: "Internal test mail",
      body: "Testing the Debo Mail system. This is an internal message.",
      status: "read",
      isMemorySaved: 0,
      sourceId: null,
      createdAt: "2026-05-17T09:00:00Z",
      readAt: "2026-05-17T09:01:00Z",
    },
  ],
};

export function MailShell() {
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const threads = MOCK_THREADS.filter((t) => {
    if (folder === "sent") return t.participant?.role === "sender";
    if (folder === "archived") return t.participant?.archivedAt;
    if (folder === "starred") return false; // placeholder
    if (folder === "drafts") return false; // placeholder
    if (folder === "memory") return t.lastMessage?.isMemorySaved === 1;
    return t.participant?.role === "recipient" && !t.participant?.archivedAt && !t.participant?.deletedAt;
  });

  const threadMessages = selectedThread ? MOCK_MESSAGES[selectedThread] || [] : [];
  const selectedThreadData = threads.find((t) => t.id === selectedThread);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Desktop: 3-panel layout */}
      <div className="hidden md:flex w-full">
        {/* Left: Folders */}
        <div className="w-[220px] border-r border-border shrink-0 flex flex-col">
          <div className="p-3">
            <Button
              onClick={() => setComposeOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-[0_3px_0_var(--border)]"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </div>
          <MailAddressCard address={MOCK_ADDRESS} />
          <MailSidebar folder={folder} onFolderChange={setFolder} />
        </div>

        {/* Middle: Thread list */}
        <div className="w-[340px] border-r border-border shrink-0">
          <MailThreadList
            threads={threads}
            selectedId={selectedThread}
            onSelect={setSelectedThread}
          />
        </div>

        {/* Right: Thread detail */}
        <div className="flex-1 min-w-0">
          {selectedThread && selectedThreadData ? (
            <MailThreadDetail
              thread={selectedThreadData}
              messages={threadMessages}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose a thread from the list to read it</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stacked views */}
      <div className="md:hidden flex flex-col w-full">
        {mobileView === "list" || !selectedThread ? (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
              <Button
                onClick={() => setComposeOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              >
                <PenSquare className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </div>
            <MailAddressCard address={MOCK_ADDRESS} />
            <MailSidebar folder={folder} onFolderChange={setFolder} />
            <MailThreadList
              threads={threads}
              selectedId={selectedThread}
              onSelect={(id) => {
                setSelectedThread(id);
                setMobileView("detail");
              }}
            />
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
                &larr; Back to inbox
              </button>
            </div>
            <MailThreadDetail
              thread={selectedThreadData!}
              messages={threadMessages}
            />
          </div>
        )}
      </div>

      <MailComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}
