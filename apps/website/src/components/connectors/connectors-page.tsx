"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Home } from "lucide-react";
import { ConnectorCard } from "./connector-card";
import { api } from "@/lib/api";
import type { Connector } from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const PROVIDER_METADATA: Record<string, {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  permission: string;
}> = {
  homeassistant: {
    name: "Home Assistant",
    description: "Control and monitor your smart home devices (lights, switches, climate, locks).",
    icon: "🏠",
    color: "#41BDF5",
    category: "Smart Home & IoT",
    permission: "Read states and call device control services",
  },
  gmail: {
    name: "Gmail",
    description: "Sync your emails to search conversations, summaries, and action items.",
    icon: "✉️",
    color: "#EA4335",
    category: "Communication",
    permission: "Read-only access to emails and metadata",
  },
  google_calendar: {
    name: "Google Calendar",
    description: "Sync your schedule to cross-reference meetings, events, and timelines.",
    icon: "📅",
    color: "#4285F4",
    category: "Productivity",
    permission: "Read-only access to calendar events",
  },
  notion: {
    name: "Notion",
    description: "Import pages, databases, and workspace notes into your memory graph.",
    icon: "📓",
    color: "#000000",
    category: "Knowledge & Notes",
    permission: "Read and import pages shared with the integration",
  },
  github: {
    name: "GitHub",
    description: "Sync repositories, pull requests, issues, and commits.",
    icon: "💻",
    color: "#181717",
    category: "Development",
    permission: "Read access to repositories, code, and issues",
  },
  slack: {
    name: "Slack",
    description: "Index channels and direct messages for conversational context.",
    icon: "💬",
    color: "#4A154B",
    category: "Communication",
    permission: "Read public channels and direct messages",
  },
  drive: {
    name: "Google Drive",
    description: "Sync PDFs, text documents, spreadsheets, and presentations.",
    icon: "📁",
    color: "#34A853",
    category: "Knowledge & Notes",
    permission: "Read-only access to select files and folders",
  },
};

function normalizeConnector(raw: any): Connector & { provider: string } {
  const provider = raw.provider || "";
  const meta = PROVIDER_METADATA[provider] || {
    name: provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Unknown",
    description: "Connect this service to import data.",
    icon: "🔌",
    color: "#6b7280",
    category: "Other",
    permission: "Required scopes for read access",
  };

  const name = raw.name ?? meta.name;
  const description = raw.description ?? meta.description;
  const icon = raw.icon ?? meta.icon;
  const color = raw.color ?? meta.color;
  const category = raw.category ?? meta.category;
  const permission = raw.permission ?? meta.permission;

  return {
    id: raw.id ?? crypto.randomUUID(),
    name,
    description,
    icon,
    color,
    status: raw.status === "disconnected" ? "not_connected" : raw.status ?? "not_connected",
    permissions: [permission],
    permission,
    category,
    provider,
  } as any;
}

