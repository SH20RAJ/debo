import type { OpenLoop } from "../types";

export const OPEN_LOOPS: OpenLoop[] = [
  {
    id: "loop-001",
    text: "You promised Raj the Q4 budget by Friday.",
    source: "Marketing Sync Follow-up",
    sourceType: "voice",
    actions: ["Create task", "Draft message", "Open source", "Dismiss"],
  },
  {
    id: "loop-002",
    text: "You saved 5 product ideas but didn't tag them.",
    source: "Product Ideas for Debo",
    sourceType: "journal",
    actions: ["Tag now", "Ask about this", "Open source", "Dismiss"],
  },
  {
    id: "loop-003",
    text: 'You mentioned "landing page revamp" in 3 places.',
    source: "Landing Page Revamp Notes",
    sourceType: "journal",
    actions: ["View all", "Create project", "Ask about this", "Dismiss"],
  },
  {
    id: "loop-004",
    text: "You have 2 unreviewed voice notes.",
    source: "Voice notes inbox",
    sourceType: "voice",
    actions: ["Review now", "Open voice page", "Dismiss"],
  },
];
