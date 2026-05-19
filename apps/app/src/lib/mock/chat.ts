import type { ChatMessage } from "../types";

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "chat-001",
    role: "user",
    content: "What did I promise Raj?",
  },
  {
    id: "chat-002",
    role: "assistant",
    content:
      "You promised Raj that you would send the finalized Q4 budget allocation by Friday before the board meeting. The budget covers a 40/30/30 split across digital, events, and content marketing.",
    sources: [
      {
        id: "src-001",
        sourceType: "voice",
        title: "Marketing Sync Follow-up",
        excerpt:
          "I promised Raj I'll send the Q4 budget allocation by Friday before the board meeting.",
        date: "2026-05-17",
        confidence: "strong",
      },
      {
        id: "src-002",
        sourceType: "email",
        title: "Budget Follow-up from Raj",
        excerpt:
          "Raj sent a follow-up asking for the revised Q4 allocation with updated digital spend numbers. Board meeting moved to Monday.",
        date: "2026-05-17",
        confidence: "strong",
      },
      {
        id: "src-003",
        sourceType: "file",
        title: "Q4 Allocation Draft",
        excerpt:
          "Proposed budget breakdown across marketing channels with projected ROI for each category.",
        date: "2026-05-15",
        confidence: "partial",
      },
    ],
    suggestedActions: [
      "Create task for Raj follow-up",
      "Draft message to Raj",
      "Open Marketing Sync voice note",
      "View Q4 Allocation Draft",
    ],
  },
  {
    id: "chat-003",
    role: "user",
    content: "Draft a short message to Raj about the budget.",
  },
  {
    id: "chat-004",
    role: "assistant",
    content:
      'Here is a draft you can send to Raj:\n\n> Hi Raj, following up on our conversation — I\'m finalizing the Q4 budget allocation (40% digital, 30% events, 30% content) and will have it ready before the board meeting on Monday. I\'ll send the updated numbers by end of day Friday.\n\nShall I adjust the tone or add any details?',
    sources: [
      {
        id: "src-001",
        sourceType: "voice",
        title: "Marketing Sync Follow-up",
        excerpt:
          "Discussed Q4 budget allocation. 40% digital, 30% events, 30% content.",
        date: "2026-05-17",
        confidence: "strong",
      },
    ],
    suggestedActions: [
      "Copy message",
      "Make it shorter",
      "Add more detail",
      "Save as memory",
    ],
  },
];
