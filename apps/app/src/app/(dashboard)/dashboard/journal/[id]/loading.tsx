import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-4 md:px-10 md:py-8 space-y-12">
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-9 w-24" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
