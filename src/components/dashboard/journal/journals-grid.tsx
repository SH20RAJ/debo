"use client";

import { FormEvent, useCallback, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  AudioLines,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  HardDrive,
  Loader2,
  Pencil,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteJournalEntry,
  renameJournalEntry,
  type JournalEntry,
  type JournalFilter,
  type JournalSortBy,
} from "@/actions/media-journals";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SortOrder = "asc" | "desc";

interface JournalsGridProps {
  journals: JournalEntry[];
  initialQuery: string;
  initialSort: SortOrder;
  initialSortBy?: JournalSortBy;
  totalCount: number;
  initialFilter?: JournalFilter;
}

const pageSize = 12;

const typeCopy: Record<JournalEntry["type"], { label: string; icon: typeof FileText; tone: string }> = {
  text: {
    label: "Text",
    icon: FileText,
    tone: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
  audio: {
    label: "Audio",
    icon: AudioLines,
    tone: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  },
  video: {
    label: "Video",
    icon: Video,
    tone: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  },
};

function journalHref(journal: JournalEntry) {
  return `/dashboard/journal/${journal.type}/${journal.id}`;
}

function cleanPreview(value?: string | null) {
  return (value || "")
    .replace(/[#*_`>\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function JournalsGrid({
  journals,
  initialQuery,
  initialSort,
  initialSortBy = "createdAt",
  totalCount,
  initialFilter = "all",
}: JournalsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [sortBy, setSortBy] = useState<JournalSortBy>(initialSortBy);
  const [filter, setFilter] = useState<JournalFilter>(initialFilter);
  const [busyEntry, setBusyEntry] = useState<string | null>(null);

  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const hasFilters = !!query || filter !== "all";

  const updateUrl = useCallback(
    (next: {
      query?: string;
      sort?: SortOrder;
      sortBy?: JournalSortBy;
      filter?: JournalFilter;
      page?: number;
    }) => {
      const nextQuery = next.query ?? query;
      const nextSort = next.sort ?? sort;
      const nextSortBy = next.sortBy ?? sortBy;
      const nextFilter = next.filter ?? filter;
      const nextPage = next.page ?? 1;

      setQuery(nextQuery);
      setSort(nextSort);
      setSortBy(nextSortBy);
      setFilter(nextFilter);

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (nextQuery) params.set("q", nextQuery);
        else params.delete("q");

        params.set("sort", nextSort);
        params.set("sortBy", nextSortBy);
        params.set("type", nextFilter);

        if (nextPage > 1) params.set("page", nextPage.toString());
        else params.delete("page");

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [filter, pathname, query, router, searchParams, sort, sortBy],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUrl({ query: query.trim(), page: 1 });
  };

  const handleDelete = async (journal: JournalEntry) => {
    setBusyEntry(journal.id);
    try {
      const result = await deleteJournalEntry({ id: journal.id, type: journal.type });
      if (result.success) {
        toast.success("Journal deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Could not delete journal");
      }
    } catch {
      toast.error("Could not delete journal");
    } finally {
      setBusyEntry(null);
    }
  };

  const handleRename = async (journal: JournalEntry, title: string) => {
    setBusyEntry(journal.id);
    try {
      const result = await renameJournalEntry({ id: journal.id, type: journal.type, title });
      if (result.success) {
        toast.success("Title updated");
        router.refresh();
        return true;
      }

      toast.error(result.error || "Could not update title");
      return false;
    } catch {
      toast.error("Could not update title");
      return false;
    } finally {
      setBusyEntry(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearch} className="flex w-full min-w-0 gap-2 lg:max-w-xl">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search journals..."
              className="h-11 rounded-xl border-border/50 bg-card/50 pl-10 pr-10 text-sm font-medium"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => updateUrl({ query: "", page: 1 })}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <Button type="submit" className="h-11 rounded-xl px-4" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => updateUrl({ sortBy: value as JournalSortBy, page: 1 })}>
            <SelectTrigger className="h-11 rounded-xl border-border/50 bg-card/50 px-3">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="updatedAt">Last edited</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => updateUrl({ sort: sort === "desc" ? "asc" : "desc", page: 1 })}
            className="h-11 rounded-xl border-border/50 bg-card/50 px-3"
          >
            {sort === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
            <span className="sr-only">{sort === "desc" ? "Newest first" : "Oldest first"}</span>
          </Button>

          <Button asChild className="h-11 rounded-xl px-4">
            <Link href="/dashboard/journal/text/new">
              <Plus className="h-4 w-4" />
              New Journal
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(value) => updateUrl({ filter: value as JournalFilter, page: 1 })}>
          <TabsList className="grid h-11 w-full grid-cols-4 rounded-xl border border-border/40 bg-muted/20 p-1 sm:w-fit">
            <TabsTrigger value="all" className="rounded-lg px-4 text-xs font-semibold">
              All
            </TabsTrigger>
            <TabsTrigger value="text" className="rounded-lg px-4 text-xs font-semibold">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Text
            </TabsTrigger>
            <TabsTrigger value="audio" className="rounded-lg px-4 text-xs font-semibold">
              <AudioLines className="mr-1.5 h-3.5 w-3.5" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="rounded-lg px-4 text-xs font-semibold">
              <Video className="mr-1.5 h-3.5 w-3.5" />
              Video
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <Badge variant="outline" className="h-7 rounded-lg border-border/50 bg-card/40 px-3">
            {totalCount} {totalCount === 1 ? "journal" : "journals"}
          </Badge>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateUrl({ query: "", filter: "all", page: 1 })}
              className="h-7 rounded-lg px-2 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className={cn("transition-opacity duration-200", isPending && "opacity-60")}>
        {journals.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {journals.map((journal) => (
              <JournalCard
                key={`${journal.type}-${journal.id}`}
                journal={journal}
                isBusy={busyEntry === journal.id}
                onDelete={() => handleDelete(journal)}
                onRename={(title) => handleRename(journal, title)}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || isPending}
            onClick={() => updateUrl({ page: currentPage - 1 })}
            className="h-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex h-10 items-center rounded-xl border border-border/50 bg-card/40 px-4 text-sm font-semibold">
            {currentPage} / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => updateUrl({ page: currentPage + 1 })}
            className="h-10 rounded-xl"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function JournalCard({
  journal,
  isBusy,
  onDelete,
  onRename,
}: {
  journal: JournalEntry;
  isBusy: boolean;
  onDelete: () => void;
  onRename: (title: string) => Promise<boolean>;
}) {
  const type = typeCopy[journal.type];
  const Icon = type.icon;
  const title = journal.title || `Untitled ${type.label} Journal`;
  const preview = cleanPreview(journal.content || journal.transcript);
  const duration = formatDuration(journal.duration);
  const href = journalHref(journal);

  return (
    <article className="group flex min-h-72 flex-col rounded-xl border border-border/50 bg-card/50 p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", type.tone)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <Badge variant="outline" className="h-6 rounded-md border-border/40 bg-background/30 px-2 text-[11px]">
              {type.label}
            </Badge>
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
              {formatDistanceToNow(new Date(journal.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <RenameJournalDialog title={title} isBusy={isBusy} onRename={onRename} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="sr-only">Delete journal</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this journal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the journal from Debo. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="rounded-lg bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Link href={href} className="mt-5 block flex-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>

        {journal.type === "video" && journal.thumbnailUrl && (
          <div className="relative mt-4 aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted/20">
            <Image
              src={journal.thumbnailUrl}
              alt={title}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
              unoptimized
            />
          </div>
        )}

        <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted-foreground">
          {preview || (journal.type === "text" ? "No body text yet." : "Transcript is not ready yet.")}
        </p>
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {format(new Date(journal.createdAt), "MMM d, yyyy")}
        </span>
        {sortDateChanged(journal) && (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            Edited {format(new Date(journal.updatedAt), "MMM d")}
          </span>
        )}
        {duration && (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {duration}
          </span>
        )}
        {journal.driveWebUrl && (
          <a
            href={journal.driveWebUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-1 text-primary hover:bg-primary/10"
          >
            <HardDrive className="h-3.5 w-3.5" />
            Drive
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="h-9 flex-1 rounded-lg">
          <Link href={href}>
            {journal.type === "text" ? <Pencil className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            {journal.type === "text" ? "Open and edit" : "Open"}
          </Link>
        </Button>
      </div>
    </article>
  );
}

function RenameJournalDialog({
  title,
  isBusy,
  onRename,
}: {
  title: string;
  isBusy: boolean;
  onRename: (title: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(title);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await onRename(draft);
    if (ok) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit title</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit title</DialogTitle>
            <DialogDescription>Give this journal a clearer name.</DialogDescription>
          </DialogHeader>
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={180}
            className="h-11 rounded-xl"
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-lg">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="rounded-lg" disabled={isBusy}>
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function sortDateChanged(journal: JournalEntry) {
  return Math.abs(new Date(journal.updatedAt).getTime() - new Date(journal.createdAt).getTime()) > 1000;
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-border/40 bg-background/60">
        <Sparkles className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {hasFilters ? "No matching journals" : "No journals yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "Try a different search or clear the filters."
          : "Create a text journal, record audio, or capture a video to start your timeline."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasFilters ? (
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/journals">Reset view</Link>
          </Button>
        ) : (
          <>
            <Button asChild className="rounded-xl">
              <Link href="/dashboard/journal/text/new">
                <Plus className="h-4 w-4" />
                New text journal
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/dashboard/capture">Capture media</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
