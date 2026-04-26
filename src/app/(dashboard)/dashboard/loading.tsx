import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-4 w-full">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="h-12 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="h-px bg-border/20 flex-1" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <div className="h-px bg-border/20 flex-1" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
