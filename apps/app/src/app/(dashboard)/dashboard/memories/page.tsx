import { Suspense } from "react";
import { getMemories } from "@/actions/memories";
import { MemoryManager } from "@/components/dashboard/memories/memory-manager";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "lucide-react";

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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 lg:px-8">
        <header className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-muted px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
            <Database className="h-4 w-4 text-primary" />
            Memory Engine
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-heading font-extrabold tracking-tight text-foreground md:text-6xl">
              Your <span className="text-primary">Memories</span>
            </h1>
            <p className="max-w-2xl text-xl font-bold leading-relaxed text-muted-foreground">
              View and manage what Debo remembers about your life.
            </p>
          </div>
        </header>

        <Suspense fallback={<MemoriesLoading />}>
            <MemoryManager 
              initialMemories={memories} 
              initialQuery={query}
              totalCount={totalCount}
            />
        </Suspense>
      </div>
    </div>
  );
}

function MemoriesLoading() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-14 flex-1 rounded-2xl border-2 border-border" />
                <div className="flex gap-2">
                    <Skeleton className="h-14 w-32 rounded-2xl border-2 border-border" />
                    <Skeleton className="h-14 w-32 rounded-2xl border-2 border-border" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-2xl border-2 border-border" />
            <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl border-2 border-border" />
                ))}
            </div>
        </div>
    );
}
