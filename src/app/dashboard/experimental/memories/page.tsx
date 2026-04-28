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

  const result = await getMemories(query);
  const memories = result.success && result.data ? result.data : [];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <MemoryManager 
        initialMemories={memories} 
        initialQuery={query}
      />
    </div>
  );
}
