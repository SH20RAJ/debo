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
          <div key={connector.id} className="duo-card group flex flex-col justify-between overflow-hidden p-0 border-b-4">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-0">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl border-b-4 transition-transform group-hover:scale-105", 
                connector.surface,
                connector.surface.replace('border-', 'border-b-')
              )}>
                <Icon className={cn("h-7 w-7", connector.color)} />
              </div>
              <div className="flex flex-col gap-2 items-end">
                <StatusBadge active={composioActive} label="Tools" />
              </div>
            </div>

            {/* Info */}
            <div className="px-5 py-4">
              <h3 className="text-xl font-black text-duo-eel">{connector.name}</h3>
              <p className="text-sm font-bold text-duo-wolf mt-1">{connector.detail}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 p-5 pt-0">
              <Button
                type="button"
                variant={composioActive ? "duolingo-outline" : "duolingo-fox"}
                size="sm"
                className="w-full gap-2 text-xs h-10"
                disabled={loading || isDisconnecting === connector.composioSlug || composioActive}
                onClick={() => handleComposioConnect(connector.composioSlug!)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {composioActive ? "Agent Tools Active" : "Connect AI Agent Tools"}
              </Button>

              {composioActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-[10px] font-black uppercase tracking-widest text-duo-wolf/40 hover:text-duo-cardinal hover:bg-duo-cardinal/5"
                  disabled={isDisconnecting === connector.composioSlug}
                  onClick={() => handleComposioDisconnect(connector.composioSlug!)}
                >
                  {isDisconnecting === connector.composioSlug ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  ) : "Disconnect"}
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
      "flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
      active
        ? "border-duo-feather bg-duo-green/10 text-duo-green"
        : "border-duo-swan bg-duo-polar text-duo-wolf/40"
    )}>
      <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-duo-green shadow-[0_0_8px_var(--duo-green)]" : "bg-duo-wolf/30")} />
      {label}
    </div>
  );
}
