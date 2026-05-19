"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Pause } from "lucide-react";

type ConnectorStatus = "not_connected" | "connected" | "syncing" | "needs_attention" | "paused";

export interface Connector {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: ConnectorStatus;
  permission: string;
}

const statusConfig: Record<ConnectorStatus, { label: string; className: string }> = {
  not_connected: { label: "Not connected", className: "bg-muted text-muted-foreground" },
  connected: { label: "Connected", className: "bg-primary/10 text-primary" },
  syncing: { label: "Syncing", className: "bg-blue-500/10 text-blue-500" },
  needs_attention: { label: "Needs attention", className: "bg-amber-500/10 text-amber-500" },
  paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
};

export function ConnectorCard({ connector }: { connector: Connector }) {
  const [status, setStatus] = useState(connector.status);
  const [connecting, setConnecting] = useState(false);
  const config = statusConfig[status];

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

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
          style={{ backgroundColor: connector.color }}
        >
          {connector.icon}
        </div>
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", config.className)}>
          {status === "syncing" && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
          {status === "needs_attention" && <AlertCircle className="w-3 h-3 inline mr-1" />}
          {status === "paused" && <Pause className="w-3 h-3 inline mr-1" />}
          {status === "connected" && <Check className="w-3 h-3 inline mr-1" />}
          {config.label}
        </span>
      </div>

      <h3 className="font-bold text-foreground">{connector.name}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-3">{connector.description}</p>

      <p className="text-xs text-muted-foreground mb-4 flex items-start gap-1.5">
        <span className="mt-0.5">🔒</span>
        {connector.permission}
      </p>

      <button
        onClick={handleToggle}
        disabled={connecting}
        className={cn(
          "w-full py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200",
          status === "not_connected" || status === "paused"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-destructive/10 text-destructive hover:bg-destructive/20"
        )}
      >
        {connecting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
          </span>
        ) : status === "not_connected" || status === "paused" ? (
          "Connect"
        ) : (
          "Disconnect"
        )}
      </button>
    </div>
  );
}
