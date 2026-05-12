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
    <div className="space-y-10 pb-20">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary/60" />
          <Input
            placeholder="Search memories..."
            className="pl-11 h-11 rounded-xl bg-card/50 border-border/40 focus-visible:ring-0 focus-visible:border-primary/40 transition-all font-medium text-foreground"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                updateUrl(e.target.value, sort, filter, 1);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateUrl(query, sort === "desc" ? "asc" : "desc", filter, 1)}
            className="h-11 w-11 p-0 rounded-xl border border-border/40 hover:bg-muted/40"
          >
            {sort === "desc" ? <SortDesc className="h-4.5 w-4.5" /> : <SortAsc className="h-4.5 w-4.5" />}
          </Button>
          <Link href="/dashboard/journal/text/new">
            <Button className="h-11 rounded-xl gap-2 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="font-semibold text-xs tracking-tight">New Journal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => updateUrl(query, sort, v as "all" | "text" | "video" | "audio", 1)}>
        <TabsList className="flex w-full sm:w-fit gap-1 rounded-xl bg-muted/20 p-1 border border-border/10">
          <TabsTrigger value="all" className="flex-1 sm:flex-none h-9 rounded-lg px-6 text-xs font-semibold tracking-tight transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-1 sm:flex-none h-9 rounded-lg px-6 text-xs font-semibold tracking-tight transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground/60" />
            Text
          </TabsTrigger>
          <TabsTrigger value="video" className="flex-1 sm:flex-none h-9 rounded-lg px-6 text-xs font-semibold tracking-tight transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <Video className="h-3.5 w-3.5 mr-2 text-muted-foreground/60" />
            Video
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex-1 sm:flex-none h-9 rounded-lg px-6 text-xs font-semibold tracking-tight transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <AudioLines className="h-3.5 w-3.5 mr-2 text-muted-foreground/60" />
            Audio
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
        <span className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-1 bg-muted/10">
          <div className="h-1 w-1 rounded-full bg-primary/40" />
          {totalCount} {totalCount === 1 ? "entry" : "entries"}
        </span>
        {query && (
          <span className="flex items-center gap-2 rounded-md border border-primary/20 px-3 py-1 bg-primary/5 text-primary/60">
            <Sparkles className="h-3 w-3" />
            AI Search
          </span>
        )}
      </div>

      {/* Grid */}
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300 ${isPending ? "opacity-50" : ""}`}>
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
        <div className="flex items-center justify-center gap-6 pt-12">
            <Button
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateUrl(query, sort, filter, currentPage - 1)}
                className="rounded-xl h-10 px-4 border border-border/40 hover:bg-muted/40"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="font-semibold text-xs tracking-tight">Previous</span>
            </Button>

            <div className="flex items-center gap-2 px-4 h-10 rounded-xl bg-muted/10 border border-border/10">
                <span className="text-sm font-semibold text-foreground">{currentPage}</span>
                <span className="text-sm font-medium text-muted-foreground/40">/</span>
                <span className="text-sm font-medium text-muted-foreground/40">{totalPages}</span>
            </div>

            <Button
                variant="ghost"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateUrl(query, sort, filter, currentPage + 1)}
                className="rounded-xl h-10 px-4 border border-border/40 hover:bg-muted/40"
            >
                <span className="font-semibold text-xs tracking-tight">Next</span>
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
    <div className="group relative flex flex-col rounded-2xl border border-border/10 bg-card/40 p-6 transition-all duration-300 hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center size-8 rounded-lg border border-border/40 transition-colors group-hover:border-primary/20",
            journal.type === "video" ? "bg-purple-500/5 text-purple-500/60" : 
            journal.type === "audio" ? "bg-blue-500/5 text-blue-500/60" : 
            "bg-orange-500/5 text-orange-500/60"
          )}>
            {journal.type === "video" ? <Video className="h-4 w-4" /> : 
             journal.type === "audio" ? <AudioLines className="h-4 w-4" /> : 
             <FileText className="h-4 w-4" />}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{format(new Date(journal.createdAt), "MMM d, yyyy")}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/30">
              {journal.duration ? (
                <span className="text-primary/60">{formatDuration(journal.duration)} duration</span>
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
              className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete memory?</AlertDialogTitle>
              <AlertDialogDescription>This action will permanently remove this journal entry.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(journal.id)} className="bg-destructive hover:bg-destructive/90 rounded-lg">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Link href={`/dashboard/journal/${journal.id}?type=${journal.type}`} className="flex-1 relative z-10">
        <div className="space-y-3">
          {journal.title && (
            <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {journal.title}
            </h3>
          )}
          
          {journal.type === "video" && journal.thumbnailUrl && (
            <div className="aspect-video w-full rounded-xl bg-muted/30 overflow-hidden mb-2 border border-border/10 group-hover:border-primary/10">
              <img src={journal.thumbnailUrl} alt={journal.title || "Video thumbnail"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <p className="text-sm text-muted-foreground/60 line-clamp-3 leading-relaxed font-medium">
            {preview || (journal.type === "video" ? "Processing video memory..." : journal.type === "audio" ? "Processing audio memory..." : "No content yet")}{preview ? "..." : ""}
          </p>
        </div>
      </Link>

      {journal.tags && journal.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border/10 relative z-10">
          {journal.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-muted-foreground/40 bg-muted/10 border border-border/20 px-2 py-0.5 rounded-md">
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
    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center mb-6 border border-border/10">
        <Sparkles className="h-6 w-6 text-muted-foreground/20" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1 tracking-tight">{hasQuery ? "No memories found" : "Your memory palace is empty"}</h3>
      <p className="text-sm font-medium text-muted-foreground/40 mb-6 max-w-xs">
        {hasQuery ? "Try refining your search terms" : "Capture your first thought or media moment to get started"}
      </p>
      {!hasQuery && (
        <Link href="/dashboard/journal/text/new">
          <Button size="sm" className="rounded-xl px-6 h-10">Create First Entry</Button>
        </Link>
      )}
    </div>
  );
}