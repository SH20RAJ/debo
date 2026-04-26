import { searchJournals } from "../search-actions";
import { getJournals } from "../actions";
import { JournalListManager } from "@/components/dashboard/journal-list-manager";
import { BookOpen } from "lucide-react";

export default async function JournalsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const sort = typeof searchParams.sort === 'string' && searchParams.sort === 'asc' ? 'asc' : 'desc';

  let journals = [];

  if (query) {
    // If semantic search is active, use searchJournals.
    // Note: semantic search sorts by relevance, but we can respect chron sort if asked, 
    // but typically users want relevance for search. We'll pass it as is.
    journals = await searchJournals(query, 20); // Fetch up to 20 relevant journals
  } else {
    // Standard chronological fetch
    journals = await getJournals(sort);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-4">
          Library
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          Journals
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Manage, search, and review your historical intelligence context.
        </p>
      </div>

      <JournalListManager 
        journals={journals} 
        initialQuery={query}
        initialSort={sort}
      />
    </div>
  );
}
