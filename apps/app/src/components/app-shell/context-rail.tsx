import { cn } from "@/lib/utils";

interface ContextRailProps {
  children?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
}

export function ContextRail({ children, content, className }: ContextRailProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[280px] shrink-0 border-l border-border bg-card/50 h-full overflow-y-auto",
        className
      )}
    >
      {children ?? (
        <div className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Context
          </h3>
          {content ?? (
            <div className="space-y-3">
              <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-20 rounded-lg bg-muted animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
