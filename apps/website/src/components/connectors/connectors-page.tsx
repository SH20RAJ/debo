"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ConnectorCard } from "./connector-card";
import { api } from "@/lib/api";
import type { Connector } from "@/lib/types";

function normalizeConnector(raw: any): Connector {
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name ?? "Unknown",
    description: raw.description ?? "",
    icon: raw.icon ?? "box",
    color: raw.color,
    status: raw.status ?? "not_connected",
    permissions: raw.permissions ?? [],
    permission: raw.permission ?? raw.permissions?.[0] ?? "",
    category: raw.category ?? "Other",
  };
}

export function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  // Group connectors by category
  const categories = connectors.reduce<Record<string, Connector[]>>((acc, c) => {
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
                <ConnectorCard key={connector.id} connector={connector} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