export function ConnectorsPage() {
  const [connectors, setConnectors] = useState<(Connector & { provider: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pollActive, setPollActive] = useState(false);

  // Home Assistant Modal states
  const [haModalOpen, setHaModalOpen] = useState(false);
  const [haUrl, setHaUrl] = useState("");
  const [haToken, setHaToken] = useState("");
  const [haSimulated, setHaSimulated] = useState(true);
  const [haConnecting, setHaConnecting] = useState(false);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    async function fetchConnectors() {
      try {
        const data = await api.connectors.list();
        const items = Array.isArray(data) ? data : data?.connectors ?? data?.data ?? [];
        if (!cancelled) {
          setConnectors(items.map(normalizeConnector));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchConnectors();
    return () => { cancelled = true; };
  }, []);

  // Poll connectors status while pollActive is true
  useEffect(() => {
    if (!pollActive) return;

    const interval = setInterval(async () => {
      try {
        const data = await api.connectors.list();
        const items = Array.isArray(data) ? data : data?.connectors ?? data?.data ?? [];
        const normalized = items.map(normalizeConnector);

        // Check if any previously disconnected connector became connected
        const hasNewConnection = normalized.some((newConn: Connector) => {
          const oldConn = connectors.find((c) => c.id === newConn.id);
          return oldConn && oldConn.status === "not_connected" && newConn.status === "connected";
        });

        setConnectors(normalized);

        if (hasNewConnection) {
          setPollActive(false);
          toast.success("Connected successfully!");
        }
      } catch (err) {
        console.error("Polling connectors failed", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [pollActive, connectors]);

  const handleConnect = async (provider: string) => {
    if (provider === "homeassistant") {
      setHaModalOpen(true);
      return;
    }

    try {
      const res = await api.connectors.connect(provider);
      if (res && res.redirectUrl) {
        // Open OAuth popup window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          res.redirectUrl,
          "Connect " + provider,
          `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );
        // Activate polling
        setPollActive(true);
        // Timeout after 2 minutes to prevent infinite background requests
        setTimeout(() => setPollActive(false), 120000);
      } else {
        toast.error("Failed to retrieve authentication link.");
      }
    } catch {
      toast.error("Error connecting service.");
    }
  };

  const handleConnectHomeAssistant = async () => {
    setHaConnecting(true);
    try {
      const res = await fetch("/api/connectors/homeassistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: haUrl,
          token: haToken,
          simulated: haSimulated,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect Home Assistant");
      }
      setHaModalOpen(false);
      
      // Refresh list
      const freshData = await api.connectors.list();
      const items = Array.isArray(freshData) ? freshData : freshData?.connectors ?? freshData?.data ?? [];
      setConnectors(items.map(normalizeConnector));
      toast.success("Home Assistant connected successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect Home Assistant");
    } finally {
      setHaConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await api.connectors.disconnect(id);
      // Refresh connectors list
      const data = await api.connectors.list();
      const items = Array.isArray(data) ? data : data?.connectors ?? data?.data ?? [];
      setConnectors(items.map(normalizeConnector));
      toast.success("Disconnected successfully.");
    } catch {
      toast.error("Failed to disconnect service.");
    }
  };

  // Group connectors by category
  const categories = connectors.reduce<Record<string, (Connector & { provider: string })[]>>((acc, c) => {
    const cat = c.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  const categoryEntries = Object.entries(categories);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
            Connectors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bring your existing memory sources into Debo.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-primary/15 bg-primary/5 px-3 py-2.5 flex items-start gap-2">
          <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Connectors are optional. Disconnect anytime and imported data will be removed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-border bg-card p-4 h-44 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
            Connectors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bring your existing memory sources into Debo.
          </p>
        </div>
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
            <ShieldCheck className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[28ch]">
            Could not load connectors. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[var(--font-nunito)]">
            Connectors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bring your existing memory sources into Debo.
          </p>
        </div>
        {pollActive && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border">
            <Loader2 className="size-3 animate-spin text-primary" />
            <span>Awaiting authorization...</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border-2 border-primary/15 bg-primary/5 px-3 py-2.5 flex items-start gap-2">
        <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Connectors are optional. You control what Debo remembers and can
          disconnect anytime &mdash; all imported data will be removed.
        </p>
      </div>

      <div className="space-y-6">
        {categoryEntries.map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((connector) => (
                <ConnectorCard
                  key={connector.id}
                  connector={connector}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={haModalOpen} onOpenChange={setHaModalOpen}>
        <DialogContent className="max-w-md bg-[var(--background)] border border-border rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="size-12 rounded-2xl bg-[#41BDF5]/15 flex items-center justify-center text-2xl text-[#41BDF5] mb-2">
              🏠
            </div>
            <DialogTitle className="text-xl font-bold font-[var(--font-nunito)] text-foreground">
              Connect Home Assistant
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Integrate your smart home with Debo. Control smart bulbs, fans, locks, and climate via natural voice or text commands.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-primary/10 bg-primary/5">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-foreground block">
                  Simulated Demo Mode
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Creates virtual mock devices to test AI execution instantly without real Home Assistant.
                </span>
              </div>
              <Switch
                checked={haSimulated}
                onCheckedChange={setHaSimulated}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {!haSimulated && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Home Assistant URL
                  </label>
                  <Input
                    placeholder="https://your-hass-instance.duckdns.org:8123"
                    value={haUrl}
                    onChange={(e) => setHaUrl(e.target.value)}
                    className="rounded-xl border-border bg-card text-sm focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Long-Lived Access Token
                  </label>
                  <Input
                    type="password"
                    placeholder="eyJhbGciOi..."
                    value={haToken}
                    onChange={(e) => setHaToken(e.target.value)}
                    className="rounded-xl border-border bg-card text-sm focus-visible:ring-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Generate this in your Home Assistant Profile settings page.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setHaModalOpen(false)}
              className="rounded-full font-medium"
              disabled={haConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectHomeAssistant}
              className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              disabled={haConnecting}
            >
              {haConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect Integration</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
