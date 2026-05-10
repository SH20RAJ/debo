import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 lg:px-8">
        
        <header className="space-y-6">
          <Skeleton className="h-12 w-64 md:h-14" />
          <Skeleton className="h-6 w-full max-w-md" />
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Skeleton className="h-16 w-32 md:w-40 rounded-2xl" />
            <Skeleton className="h-16 w-32 md:w-40 rounded-2xl" />
            <Skeleton className="h-16 w-32 md:w-40 rounded-2xl" />
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-duo-swan/20 p-5 space-y-4">
                <div className="flex justify-between">
                   <Skeleton className="h-4 w-24" />
                   <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex gap-2 pt-4">
                   <Skeleton className="h-6 w-12 rounded-md" />
                   <Skeleton className="h-6 w-12 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
