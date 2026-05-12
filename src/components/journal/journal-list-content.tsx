"use client";

import { useState } from "react";
import { Search, Calendar, SortAsc, SortDesc, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

interface Journal {
    id: string;
    title: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export function JournalListContent({ initialJournals }: { initialJournals: Journal[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const filteredJournals = initialJournals
        .filter(j => 
            (j.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            j.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="space-y-8 pb-32">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                        placeholder="Search your memories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-11 rounded-xl border-border bg-card/50 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                    />
                </div>
                <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="h-11 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase"
                >
                    {sortOrder === "desc" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
                    {sortOrder === "desc" ? "Newest" : "Oldest"}
                </Button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {filteredJournals.length > 0 ? (
                    filteredJournals.map((journal) => (
                        <Link key={journal.id} href={`/dashboard/journal/${journal.id}`}>
                            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/20 hover:bg-card hover:shadow-sm">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                            <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                            {format(new Date(journal.createdAt), "MMMM do, yyyy")}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                {journal.title || "Untitled Entry"}
                                            </h3>
                                            <p className="text-muted-foreground font-medium line-clamp-2 text-sm leading-relaxed">
                                                {journal.content.replace(/[#*`]/g, "")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-end shrink-0">
                                        <div className="h-10 w-10 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center text-muted-foreground/30 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-24 text-center space-y-6 rounded-3xl border border-dashed border-border bg-muted/10">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-background border border-border flex items-center justify-center">
                            <Search className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground tracking-tight">No memories found</h3>
                            <p className="text-sm font-medium text-muted-foreground">Try a different search term or capture a new memory.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
