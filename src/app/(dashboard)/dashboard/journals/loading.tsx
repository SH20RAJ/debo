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
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card/40">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
