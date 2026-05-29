"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PersonCard } from "./person-card";
import { api } from "@/lib/api";
import type { PersonMemory } from "@/lib/types";

function normalizePerson(raw: any): PersonMemory {
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name ?? "Unknown",
    context: raw.context ?? "",
    lastMentioned: raw.lastMentioned ?? raw.last_mentioned ?? new Date().toISOString(),
    openTaskCount: raw.openTaskCount ?? raw.open_task_count ?? 0,
    memoryCount: raw.memoryCount ?? raw.memory_count ?? 0,
    avatar: raw.avatar,
  };
}

export function PeoplePage() {
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<PersonMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPeople() {
      try {
        const data = await api.people.list();
        const items = Array.isArray(data) ? data : data?.people ?? data?.data ?? [];
        if (!cancelled) {
          setPeople(items.map(normalizePerson));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchPeople();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = query
    ? people.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.context.toLowerCase().includes(query.toLowerCase())
      )
    : people;

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
        People
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Everyone Debo has noticed in your memories.
      </p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-5">
      {header}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-border bg-card p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            Could not load people. Make sure the API is running.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            {query
              ? "No people match your search."
              : "People will appear here as they are mentioned in your memories."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
