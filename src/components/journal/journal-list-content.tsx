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
        <div className="space-y-10 pb-40">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                        placeholder="Search your memories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-border bg-muted/20 text-base focus-visible:ring-primary/10"
                    />
                </div>
                <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="h-12 rounded-xl gap-2 px-5 border border-border bg-background hover:bg-muted/30 text-xs font-medium uppercase tracking-wider"
                >
                    {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                    {sortOrder === "desc" ? "Newest" : "Oldest"}
                </Button>
            </div>

            {/* List */}
            <div className="grid gap-3">
                {filteredJournals.length > 0 ? (
                    filteredJournals.map((journal) => (
                        <Link key={journal.id} href={`/dashboard/journal/${journal.id}`}>
                            <div className="group relative glass-card rounded-2xl transition-all active:scale-[0.995]">
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(journal.createdAt), "MMMM do, yyyy")}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                {journal.title || "Untitled Entry"}
                                            </h3>
                                            <p className="text-muted-foreground/60 line-clamp-2 text-sm leading-relaxed">
                                                {journal.content.replace(/[#*`]/g, "")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-end">
                                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4 bg-muted/5 rounded-2xl border border-dashed border-border">
                        <div className="mx-auto h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center">
                            <Search className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">No entries found</h3>
                            <p className="text-sm text-muted-foreground">Try adjusting your search query or write your first journal.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
