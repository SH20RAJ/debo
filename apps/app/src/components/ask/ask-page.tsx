"use client";

import { useState, useCallback } from "react";
import { ChatArea, type Message } from "./chat-area";
import { Composer } from "./composer";
import { SourceRail } from "./source-rail";
import { type SourceData } from "./source-citation";
import {
  ListPlus,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

// Pre-filled demo conversation
const DEMO_SOURCES: SourceData[] = [
  {
    id: "1",
    type: "voice",
    label: "Voice note",
    detail: "Marketing Sync · 0:12",
    confidence: "strong",
    excerpt:
      "I promised Raj I'll send the finalized Q4 budget allocation by Friday before the board meeting.",
    timestamp: "0:12",
    people: ["Raj"],
    relatedTasks: ["Send Q4 budget to Raj"],
  },
  {
    id: "2",
    type: "task",
    label: "Task",
    detail: "Q4 Budget Follow-up",
    confidence: "strong",
  },
];

const DEMO_ACTIONS = [
  { id: "draft-message", label: "Draft message to Raj", icon: MessageSquare },
  { id: "create-task", label: "Create task", icon: ListPlus },
  { id: "open-source", label: "Open source", icon: ExternalLink },
];

const DEMO_MESSAGES: Message[] = [
  {
    id: "demo-user",
    role: "user",
    content: "What did I promise Raj?",
  },
  {
    id: "demo-assistant",
    role: "assistant",
    content:
      "You promised Raj that you would send the finalized Q4 budget allocation by Friday before the board meeting.",
    sources: DEMO_SOURCES,
    suggestedActions: DEMO_ACTIONS,
  },
];

// Mock responses for new user messages
const MOCK_RESPONSES: Record<
  string,
  { content: string; sources: SourceData[]; actions?: typeof DEMO_ACTIONS }
> = {
  default: {
    content:
      "I searched your memories but couldn't find a specific source for that. I can still help reason from the current conversation, but I won't treat it as memory. Try saving a note or connecting a source first.",
    sources: [],
  },
  ideas: {
    content:
      "You saved several ideas about Debo across 3 journal entries: the concept of a private memory OS, source-backed trust as the main differentiator, and the capture-process-ask-answer loop. You also sketched an early product vision in a voice note last Thursday.",
    sources: [
      {
        id: "s1",
        type: "journal",
        label: "Journal",
        detail: "Product Vision · May 12",
        confidence: "strong",
        excerpt: "Debo should feel like your private AI memory desk...",
        people: [],
      },
      {
        id: "s2",
        type: "voice",
        label: "Voice note",
        detail: "Late Night Ideas · Thursday",
        confidence: "partial",
        timestamp: "2:34",
      },
    ],
    actions: [
      { id: "create-task", label: "Create task", icon: ListPlus },
      { id: "draft-message", label: "Draft message", icon: MessageSquare },
    ],
  },
  summary: {
    content:
      "Over the last 7 days you captured 12 memories: 4 journal entries, 3 voice notes, 2 uploaded PDFs, and 3 saved links. You mentioned Raj 5 times, discussed Q4 budget planning 3 times, and had 2 tasks extracted. Your most active day was Tuesday with 4 captures.",
    sources: [
      {
        id: "s1",
        type: "journal",
        label: "Journal",
        detail: "Weekly activity",
        confidence: "strong",
      },
    ],
    actions: [
      { id: "create-task", label: "Create task", icon: ListPlus },
      { id: "open-source", label: "Open source", icon: ExternalLink },
    ],
  },
};

function getMockResponse(input: string): {
  content: string;
  sources: SourceData[];
  actions?: typeof DEMO_ACTIONS;
} {
  const lower = input.toLowerCase();
  if (lower.includes("idea") || lower.includes("debo"))
    return MOCK_RESPONSES.ideas;
  if (
    lower.includes("summar") ||
    lower.includes("7 day") ||
    lower.includes("week")
  )
    return MOCK_RESPONSES.summary;
  return MOCK_RESPONSES.default;
}

export function AskPage() {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [activeSources, setActiveSources] = useState<SourceData[]>(
    DEMO_SOURCES
  );
  const [isResponding, setIsResponding] = useState(false);

  const handleSend = useCallback((text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const typingMsg: Message = {
      id: `typing-${Date.now()}`,
      role: "assistant",
      content: "",
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setIsResponding(true);

    setTimeout(() => {
      const response = getMockResponse(text);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.content,
        sources: response.sources,
        suggestedActions: response.actions,
      };

      setMessages((prev) =>
        prev.filter((m) => !m.isTyping).concat(assistantMsg)
      );
      setActiveSources(response.sources);
      setIsResponding(false);
    }, 1000);
  }, []);

  const handlePromptClick = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend]
  );

  return (
    <div className="flex h-full">
      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea messages={messages} onPromptClick={handlePromptClick} />
        <Composer onSend={handleSend} isResponding={isResponding} />
      </div>

      {/* Right source rail */}
      <SourceRail sources={activeSources} />
    </div>
  );
}
