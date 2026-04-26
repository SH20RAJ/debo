import { searchJournals } from "../search-actions";
import { getJournals } from "../actions";
import { JournalListManager } from "@/components/dashboard/journal/journal-list-manager";
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <JournalListManager 
        journals={journals} 
        initialQuery={query}
        initialSort={sort}
      />
    </div>
  );
}
