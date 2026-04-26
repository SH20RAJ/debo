import { searchJournals } from "@/actions/search";
import { getJournals, getJournalsCount } from "@/actions/journals";
import { JournalListManager } from "@/components/dashboard/journal/journal-list-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Archive",
  description: "Search and review your entire personal intelligence history.",
};

export default async function JournalsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const sort = typeof searchParams.sort === 'string' && searchParams.sort === 'asc' ? 'asc' : 'desc';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 9; // Grid of 3x3
  const offset = (page - 1) * limit;

  let journals = [];
  let totalCount = 0;

  if (query) {
    // Note: searchJournals currently doesn't support pagination in its signature
    // We'll fetch 20 for now as it did before.
    journals = await searchJournals(query, 20); 
    totalCount = journals.length;
  } else {
    // Standard chronological fetch with pagination
    journals = await getJournals(sort, limit, offset);
    totalCount = await getJournalsCount();
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <JournalListManager 
        journals={journals} 
        initialQuery={query}
        initialSort={sort}
        totalCount={totalCount}
        currentPage={page}
        pageSize={limit}
      />
    </div>
  );
}
