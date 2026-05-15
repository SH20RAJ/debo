import type { Metadata } from "next";
import { UsersRound } from "lucide-react";

import { getCharacters } from "@/features/characters/actions";
import { CharactersManager } from "@/features/characters/components/characters-manager";

export const metadata: Metadata = {
  title: "Characters",
  description: "Manage people Debo has learned from your journals and chats.",
};

export default async function CharactersPage() {
  const result = await getCharacters();
  const characters = result.success ? result.data : [];

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border/20 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              <UsersRound className="h-4 w-4" />
              Character Graph
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                People Debo remembers
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                A clean map of people from your chats, text journals, audio notes, and video journals. Edit who they are, how you know them, and the references Debo can cite later.
              </p>
            </div>
          </div>
        </div>
      </header>

      <CharactersManager initialCharacters={characters} />
    </div>
  );
}
