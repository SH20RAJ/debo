"use client";

import type * as React from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpenText,
  ExternalLink,
  Loader2,
  MessageSquareText,
  Mic2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import {
  addCharacterNote,
  createCharacter,
  deleteCharacter,
  syncCharacters,
  updateCharacter,
} from "../actions";
import type { CharacterInput, CharacterProfile, CharacterReference } from "../types";

type CharacterDraft = CharacterInput & {
  aliasesText: string;
};

type CharactersManagerProps = {
  initialCharacters: CharacterProfile[];
};

const emptyDraft: CharacterDraft = {
  displayName: "",
  customId: "",
  avatarUrl: "",
  aliases: [],
  aliasesText: "",
  relationship: "",
  summary: "",
  context: "",
};

function profileToDraft(profile?: CharacterProfile): CharacterDraft {
  if (!profile) return emptyDraft;

  return {
    displayName: profile.displayName,
    customId: profile.customId || "",
    avatarUrl: profile.avatarUrl || "",
    aliases: profile.aliases,
    aliasesText: profile.aliases.join(", "),
    relationship: profile.relationship || "",
    summary: profile.summary || "",
    context: profile.context || "",
  };
}

function draftToInput(draft: CharacterDraft): CharacterInput {
  return {
    displayName: draft.displayName,
    customId: draft.customId || null,
    avatarUrl: draft.avatarUrl || null,
    aliases: draft.aliasesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    relationship: draft.relationship || null,
    summary: draft.summary || null,
    context: draft.context || null,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: Date | string | null) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function referenceIcon(sourceType: CharacterReference["sourceType"]) {
  if (sourceType === "audio") return Mic2;
  if (sourceType === "video") return Video;
  if (sourceType === "chat") return MessageSquareText;
  return BookOpenText;
}

export function CharactersManager({ initialCharacters }: CharactersManagerProps) {
  const [characters, setCharacters] = useState(initialCharacters);
  const [selectedId, setSelectedId] = useState(initialCharacters[0]?.id || "");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<CharacterDraft>(profileToDraft(initialCharacters[0]));
  const [note, setNote] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setCharacters(initialCharacters);
    if (!selectedId && initialCharacters[0]) {
      setSelectedId(initialCharacters[0].id);
      setDraft(profileToDraft(initialCharacters[0]));
    }
  }, [initialCharacters, selectedId]);

  const selected = useMemo(
    () => characters.find((character) => character.id === selectedId),
    [characters, selectedId]
  );

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return characters;

    return characters.filter((character) => {
      return [
        character.displayName,
        character.customId,
        character.relationship,
        character.summary,
        character.context,
        ...character.aliases,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [characters, query]);

  const stats = useMemo(() => {
    const references = characters.reduce((sum, character) => sum + character.references.length, 0);
    const relationships = characters.filter((character) => character.relationship).length;
    return { profiles: characters.length, references, relationships };
  }, [characters]);

  const selectCharacter = (character: CharacterProfile) => {
    setIsCreating(false);
    setSelectedId(character.id);
    setDraft(profileToDraft(character));
    setNote("");
  };

  const startNewCharacter = () => {
    setIsCreating(true);
    setSelectedId("");
    setDraft(emptyDraft);
    setNote("");
  };

  const handleSync = () => {
    startTransition(async () => {
      const result = await syncCharacters();
      if (result.success) {
        toast.success(
          `Characters synced. ${result.data?.charactersProcessed || 0} mentions scanned, ${result.data?.duplicatesMerged || 0} duplicates merged.`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Could not sync characters");
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const input = draftToInput(draft);
      const result = isCreating
        ? await createCharacter(input)
        : selected
          ? await updateCharacter(selected.id, input)
          : { success: false, error: "Pick a character first" };

      if (result.success) {
        toast.success(isCreating ? "Character created." : "Character saved.");
        setIsCreating(false);
        router.refresh();
      } else {
        toast.error(result.error || "Could not save character");
      }
    });
  };

  const handleDelete = () => {
    if (!selected || isCreating) return;

    startTransition(async () => {
      const result = await deleteCharacter(selected.id);
      if (result.success) {
        toast.success("Character deleted.");
        const next = characters.find((character) => character.id !== selected.id);
        setSelectedId(next?.id || "");
        setDraft(profileToDraft(next));
        router.refresh();
      } else {
        toast.error(result.error || "Could not delete character");
      }
    });
  };

  const handleAddNote = () => {
    if (!selected || !note.trim()) return;

    startTransition(async () => {
      const result = await addCharacterNote(selected.id, note);
      if (result.success) {
        toast.success("Note added.");
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error || "Could not add note");
      }
    });
  };

  return (
    <div className="grid min-h-[calc(100svh-5rem)] grid-cols-1 border-t border-border/20 bg-background lg:grid-cols-[380px_1fr]">
      <aside className="border-b border-border/20 bg-muted/10 lg:border-b-0 lg:border-r">
        <div className="sticky top-20 flex flex-col gap-5 p-5">
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="People" value={stats.profiles} />
            <StatTile label="Refs" value={stats.references} />
            <StatTile label="Known" value={stats.relationships} />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people..."
                className="h-11 rounded-lg border-border/50 bg-background pl-9 text-sm"
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={startNewCharacter}
              className="h-11 w-11 rounded-lg"
              title="Add character"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleSync}
            disabled={isPending}
            className="h-11 justify-center rounded-lg"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Sync from journals and chat
          </Button>

          <div className="space-y-2">
            {filteredCharacters.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-background/70 p-8 text-center">
                <UsersRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-foreground">No characters yet</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Run sync or add a person manually.
                </p>
              </div>
            ) : (
              filteredCharacters.map((character) => (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => selectCharacter(character)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    selectedId === character.id
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-border/40 bg-background/70 hover:border-primary/20 hover:bg-background"
                  )}
                >
                  <Avatar className="h-11 w-11 rounded-lg border border-border/60">
                    <AvatarImage src={character.avatarUrl || undefined} alt={character.displayName} />
                    <AvatarFallback className="rounded-lg bg-muted text-xs font-bold">
                      {initials(character.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{character.displayName}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {character.relationship || "Relationship unknown"}
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-md border-border/60 text-[10px]">
                    {character.mentionCount}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl border border-border/60">
                <AvatarImage src={draft.avatarUrl || undefined} alt={draft.displayName || "Character"} />
                <AvatarFallback className="rounded-xl bg-muted text-base font-black">
                  {draft.displayName ? initials(draft.displayName) : <UserRound className="h-6 w-6 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {isCreating ? "New character" : selected?.displayName || "Character"}
                  </h1>
                  {selected?.confidence === 100 ? <BadgeCheck className="h-5 w-5 text-primary" /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isCreating
                    ? "Add someone important to your private context."
                    : selected
                      ? `${selected.references.length} references across journals and chat`
                      : "Pick a person or run sync."}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isCreating && selected ? (
                <Button type="button" variant="outline" onClick={handleDelete} disabled={isPending} className="rounded-lg">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : null}
              <Button type="button" onClick={handleSave} disabled={isPending || !draft.displayName.trim()} className="rounded-lg">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <Panel title="Identity">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input
                      value={draft.displayName}
                      onChange={(event) => setDraft((value) => ({ ...value, displayName: event.target.value }))}
                      placeholder="Sarah Chen"
                      className="rounded-lg"
                    />
                  </Field>
                  <Field label="Character ID">
                    <Input
                      value={draft.customId || ""}
                      onChange={(event) => setDraft((value) => ({ ...value, customId: event.target.value }))}
                      placeholder="sarah-work"
                      className="rounded-lg"
                    />
                  </Field>
                  <Field label="Avatar URL">
                    <Input
                      value={draft.avatarUrl || ""}
                      onChange={(event) => setDraft((value) => ({ ...value, avatarUrl: event.target.value }))}
                      placeholder="https://..."
                      className="rounded-lg"
                    />
                  </Field>
                  <Field label="Relationship">
                    <Input
                      value={draft.relationship || ""}
                      onChange={(event) => setDraft((value) => ({ ...value, relationship: event.target.value }))}
                      placeholder="friend, client, mentor..."
                      className="rounded-lg"
                    />
                  </Field>
                </div>
                <Field label="Aliases">
                  <Input
                    value={draft.aliasesText}
                    onChange={(event) => setDraft((value) => ({ ...value, aliasesText: event.target.value }))}
                    placeholder="Sarah, Sarah C, S. Chen"
                    className="rounded-lg"
                  />
                </Field>
              </Panel>

              <Panel title="Context">
                <Field label="Summary">
                  <Textarea
                    value={draft.summary || ""}
                    onChange={(event) => setDraft((value) => ({ ...value, summary: event.target.value }))}
                    placeholder="Who this person is and why they matter."
                    className="min-h-28 rounded-lg"
                  />
                </Field>
                <Field label="Private notes">
                  <Textarea
                    value={draft.context || ""}
                    onChange={(event) => setDraft((value) => ({ ...value, context: event.target.value }))}
                    placeholder="Anything Debo should remember about them."
                    className="min-h-40 rounded-lg"
                  />
                </Field>
              </Panel>

              {selected && !isCreating ? (
                <Panel title="Add note">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Add a new detail about this person..."
                      className="min-h-20 rounded-lg"
                    />
                    <Button type="button" onClick={handleAddNote} disabled={isPending || !note.trim()} className="rounded-lg sm:w-32">
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </Panel>
              ) : null}
            </div>

            <Panel title="References" className="h-fit">
              {!selected || selected.references.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <BookOpenText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm font-semibold">No references yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sync will attach journals, audio, video, and chat mentions here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selected.references.slice(0, 18).map((reference) => (
                    <ReferenceRow key={reference.id} reference={reference} />
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background p-3">
      <div className="text-lg font-black tabular-nums text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</div>
    </div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-xl border border-border/40 bg-card/60 p-5", className)}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ReferenceRow({ reference }: { reference: CharacterReference }) {
  const Icon = referenceIcon(reference.sourceType);
  const body = (
    <div className="group rounded-lg border border-border/40 bg-background/70 p-3 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-primary/70" />
          <span className="truncate text-xs font-semibold text-foreground">
            {reference.sourceTitle || `${reference.sourceType} reference`}
          </span>
        </div>
        {reference.sourceHref ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40" /> : null}
      </div>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
        {reference.excerpt}
      </p>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {formatDate(reference.occurredAt || reference.createdAt)}
      </div>
    </div>
  );

  if (!reference.sourceHref) return body;

  return (
    <Link href={reference.sourceHref} className="block">
      {body}
    </Link>
  );
}
