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
      // redirect happens in action
    } catch (error: any) {
      toast.error(`Could not connect agent tools: ${error.message}`);
      setIsConnecting(null);
    }
  }

  async function handleComposioDisconnect(appName: string) {
    if (!confirm(`Are you sure you want to disconnect ${appName}? This will revoke AI agent access.`)) return;
    setIsDisconnecting(appName);
    try {
      await disconnectComposioApp(appName);
      toast.success(`${appName} disconnected successfully.`);
      router.refresh();
    } catch (error: any) {
      toast.error(`Could not disconnect: ${error.message}`);
    } finally {
      setIsDisconnecting(null);
    }
  }

  function isComposioConnected(slug?: string) {
    if (!slug) return false;
    return composioApps.some(app => app.slug === slug.toLowerCase());
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {CONNECTORS.map((connector) => {
        const composioActive = isComposioConnected(connector.composioSlug);
        const loading = isConnecting === connector.composioSlug;
        const Icon = connector.icon;

        return (
          <div key={connector.id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl border border-border/40 bg-muted/30 transition-transform group-hover:scale-105", 
                connector.color.replace('text-', 'bg-').replace('500', '50/10')
              )}>
                <Icon className={cn("h-7 w-7", connector.color)} />
              </div>
              <StatusBadge active={composioActive} label="Tools" />
            </div>

            {/* Info */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground tracking-tight">{connector.name}</h3>
              <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">{connector.detail}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                type="button"
                variant={composioActive ? "outline" : "default"}
                size="lg"
                className="w-full gap-2 rounded-xl h-11"
                disabled={loading || isDisconnecting === connector.composioSlug || composioActive}
                onClick={() => handleComposioConnect(connector.composioSlug!)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className={cn("h-4 w-4", !composioActive && "fill-current")} />}
                {composioActive ? "Agent Tools Active" : "Connect Tools"}
              </Button>

              {composioActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5"
                  disabled={isDisconnecting === connector.composioSlug}
                  onClick={() => handleComposioDisconnect(connector.composioSlug!)}
                >
                  {isDisconnecting === connector.composioSlug ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  ) : "Disconnect Integration"}
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
