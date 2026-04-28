import { Skeleton } from "@/components/ui/skeleton";

export default function AgentLoading() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:px-10 md:py-12 flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="space-y-4 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        
        <Skeleton className="w-full h-16 rounded-2xl" />

        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
