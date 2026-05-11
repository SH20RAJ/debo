"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SortDesc, SortAsc, Trash2, Plus, Loader2, Sparkles, ChevronLeft, ChevronRight, Video, AudioLines, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { deleteJournal } from "@/actions/journals";
import { toast } from "sonner";
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

interface JournalProps {
  id: string;
  type: "text" | "video" | "audio";
  title?: string | null;
  content?: string;
  transcript?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  tags?: string[] | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  driveWebUrl?: string | null;
}

export function JournalsGrid({ journals, initialQuery, initialSort, totalCount, initialFilter = "all" }: JournalsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [filter, setFilter] = useState(initialFilter);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  const updateUrl = useCallback((newQuery: string, newSort: string, newFilter: "all" | "text" | "video" | "audio", newPage: number = 1) => {
    setSort(newSort);
    setFilter(newFilter);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery) params.set("q", newQuery); else params.delete("q");
      params.set("sort", newSort);
      params.set("type", newFilter);
      if (newPage > 1) params.set("page", newPage.toString()); else params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  const handleDelete = async (id: string, type: "text" | "video" | "audio") => {
    setIsDeleting(id);
    try {
      let result;
      if (type === "text") {
        result = await deleteJournal(id);
      } else if (type === "video") {
        const { deleteVideoJournal } = await import("@/actions/media-journals");
        result = await deleteVideoJournal(id);
      } else {
        const { deleteAudioJournal } = await import("@/actions/media-journals");
        result = await deleteAudioJournal(id);
      }

      if (result.success) {
        toast.success("Entry deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search memories..."
            className="pl-9 h-10 rounded-xl bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-duo-macaw/20"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                updateUrl(e.target.value, sort, filter, 1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateUrl(query, sort === "desc" ? "asc" : "desc", filter, 1)}
            className="h-10 rounded-xl border-duo-swan/50"
          >
            {sort === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </Button>
          <Link href="/dashboard/journal/new">
            <Button className="h-10 rounded-xl gap-2 bg-duo-feather hover:bg-duo-feather/90 shadow-md shadow-duo-feather-shadow/20">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => updateUrl(query, sort, v as "all" | "text" | "video" | "audio", 1)}>
        <TabsList className="grid w-full grid-cols-4 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background">
            All
          </TabsTrigger>
          <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Text
          </TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-background">
            <Video className="h-3.5 w-3.5 mr-1.5" />
            Video
          </TabsTrigger>
          <TabsTrigger value="audio" className="rounded-lg data-[state=active]:bg-background">
            <AudioLines className="h-3.5 w-3.5 mr-1.5" />
            Audio
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
        <span>{totalCount} {totalCount === 1 ? "entry" : "entries"}</span>
        {query && (
          <span className="flex items-center gap-1 text-duo-macaw">
            <Sparkles className="h-3 w-3" />
            filtering
          </span>
        )}
      </div>

      {/* Grid */}
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300 ${isPending ? "opacity-50" : ""}`}>
        {journals.length === 0 ? (
          <EmptyState hasQuery={!!query} />
        ) : (
          journals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              isDeleting={isDeleting === journal.id}
              onDelete={(id) => handleDelete(id, journal.type)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateUrl(query, sort, filter, currentPage - 1)}
                className="rounded-xl border-duo-swan/50 h-10 px-4"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Prev
            </Button>

            <div className="flex items-center gap-1 px-4">
                <span className="text-sm font-bold text-duo-eel">{currentPage}</span>
                <span className="text-sm font-medium text-duo-swan">/</span>
                <span className="text-sm font-medium text-duo-wolf">{totalPages}</span>
            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateUrl(query, sort, filter, currentPage + 1)}
                className="rounded-xl border-duo-swan/50 h-10 px-4"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      )}
    </div>
  );
}

function JournalCard({ journal, isDeleting, onDelete }: { journal: JournalProps; isDeleting: boolean; onDelete: (id: string) => void }) {
  const content = journal.content || journal.transcript || "";
  const preview = content.slice(0, 180).replace(/[#*`]/g, "");

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-duo-swan/30 bg-card p-5 transition-all duration-200 hover:border-duo-swan/60 hover:shadow-lg hover:shadow-duo-swan/5 overflow-hidden">
      {/* Type-specific overlay for video/audio */}
      {journal.type === "video" && journal.thumbnailUrl && (
        <div className="absolute top-0 left-0 w-full h-1 bg-duo-macaw opacity-50" />
      )}

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/40">
          <div className="flex items-center justify-center size-5 rounded-md bg-muted/60 text-muted-foreground/60 mr-1">
            {journal.type === "video" ? <Video className="h-3 w-3" /> : 
             journal.type === "audio" ? <AudioLines className="h-3 w-3" /> : 
             <FileText className="h-3 w-3" />}
          </div>
          <span>{format(new Date(journal.createdAt), "MMM d")}</span>
          <span className="text-duo-swan">•</span>
          {journal.duration ? (
            <span className="text-duo-macaw/80">{formatDuration(journal.duration)}</span>
          ) : (
            <span>{formatDistanceToNow(new Date(journal.createdAt), { addSuffix: true })}</span>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this {journal.type} entry?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(journal.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Link href={`/dashboard/journal/${journal.id}?type=${journal.type}`} className="flex-1 relative z-10">
        <div className="space-y-3">
          {journal.title && (
            <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-duo-macaw transition-colors">
              {journal.title}
            </h3>
          )}
          
          {journal.type === "video" && journal.thumbnailUrl && (
            <div className="aspect-video w-full rounded-xl bg-muted/30 overflow-hidden mb-3 border border-duo-swan/20">
              <img src={journal.thumbnailUrl} alt={journal.title || "Video thumbnail"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <p className="text-sm text-muted-foreground/70 line-clamp-3 leading-relaxed">
            {preview || (journal.type === "video" ? "Processing video..." : journal.type === "audio" ? "Processing audio..." : "No content")}{preview ? "..." : ""}
          </p>
        </div>
      </Link>

      {journal.tags && journal.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-duo-swan/20 relative z-10">
          {journal.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium uppercase tracking-wider text-duo-macaw/70 bg-duo-macaw/5 px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6 text-muted-foreground/30" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{hasQuery ? "No matches found" : "No entries yet"}</h3>
      <p className="text-sm text-muted-foreground/70 mb-4">
        {hasQuery ? "Try a different search term" : "Start your first memory"}
      </p>
      {!hasQuery && (
        <Link href="/dashboard/journal/new">
          <Button size="sm" className="rounded-xl">Create Entry</Button>
        </Link>
      )}
    </div>
  );
}