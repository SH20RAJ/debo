"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SortDesc, SortAsc, Trash2, Plus, Loader2, Sparkles, ChevronLeft, ChevronRight, Video, AudioLines, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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

interface JournalsGridProps {
  journals: JournalProps[];
  initialQuery: string;
  initialSort: "asc" | "desc";
  totalCount: number;
  initialFilter?: "all" | "text" | "video" | "audio";
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

  const updateUrl = useCallback((newQuery: string, newSort: "asc" | "desc", newFilter: "all" | "text" | "video" | "audio", newPage: number = 1) => {
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
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-duo-wolf/40 transition-colors group-focus-within:text-duo-macaw" />
          <Input
            placeholder="Search memories..."
            className="pl-11 h-12 rounded-2xl bg-card border-2 border-border/50 focus-visible:ring-0 focus-visible:border-duo-macaw transition-all font-bold text-foreground"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                updateUrl(e.target.value, sort, filter, 1);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="duolingo-outline"
            size="sm"
            onClick={() => updateUrl(query, sort === "desc" ? "asc" : "desc", filter, 1)}
            className="h-12 w-12 p-0 rounded-2xl"
          >
            {sort === "desc" ? <SortDesc className="h-5 w-5" /> : <SortAsc className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard/journal/new">
            <Button variant="duolingo-green" className="h-12 rounded-2xl gap-2 px-6 shadow-duo-feather-shadow">
              <Plus className="h-5 w-5 stroke-[3]" />
              <span className="font-black uppercase tracking-wider text-xs">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => updateUrl(query, sort, v as "all" | "text" | "video" | "audio", 1)}>
        <TabsList className="flex w-full sm:w-fit gap-2 rounded-2xl bg-muted/50 p-1.5 border-2 border-border/50">
          <TabsTrigger value="all" className="flex-1 sm:flex-none h-10 rounded-xl px-6 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_4px_0_var(--duo-swan)]">
            All
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-1 sm:flex-none h-10 rounded-xl px-6 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-duo-fox data-[state=active]:shadow-[0_4px_0_var(--duo-fox-shadow)]">
            <FileText className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="video" className="flex-1 sm:flex-none h-10 rounded-xl px-6 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-duo-beetle data-[state=active]:shadow-[0_4px_0_var(--duo-beetle-shadow)]">
            <Video className="h-4 w-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex-1 sm:flex-none h-10 rounded-xl px-6 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-duo-macaw data-[state=active]:shadow-[0_4px_0_var(--duo-macaw-shadow)]">
            <AudioLines className="h-4 w-4 mr-2" />
            Audio
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-duo-wolf/40">
        <span className="flex items-center gap-1.5 rounded-full border-2 border-border px-3 py-1 bg-card">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          {totalCount} {totalCount === 1 ? "entry" : "entries"}
        </span>
        {query && (
          <span className="flex items-center gap-1.5 rounded-full border-2 border-duo-macaw/30 px-3 py-1 bg-duo-macaw/5 text-duo-macaw">
            <Sparkles className="h-3 w-3 fill-current" />
            AI Search active
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
        <div className="flex items-center justify-center gap-4 pt-12">
            <Button
                variant="duolingo-outline"
                size="sm"
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateUrl(query, sort, filter, currentPage - 1)}
                className="rounded-2xl h-12 px-6"
            >
                <ChevronLeft className="h-5 w-5 mr-2 stroke-[3]" />
                <span className="font-black uppercase tracking-wider text-xs">Prev</span>
            </Button>

            <div className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-duo-polar/50 border-2 border-duo-swan/30">
                <span className="text-sm font-black text-duo-eel">{currentPage}</span>
                <span className="text-sm font-bold text-duo-swan">/</span>
                <span className="text-sm font-bold text-duo-wolf/60">{totalPages}</span>
            </div>

            <Button
                variant="duolingo-outline"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateUrl(query, sort, filter, currentPage + 1)}
                className="rounded-2xl h-12 px-6"
            >
                <span className="font-black uppercase tracking-wider text-xs">Next</span>
                <ChevronRight className="h-5 w-5 ml-2 stroke-[3]" />
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
    <div className={cn(
      "group relative flex flex-col rounded-[2.5rem] border-2 border-border/50 bg-card p-8 transition-all duration-300",
      "hover:-translate-y-2 hover:shadow-[0_12px_0_var(--border)] hover:border-border/50",
      "overflow-hidden border-b-8"
    )}>
      {/* Type-specific top bar */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1.5 opacity-60",
        journal.type === "video" ? "bg-duo-beetle" : 
        journal.type === "audio" ? "bg-duo-macaw" : "bg-duo-fox"
      )} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
          <div className={cn(
            "flex items-center justify-center size-7 rounded-xl border-2 shadow-[0_2px_0_rgba(0,0,0,0.1)]",
            journal.type === "video" ? "bg-duo-purple/10 border-duo-beetle text-duo-purple" : 
            journal.type === "audio" ? "bg-duo-macaw/10 border-duo-macaw text-duo-macaw" : 
            "bg-duo-orange/10 border-duo-fox text-duo-orange"
          )}>
            {journal.type === "video" ? <Video className="h-4 w-4" /> : 
             journal.type === "audio" ? <AudioLines className="h-4 w-4" /> : 
             <FileText className="h-4 w-4" />}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-duo-eel">{format(new Date(journal.createdAt), "MMM d, yyyy")}</span>
            <div className="flex items-center gap-1.5 text-duo-wolf/40">
              {journal.duration ? (
                <span className="text-duo-macaw/80">{formatDuration(journal.duration)}</span>
              ) : (
                <span>{formatDistanceToNow(new Date(journal.createdAt), { addSuffix: true })}</span>
              )}
            </div>
          </div>
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

      <Link href={`/dashboard/journal/${journal.id}?type=${journal.type}`} className="flex-1 relative z-10 mt-2">
        <div className="space-y-4">
          {journal.title && (
            <h3 className="text-lg font-black tracking-tight text-duo-eel line-clamp-1 group-hover:text-duo-macaw transition-colors">
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
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t-2 border-duo-swan/20 relative z-10">
          {journal.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-duo-macaw bg-duo-macaw/5 border-2 border-duo-macaw/20 px-2.5 py-1 rounded-xl">
              {tag}
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