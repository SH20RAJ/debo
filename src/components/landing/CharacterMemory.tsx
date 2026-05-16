"use client";

import { BookOpenText, MessageSquareText, Mic2, PenLine, UserRound, UsersRound, Video } from "lucide-react";

const references = [
  { label: "Chat", icon: MessageSquareText, text: "You said Sarah is helping with hiring." },
  { label: "Audio", icon: Mic2, text: "Voice note: follow up with Sarah Tuesday." },
  { label: "Video", icon: Video, text: "Video journal mentioned Q4 senior engineers." },
  { label: "Text", icon: BookOpenText, text: "Journal linked Sarah to recruiting decisions." },
];

export function CharacterMemory() {
  return (
    <section className="border-t-2 border-border/10 bg-muted/20 py-24">
      <div className="container mx-auto grid max-w-5xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
            <UsersRound className="h-3.5 w-3.5" />
            Character Memory
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl">
              Debo remembers people, not just notes.
            </h2>
            <p className="max-w-xl text-base font-semibold leading-relaxed text-muted-foreground">
              Every person you mention becomes a living profile with relationship context, editable details, and references back to the chats, text journals, audio notes, and videos where they appeared.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Feature label="Deduplicates aliases" />
            <Feature label="Editable profile and avatar" />
            <Feature label="Cited source trail" />
            <Feature label="Chat-aware recall" />
          </div>
        </div>

        <div className="duo-card p-5">
          <div className="flex items-center gap-4 border-b border-border/50 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground">Sarah Chen</div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">Work contact \u2022 hiring context</div>
            </div>
          </div>

          <div className="grid gap-4 pt-5 sm:grid-cols-[1fr_0.8fr]">
            <div className="rounded-2xl border-2 border-border/50 bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
                <PenLine className="h-3.5 w-3.5" />
                Summary
              </div>
              <p className="text-sm font-semibold leading-relaxed text-foreground/80">
                Sarah appears across hiring notes and Q4 planning. Debo knows the relationship, context, and where each detail came from.
              </p>
            </div>
            <div className="space-y-2">
              {references.map((reference) => (
                <div key={reference.label} className="rounded-2xl border-2 border-border/50 bg-card p-3">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    <reference.icon className="h-3.5 w-3.5" />
                    {reference.label}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-medium">{reference.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border-2 border-border/50 bg-background px-4 py-3 text-sm font-bold text-foreground">
      {label}
    </div>
  );
}
