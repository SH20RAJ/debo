import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContextRailProps {
  children?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  title?: string;
}

export function ContextRail({
  children,
  content,
  className,
  title = "Context",
}: ContextRailProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[280px] shrink-0 border-l border-border bg-card/50 h-full",
        className
      )}
    >
      {children ?? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {title}
              </h3>
              {content ?? (
                <div className="space-y-3">
                  <Card className="rounded-xl border-2 border-border shadow-[0_2px_0_var(--border)]">
                    <CardContent className="p-3 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border-2 border-border shadow-[0_2px_0_var(--border)]">
                    <CardContent className="p-3">
                      <div className="h-20 rounded-lg bg-muted animate-pulse" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border-2 border-border shadow-[0_2px_0_var(--border)]">
                    <CardContent className="p-3 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
