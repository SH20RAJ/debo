"use client";

import { useState } from "react";
import { JournalEntryList } from "@/components/journal/entry-list";
import { JournalEditor } from "@/components/journal/editor";
import { JournalInsightRail } from "@/components/journal/insight-rail";
import { TemplatePicker } from "@/components/journal/template-picker";

export interface JournalEntry {
  id: string;
  title: string;
  preview: string;
  date: string;
  content: string;
  people: string[];
  tasks: string[];
}

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    title: "Product Ideas",
    preview: "Three features that could differentiate us from competitors...",
    date: "May 18, 2026",
    content:
      "Three features that could differentiate us from competitors:\n\n1. Voice-first capture — let users record thoughts hands-free\n2. Source-backed answers — every AI response shows where it came from\n3. Private memory graph — users control what gets remembered\n\nWe should prioritize the voice capture flow. It's the most defensible moat and hardest to copy.",
    people: ["Shaswat"],
    tasks: ["Prototype voice capture flow"],
  },
  {
    id: "2",
    title: "Weekly Review",
    preview: "This week was productive. Shipped the library page and started...",
    date: "May 17, 2026",
    content:
      "This week was productive. Shipped the library page and started on the journal editor.\n\nWhat went well:\n- Clean component architecture\n- Mock data layer is reusable\n\nWhat to improve:\n- Need better error states\n- Mobile responsiveness needs work",
    people: [],
    tasks: ["Add error boundaries", "Mobile polish pass"],
  },
  {
    id: "3",
    title: "Meeting Notes - Sarah",
    preview: "Discussed the Q3 roadmap with Sarah. Key takeaways...",
    date: "May 15, 2026",
    content:
      "Discussed the Q3 roadmap with Sarah.\n\nKey takeaways:\n- Ship journal by end of May\n- Library needs search before launch\n- Voice capture is P1 for next sprint\n\nSarah suggested we look at how Reflect handles their editor. Worth investigating.",
    people: ["Sarah"],
    tasks: ["Ship journal by end of May", "Investigate Reflect editor"],
  },
  {
    id: "4",
    title: "Startup Brainstorm",
    preview: "Explored pricing models. Freemium with a generous free tier...",
    date: "May 14, 2026",
    content:
      "Explored pricing models.\n\nFreemium with a generous free tier seems right:\n- Free: 100 memories, basic search\n- Pro: Unlimited, voice, connectors\n- Team: Shared memory spaces\n\nNeed to validate willingness to pay with 10 more user interviews.",
    people: [],
    tasks: ["Run 10 user interviews", "Draft pricing page"],
  },
];

export function JournalPage() {
  const [entries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [activeEntryId, setActiveEntryId] = useState<string>(MOCK_ENTRIES[0].id);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const activeEntry = entries.find((e) => e.id === activeEntryId) ?? entries[0];

  const handleNewEntry = () => {
    setShowTemplatePicker(true);
  };

  const handleSelectTemplate = (title: string, content: string) => {
    setShowTemplatePicker(false);
    // In a real app this would create a new entry
    console.log("New entry from template:", title);
  };

  return (
    <div className="flex h-full">
      {/* Left: Entry list */}
      <div className="w-64 shrink-0 border-r border-border bg-card">
        <JournalEntryList
          entries={entries}
          activeEntryId={activeEntryId}
          onSelect={setActiveEntryId}
          onNewEntry={handleNewEntry}
        />
      </div>

      {/* Center: Editor */}
      <div className="flex-1 overflow-y-auto">
        <JournalEditor entry={activeEntry} />
      </div>

      {/* Right: Insight rail */}
      <div className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto">
        <JournalInsightRail entry={activeEntry} />
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
