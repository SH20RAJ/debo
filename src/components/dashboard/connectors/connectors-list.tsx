"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nango from "@nangohq/frontend";
import {
  Link2,
  Link2Off,
  Loader2,
  Zap,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { deleteNangoConnection } from "@/actions/settings";
import { connectComposioApp } from "@/actions/composio";
import { Button } from "@/components/ui/button";
import { CONNECTORS } from "@/config/connectors";
import { cn } from "@/lib/utils";

type Connection = {
  providerConfigKey?: string;
  provider_config_key?: string;
};

export function ConnectorsList({
  connections = [],
  composioApps = [],
  userId,
}: {
  connections?: Connection[];
  composioApps?: string[];
  userId: string;
}) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const router = useRouter();

  async function handleNangoConnect(providerConfigKey: string) {
    setIsConnecting(`${providerConfigKey}-nango`);
    try {
      const sessionRes = await fetch("/api/auth/nango/session", { method: "POST" });
      const { token, error: sessionError } = await sessionRes.json();
      
      if (!sessionRes.ok || sessionError) {
        throw new Error(sessionError || "Failed to create Nango session");
      }

      const nango = new Nango({ 
        publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY!,
      });
      
      await nango.auth(providerConfigKey, userId, {
        sessionToken: token
      });

      toast.success(`${getConnectorName(providerConfigKey)} sync connected`);
      router.refresh();
    } catch (error: any) {
      console.error("Nango auth error:", error);
      toast.error(`Could not connect sync: ${error.message}`);
    } finally {
      setIsConnecting(null);
    }
  }

  async function handleComposioConnect(appName: string) {
    setIsConnecting(`${appName}-composio`);
    try {
      await connectComposioApp(appName);
      // redirect happens in action
    } catch (error: any) {
      toast.error(`Could not connect agent tools: ${error.message}`);
      setIsConnecting(null);
    }
  }

  async function handleNangoDisconnect(providerConfigKey: string) {
    setIsConnecting(`${providerConfigKey}-nango`);
    try {
      const ok = await deleteNangoConnection(providerConfigKey);
      if (!ok) throw new Error("Disconnect failed");
      toast.success(`${getConnectorName(providerConfigKey)} sync disconnected`);
      router.refresh();
    } catch {
      toast.error("Could not disconnect sync.");
    } finally {
      setIsConnecting(null);
    }
  }

  function isNangoConnected(provider: string) {
    return connections.some((connection) => {
      const key = connection.providerConfigKey || connection.provider_config_key;
      return key === provider;
    });
  }

  function isComposioConnected(slug?: string) {
    if (!slug) return false;
    return composioApps.includes(slug.toLowerCase());
  }

  function getConnectorName(providerConfigKey: string) {
    return CONNECTORS.find((connector) => connector.id === providerConfigKey)?.name || providerConfigKey;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {CONNECTORS.map((connector) => {
        const nangoActive = isNangoConnected(connector.id);
        const composioActive = isComposioConnected(connector.composioSlug);
        const nangoLoading = isConnecting === `${connector.id}-nango`;
        const composioLoading = isConnecting === `${connector.composioSlug}-composio`;
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
                <StatusBadge active={nangoActive} label="Sync" />
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
              {/* Nango Sync Button */}
              <Button
                type="button"
                variant={nangoActive ? "duolingo-outline" : "duolingo"}
                size="sm"
                className="w-full gap-2 text-xs h-10"
                disabled={nangoLoading}
                onClick={() => nangoActive ? handleNangoDisconnect(connector.id) : handleNangoConnect(connector.id)}
              >
                {nangoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (nangoActive ? <Link2Off className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />)}
                {nangoActive ? "Disconnect Sync" : "Enable Background Sync"}
              </Button>

              {/* Composio Tools Button */}
              <Button
                type="button"
                variant={composioActive ? "duolingo-outline" : "duolingo-fox"}
                size="sm"
                className="w-full gap-2 text-xs h-10"
                disabled={composioLoading || composioActive}
                onClick={() => handleComposioConnect(connector.composioSlug!)}
              >
                {composioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {composioActive ? "Agent Tools Active" : "Connect AI Agent Tools"}
              </Button>
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
