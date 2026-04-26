"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SortDesc, SortAsc, CalendarIcon, FileText, Sparkles, Trash2, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteJournal } from "@/app/(dashboard)/dashboard/actions";
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
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function JournalListManager({ journals, initialQuery, initialSort }: { 
  journals: JournalProps[], 
  initialQuery: string, 
  initialSort: string 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Use a stable callback for navigation to avoid unnecessary re-renders
  const updateUrl = useCallback((newQuery: string, newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }
    params.set("sort", newSort);

    const newUrl = `${pathname}?${params.toString()}`;
    
    // Only push if the URL has actually changed
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      startTransition(() => {
        router.push(newUrl, { scroll: false });
      });
    }
  }, [pathname, router, searchParams]);

  // Debounce search query updates
  useEffect(() => {
    // Skip on initial mount if values match
    if (query === initialQuery && sort === initialSort) return;

    const timer = setTimeout(() => {
      updateUrl(query, sort);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, sort, initialQuery, initialSort, updateUrl]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteJournal(id);
      toast.success("Entry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Search and Sort Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b">
        <div className="relative w-full md:max-w-md flex items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Semantic search..." 
              className="pl-9 pr-4 h-11 rounded-2xl bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {query && (
            <Badge variant="secondary" className="absolute right-2 flex-shrink-0 animate-in fade-in zoom-in-95 bg-primary/10 text-primary border-none">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={sort} onValueChange={(val) => {
            setSort(val);
            updateUrl(query, val);
          }}>
            <SelectTrigger className="h-11 rounded-2xl bg-muted/50 border-none w-full md:w-[160px]">
              <div className="flex items-center gap-2">
                {sort === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          
          <Link href="/dashboard/journal/new" className="hidden sm:block">
            <Button className="h-11 rounded-2xl px-6 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Results Section */}
      <div className={`transition-all duration-500 ${isPending ? "opacity-40 grayscale" : "opacity-100"}`}>
        
        {journals.length === 0 ? (
          <div className="border border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 mt-12 bg-muted/10">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center shadow-inner">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">No entries found</h3>
              <p className="text-muted-foreground max-w-sm">
                {query ? "Try searching for something else or check your spelling." : "Start capturing your thoughts by creating your first entry."}
              </p>
            </div>
            {!query && (
                <Link href="/dashboard/journal/new">
                    <Button size="lg" className="rounded-2xl px-8">Create New Entry</Button>
                </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {journals.map((journal) => (
              <Card key={journal.id} className="group border-none bg-muted/30 hover:bg-muted/50 transition-all duration-300 relative overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                  <div className="p-6 pb-20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {format(new Date(journal.createdAt), "MMM d, yyyy")}
                        </div>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isDeleting === journal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the entry from your repository.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(journal.id)}
                                        className="bg-destructive hover:bg-destructive/90 rounded-2xl"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <Link href={`/dashboard/journal/${journal.id}`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-4 text-foreground/80 leading-relaxed font-medium">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {journal.content}
                        </ReactMarkdown>
                        </div>
                    </Link>
                  </div>

                  {/* Bottom Fade and Link Area */}
                  <Link href={`/dashboard/journal/${journal.id}`}>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 right-6 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                          Read Full Entry →
                      </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
      
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-8 right-8 sm:hidden z-20">
        <Link href="/dashboard/journal/new">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

