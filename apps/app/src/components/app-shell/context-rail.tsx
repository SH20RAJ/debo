import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

interface ContextRailProps {
  children?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  title?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ContextRail({
  children,
  content,
  className,
  title = "Context",
  collapsed = false,
  onToggle,
}: ContextRailProps) {
  if (collapsed) {
    return (
      <div className="hidden lg:flex items-start justify-center pt-3 w-10 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground rounded-lg"
          aria-label="Expand context panel"
        >
          <PanelRightOpen className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[280px] shrink-0 border-l border-border bg-card/50 h-full",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground rounded-lg h-7 w-7"
            aria-label="Collapse context panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </Button>
        )}
      </div>
      {children ?? (
        <ScrollArea className="flex-1">
          <div className="px-3 pb-4 space-y-3">
            {content ?? (
              <>
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
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
