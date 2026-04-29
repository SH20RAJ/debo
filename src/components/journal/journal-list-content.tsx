"use client";

import { useState } from "react";
import { Search, Calendar, SortAsc, SortDesc, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="space-y-8 pb-40">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search your memories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-none bg-muted/40 text-lg focus-visible:ring-primary/20"
                    />
                </div>
                <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="h-14 rounded-2xl gap-2 px-6 bg-muted/20 hover:bg-muted/40"
                >
                    {sortOrder === "desc" ? <SortDesc className="h-5 w-5" /> : <SortAsc className="h-5 w-5" />}
                    {sortOrder === "desc" ? "Newest first" : "Oldest first"}
                </Button>
            </div>

            {/* List */}
            <div className="grid gap-6">
                {filteredJournals.length > 0 ? (
                    filteredJournals.map((journal) => (
                        <Link key={journal.id} href={`/dashboard/journal/${journal.id}`}>
                            <Card className="group relative border border-border/40 bg-card/40 hover:bg-card/60 rounded-[2rem] transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99] overflow-hidden">
                                <div className="absolute left-0 top-0 h-full w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                                <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(journal.createdAt), "MMMM do, yyyy")}
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                            {journal.title || "Untitled Entry"}
                                        </h3>
                                        <p className="text-muted-foreground/80 line-clamp-2 text-base leading-relaxed">
                                            {journal.content.replace(/[#*`]/g, "")}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all group-hover:rotate-6 group-hover:scale-110">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4 bg-muted/10 rounded-3xl border-2 border-dashed">
                        <div className="mx-auto h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No entries found</h3>
                        <p className="text-muted-foreground">Try adjusting your search query or write your first journal.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
