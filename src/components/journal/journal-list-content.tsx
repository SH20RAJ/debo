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
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-duo-swan" />
                    <Input 
                        placeholder="Search your memories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 h-14 rounded-2xl border-2 border-duo-swan bg-white text-lg font-bold text-duo-eel focus-visible:ring-0 focus-visible:border-duo-macaw transition-colors"
                    />
                </div>
                <Button 
                    variant="duolingo-outline" 
                    size="lg"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="h-14 w-full md:w-auto"
                >
                    {sortOrder === "desc" ? <SortDesc className="h-5 w-5 mr-2" /> : <SortAsc className="h-5 w-5 mr-2" />}
                    {sortOrder === "desc" ? "NEWEST" : "OLDEST"}
                </Button>
            </div>

            {/* List */}
            <div className="grid gap-6">
                {filteredJournals.length > 0 ? (
                    filteredJournals.map((journal) => (
                        <Link key={journal.id} href={`/dashboard/journal/${journal.id}`}>
                            <div className="duo-card hover-bounce group p-0 overflow-hidden">
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-duo-swan">
                                            <Calendar className="h-4 w-4 text-duo-blue" />
                                            {format(new Date(journal.createdAt), "MMMM do, yyyy")}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-heading font-black text-duo-eel group-hover:text-duo-blue transition-colors">
                                                {journal.title || "Untitled Entry"}
                                            </h3>
                                            <p className="text-duo-wolf font-bold line-clamp-2 text-base leading-relaxed">
                                                {journal.content.replace(/[#*`]/g, "")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-end">
                                        <div className="h-14 w-14 rounded-2xl bg-duo-polar border-2 border-duo-swan flex items-center justify-center text-duo-swan transition-all group-hover:bg-duo-macaw group-hover:text-white group-hover:border-duo-macaw group-hover:animate-wiggle">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-24 text-center space-y-6 bg-duo-polar rounded-3xl border-2 border-dashed border-duo-swan">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-white border-2 border-duo-swan flex items-center justify-center animate-bounce-subtle">
                            <Search className="h-8 w-8 text-duo-swan" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-heading font-black text-duo-eel uppercase tracking-wider">No entries found</h3>
                            <p className="text-lg font-bold text-duo-wolf">Try adjusting your search query or write your first journal.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
