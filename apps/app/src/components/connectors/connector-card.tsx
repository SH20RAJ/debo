"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Pause, Lock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Connector } from "@/lib/types";

const statusConfig: Record<Connector["status"], { label: string; variant: "secondary" | "default" | "outline"; icon?: React.ComponentType<{ className?: string }> }> = {
  not_connected: { label: "Not connected", variant: "secondary" },
  connected: { label: "Connected", variant: "default", icon: Check },
  syncing: { label: "Syncing", variant: "outline", icon: Loader2 },
  needs_attention: { label: "Needs attention", variant: "outline", icon: AlertCircle },
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

  const isConnected = status === "connected" || status === "syncing" || status === "needs_attention";

  return (
    <Card className="transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: connector.color }}
          >
            {connector.icon}
          </div>
          <Badge variant={config.variant} className="gap-1">
            {StatusIcon && (
              <StatusIcon className={cn("w-3 h-3", status === "syncing" && "animate-spin")} />
            )}
            {config.label}
          </Badge>
        </div>

        <h3 className="font-semibold text-card-foreground">{connector.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-3">{connector.description}</p>

        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Lock className="w-3 h-3 mt-0.5 shrink-0" />
          {connector.permission}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleToggle}
          disabled={connecting}
          variant={isConnected ? "destructive" : "default"}
          className="w-full"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
            </>
          ) : isConnected ? (
            "Disconnect"
          ) : (
            "Connect"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
