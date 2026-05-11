"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nango from "@nangohq/frontend";
import {
  Link2,
  Link2Off,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { deleteNangoConnection } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { CONNECTORS } from "@/config/connectors";
import { cn } from "@/lib/utils";

type Connection = {
  providerConfigKey?: string;
  provider_config_key?: string;
};

export function ConnectorsList({
  connections = [],
  userId,
}: {
  connections?: Connection[];
  userId: string;
}) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const router = useRouter();

  async function handleConnect(providerConfigKey: string) {
    if (!process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY) {
      toast.error("Nango public key is missing.");
      return;
    }

    setIsConnecting(providerConfigKey);
    try {
      const nango = new Nango({ publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY });
      await nango.auth(providerConfigKey, userId);
      toast.success(`${getConnectorName(providerConfigKey)} connected`);
      router.refresh();
    } catch (error) {
      console.error("Nango auth error:", error);
      toast.error(`Could not connect ${getConnectorName(providerConfigKey)}.`);
    } finally {
      setIsConnecting(null);
    }
  }

  async function handleDisconnect(providerConfigKey: string) {
    setIsConnecting(providerConfigKey);
    try {
      const ok = await deleteNangoConnection(providerConfigKey);
      if (!ok) throw new Error("Disconnect failed");
      toast.success(`${getConnectorName(providerConfigKey)} disconnected`);
      router.refresh();
    } catch {
      toast.error("Could not disconnect.");
    } finally {
      setIsConnecting(null);
    }
  }

  function isConnected(provider: string) {
    return connections.some((connection) => {
      const key = connection.providerConfigKey || connection.provider_config_key;
      return key === provider;
    });
  }

  function getConnectorName(providerConfigKey: string) {
    return CONNECTORS.find((connector) => connector.id === providerConfigKey)?.name || providerConfigKey;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CONNECTORS.map((connector) => {
        const connected = isConnected(connector.id);
        const loading = isConnecting === connector.id;
        const Icon = connector.icon;

        return (
          <div key={connector.id} className="duo-card flex min-h-48 flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border-2", connector.surface)}>
                <Icon className={cn("h-6 w-6", connector.color)} />
              </div>
              <span
                className={cn(
                  "rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                  connected
                    ? "border-duo-feather bg-duo-green/10 text-duo-green"
                    : "border-duo-swan bg-duo-polar text-duo-wolf"
                )}
              >
                {connected ? "On" : "Off"}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-duo-eel">{connector.name}</h3>
              <p className="text-sm font-bold text-duo-wolf">{connector.detail}</p>
            </div>
            {connected ? (
              <Button
                type="button"
                variant="duolingo-outline"
                size="sm"
                className="w-full gap-2"
                disabled={loading}
                onClick={() => handleDisconnect(connector.id)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2Off className="h-4 w-4" />}
                Disconnect
              </Button>
            ) : (
              <Button
                type="button"
                variant="duolingo"
                size="sm"
                className="w-full gap-2"
                disabled={loading}
                onClick={() => handleConnect(connector.id)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Connect
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
