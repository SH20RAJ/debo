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

export function ConnectorCard({ connector }: { connector: Connector }) {
  const [status, setStatus] = useState(connector.status);
  const [connecting, setConnecting] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  function handleToggle() {
    if (status === "not_connected" || status === "paused") {
      setConnecting(true);
      setTimeout(() => {
        setStatus("connected");
        setConnecting(false);
      }, 1200);
    } else {
      setStatus("not_connected");
    }
  }

  const isConnected =
    status === "connected" || status === "syncing" || status === "needs_attention";

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-primary/30 flex flex-col gap-3">
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
        disabled={connecting}
        variant={isConnected ? "outline" : "default"}
        size="sm"
        className={cn(
          "w-full rounded-xl",
          !isConnected &&
            "bg-primary text-primary-foreground shadow-[0_3px_0_#46A302] hover:brightness-105 active:translate-y-[2px] active:shadow-none transition-all"
        )}
      >
        {connecting ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Connecting...
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
