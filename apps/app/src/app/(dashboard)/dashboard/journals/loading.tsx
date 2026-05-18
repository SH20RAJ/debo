import { Skeleton } from "@/components/ui/skeleton";

export default function JournalsLoading() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="mb-10 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </header>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-full sm:w-32 rounded-xl" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border-2 border-border bg-card p-5 min-h-72">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16 rounded-lg" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
                <div className="mt-auto pt-4 border-t-2 border-border/40">
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
