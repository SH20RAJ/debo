"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PersonCard } from "./person-card";
import { PEOPLE } from "@/lib/mock";

export function PeoplePage() {
  const [query, setQuery] = useState("");

  const filtered = query
    ? PEOPLE.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.context.toLowerCase().includes(query.toLowerCase())
      )
    : PEOPLE;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          People
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Debo remembers people like a personal CRM.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

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
