import type { TimelineItem } from "../types";

export const TIMELINE: TimelineItem[] = [
  {
    id: "tl-001",
    type: "voice",
    title: "Marketing Sync Follow-up",
    summary:
      "Recorded after sync call. Discussed Q4 budget allocation and promised Raj a finalized draft.",
    date: "2026-05-17T14:30:00Z",
    people: ["Raj"],
    sourceId: "mem-001",
  },
  {
    id: "tl-002",
    type: "email",
    title: "Budget Follow-up from Raj",
    summary:
      "Raj asked for revised Q4 allocation. Board meeting moved to Monday.",
    date: "2026-05-17T09:45:00Z",
    people: ["Raj"],
    sourceId: "mem-009",
  },
  {
    id: "tl-003",
    type: "meeting",
    title: "Customer Call with Sarah",
    summary:
      "Sarah wants API integration for Acme Corp. 3-week timeline, 50-user pilot.",
    date: "2026-05-16T10:00:00Z",
    people: ["Sarah"],
    sourceId: "mem-004",
  },
  {
    id: "tl-004",
    type: "voice",
    title: "Investor Meeting Prep",
    summary:
      "Talking points for meeting with Priya's fund. Market size, differentiation, beta traction.",
    date: "2026-05-16T08:30:00Z",
    people: ["Priya"],
    sourceId: "mem-007",
  },
  {
    id: "tl-005",
    type: "file",
    title: "Q4 Allocation Draft uploaded",
    summary:
      "PDF with proposed budget breakdown. Projected ROI per channel.",
    date: "2026-05-15T09:00:00Z",
    people: ["Raj"],
    sourceId: "mem-002",
  },
  {
    id: "tl-006",
    type: "voice",
    title: "Content Strategy Brainstorm",
    summary:
      "Marcus outlined blog plan: memory OS explainer, privacy post, founder workflows.",
    date: "2026-05-15T17:00:00Z",
    people: ["Marcus"],
    sourceId: "mem-010",
  },
  {
    id: "tl-007",
    type: "journal",
    title: "Product Ideas for Debo",
    summary:
      "Brainstormed 12 ideas. Top picks: voice-first capture, source-backed answers.",
    date: "2026-05-14T21:15:00Z",
    people: [],
    sourceId: "mem-003",
  },
  {
    id: "tl-008",
    type: "journal",
    title: "Landing Page Revamp Notes",
    summary:
      "New structure: hero, feature grid, demo flow, waitlist CTA. Alex sharing mockups.",
    date: "2026-05-13T16:45:00Z",
    people: ["Alex"],
    sourceId: "mem-005",
  },
];
