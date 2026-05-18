"use client";

import { useState } from "react";
import {
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { connectComposioApp, disconnectComposioApp } from "@/actions/composio";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CONNECTORS } from "@/config/connectors";
import { cn } from "@/lib/utils";

export function ConnectorsList({
  composioApps = [],
}: {
  composioApps?: { slug: string; id: string }[];
  userId: string;
}) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);

  async function handleComposioConnect(appName: string) {
    setIsConnecting(appName);
    try {
      await connectComposioApp(appName);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      setIsConnecting(null);
    }
  }

  async function handleComposioDisconnect(appName: string) {
    if (!confirm(`Disconnect ${appName}?`)) return;
    setIsDisconnecting(appName);
    try {
      await disconnectComposioApp(appName);
      toast.success("Disconnected.");
      router.refresh();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsDisconnecting(null);
    }
  }

  function isComposioConnected(slug?: string) {
    if (!slug) return false;
    return composioApps.some(app => app.slug === slug.toLowerCase());
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {CONNECTORS.map((connector) => {
        const active = isComposioConnected(connector.composioSlug);
        const loading = isConnecting === connector.composioSlug;
        const Icon = connector.icon;

        return (
          <div key={connector.id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/20 bg-card/10 p-6 transition-all hover:border-primary/20 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary/40 group-hover:text-primary transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                active ? "border-primary/20 bg-primary/5 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground/20"
              )}>
                <div className={cn("h-1 w-1 rounded-full", active ? "bg-primary animate-pulse" : "bg-muted-foreground/20")} />
                {active ? "Connected" : "Inactive"}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 mb-8">
              <h3 className="text-base font-bold text-foreground/80 tracking-tight">{connector.name}</h3>
              <p className="text-xs font-medium text-muted-foreground/40 leading-relaxed">{connector.detail}</p>
            </div>

            {/* Tools Area (Visible only when connected) */}
            {active && (
              <div className="mb-8 pt-4 border-t border-border/10">
                <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20 mb-3">Available Tools</div>
                <div className="flex flex-wrap gap-1.5">
                  {(connector as any).tools?.map((tool: string) => (
                    <div key={tool} className="px-2 py-0.5 rounded-md bg-muted/10 border border-border/10 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap">
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full h-10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border-border/20",
                  !active && "bg-primary text-primary-foreground border-none hover:bg-primary/90"
                )}
                disabled={loading || !!isDisconnecting || active}
                onClick={() => handleComposioConnect(connector.composioSlug!)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? "Active" : "Connect"}
              </Button>

              {active && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5"
                  disabled={!!isDisconnecting}
                  onClick={() => handleComposioDisconnect(connector.composioSlug!)}
                >
                  {isDisconnecting === connector.composioSlug ? "Disconnecting..." : "Disconnect"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
      active
        ? "border-primary/20 bg-primary/5 text-primary"
        : "border-border bg-muted/30 text-muted-foreground/50"
    )}>
      <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "bg-muted-foreground/30")} />
      {label}
    </div>
  );
}
