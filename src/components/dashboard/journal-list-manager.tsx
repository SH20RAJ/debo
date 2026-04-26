"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SortDesc, SortAsc, CalendarIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce search query updates to URL
  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.set("sort", sort);
      router.push(`${pathname}?${params.toString()}`);
      setIsDebouncing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, sort, pathname, router, searchParams]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search journals semantically..." 
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                {sort === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                <SelectValue placeholder="Sort order" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading overlay for debounce */}
      <div className={`transition-opacity duration-200 ${isDebouncing ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        
        {journals.length === 0 ? (
          <div className="border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 mt-8">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No results found</h3>
            <p className="text-muted-foreground max-w-sm">
              {query ? "We couldn't find any journals matching your search." : "You haven't written any journals yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {journals.map((journal) => (
              <Link href={`/dashboard/journal/${journal.id}`} key={journal.id}>
                <Card className="hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(journal.createdAt), "MMMM d, yyyy • h:mm a")}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {journal.content}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
