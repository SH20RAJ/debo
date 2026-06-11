"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Pause, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Connector } from "@/lib/types";

const statusConfig: Record<
  Connector["status"],
  {
    label: string;
    variant: "secondary" | "default" | "outline";
    icon?: React.ComponentType<{ className?: string }>;
  }
> = {
  not_connected: { label: "Not connected", variant: "outline" },
  connected: { label: "Connected", variant: "default", icon: Check },
  syncing: { label: "Syncing", variant: "outline", icon: Loader2 },
  needs_attention: {
    label: "Needs attention",
    variant: "outline",
    icon: AlertCircle,
  },
  paused: { label: "Paused", variant: "secondary", icon: Pause },
};

export function ConnectorCard({
  connector,
  onConnect,
  onDisconnect,
}: {
  connector: Connector & { provider: string };
  onConnect: (provider: string) => Promise<void>;
  onDisconnect: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const status = connector.status;
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const isConnected =
    status === "connected" || status === "syncing" || status === "needs_attention";

  async function handleToggle() {
    setLoading(true);
    try {
      if (isConnected) {
        await onDisconnect(connector.id);
      } else {
        await onConnect(connector.provider);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="size-10 rounded-xl flex items-center justify-center text-base font-bold text-white"
          style={{ backgroundColor: connector.color }}
        >
          {connector.icon}
        </div>
        <Badge
          variant={config.variant}
          className="gap-1 rounded-full text-[10px] px-2"
        >
          {StatusIcon && (
            <StatusIcon
              className={cn("size-3", status === "syncing" && "animate-spin")}
            />
          )}
          {config.label}
        </Badge>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">
          {connector.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {connector.description}
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
        <Lock className="size-3 mt-0.5 shrink-0" />
        <span className="line-clamp-2">{connector.permission}</span>
      </p>

      <Button
        onClick={handleToggle}
        disabled={loading}
        variant={isConnected ? "outline" : "default"}
        size="sm"
        className={cn(
          "w-full rounded-xl",
          !isConnected &&
            "bg-primary text-primary-foreground shadow-[0_3px_0_#46A302] hover:brightness-105 active:translate-y-[2px] active:shadow-none transition-all"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Processing...
          </>
        ) : isConnected ? (
          "Disconnect"
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  );
}

