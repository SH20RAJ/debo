"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { PersonCard, type Person } from "./person-card";

const mockPeople: Person[] = [
  {
    id: "raj",
    name: "Raj",
    initials: "R",
    context: "Marketing / Q4 Budget",
    lastMentioned: "Tuesday",
    openTaskCount: 2,
    memoryCount: 4,
    color: "0",
  },
  {
    id: "sarah",
    name: "Sarah",
    initials: "S",
    context: "Engineering / API Integration",
    lastMentioned: "3 days ago",
    openTaskCount: 1,
    memoryCount: 3,
    color: "1",
  },
  {
    id: "alex",
    name: "Alex Chen",
    initials: "AC",
    context: "Design / Landing Page",
    lastMentioned: "Yesterday",
    openTaskCount: 1,
    memoryCount: 2,
    color: "2",
  },
  {
    id: "priya",
    name: "Priya Sharma",
    initials: "PS",
    context: "Product / Investor Relations",
    lastMentioned: "Last week",
    openTaskCount: 0,
    memoryCount: 5,
    color: "3",
  },
  {
    id: "marcus",
    name: "Marcus",
    initials: "M",
    context: "Customers / Onboarding Feedback",
    lastMentioned: "4 days ago",
    openTaskCount: 1,
    memoryCount: 2,
    color: "4",
  },
  {
    id: "elena",
    name: "Elena Park",
    initials: "EP",
    context: "Partnerships / Integration",
    lastMentioned: "2 weeks ago",
    openTaskCount: 0,
    memoryCount: 3,
    color: "5",
  },
];

export function PeoplePage() {
  const [query, setQuery] = useState("");

  const filtered = query
    ? mockPeople.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.context.toLowerCase().includes(query.toLowerCase())
      )
    : mockPeople;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          People
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Debo remembers people like a personal CRM.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
        />
      </div>

      {/* People Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {query
              ? "No people match your search."
              : "People will appear here when they are mentioned in your memories."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
