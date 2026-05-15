import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 lg:px-8">
        <header className="space-y-3">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-48 md:h-14" />
            <Skeleton className="h-6 w-full max-w-md" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
        </header>

        <div className="space-y-8 mt-4">
          <div className="flex gap-4 border-b border-border/40 pb-4">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
