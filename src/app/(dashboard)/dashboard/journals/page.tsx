import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { getJournals, getJournalsCount } from "@/actions/journals";
import { JournalListManager } from "@/components/dashboard/journal/journal-list-manager";
import { Metadata } from "next";
import { Sparkles } from "lucide-react";

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: "asc" | "desc"; page?: string }>;
}) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const params = await searchParams;
  const query = params.q || "";
  const sort = params.sort || "desc";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 9;

  // We should pass the query to getJournals eventually, but for now we fetch all or paginate properly.
  // We'll update getJournals to take query next.
  const journals = await getJournals(sort, pageSize, (page - 1) * pageSize, user.id, query);
  const totalCount = await getJournalsCount(query);

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            <Sparkles className="h-4 w-4 text-duo-blue" />
            ARCHIVE
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-5xl lg:text-6xl">
              All your <span className="text-duo-swan">entries</span>
            </h1>
            <p className="max-w-2xl text-xl font-bold text-duo-wolf">
              Browse your past notes and memories.
            </p>
          </div>
        </header>

        <div className="relative">
          <JournalListManager 
            journals={journals} 
            initialQuery={query} 
            initialSort={sort}
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
          />
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse every journal entry in your personal archive.",
};
