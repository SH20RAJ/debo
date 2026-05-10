import { getMemories } from "@/actions/memories";
import { MemoryManager } from "@/components/dashboard/memories/memory-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Engine",
  description: "Manage your persistent memory facts and entity graph.",
};

export default async function MemoriesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 20;

  const result = await getMemories(query, pageSize, (page - 1) * pageSize);
  const memories = result.success && result.data ? result.data : [];
  const totalCount = result.success && result.totalCount ? result.totalCount : 0;

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
        <header className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Memory
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">Memories</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              View and manage what Debo remembers about you.
            </p>
          </div>
        </header>

        <MemoryManager 
          initialMemories={memories} 
          initialQuery={query}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
