"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ConnectorCard } from "./connector-card";
import { Separator } from "@/components/ui/separator";
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
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Connectors</h1>
        <div className="flex items-start gap-2 mb-8 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Connectors are optional. You control what Debo remembers. You can disconnect anytime and all imported data will be removed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border-2 border-border bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Connectors</h1>
        <div className="flex items-start gap-2 mb-8 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Connectors are optional. You control what Debo remembers. You can disconnect anytime and all imported data will be removed.
          </p>
        </div>
        <div className="text-center py-16">
          <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Could not load connectors. Make sure the API is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Connectors</h1>

      <div className="flex items-start gap-2 mb-8 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Connectors are optional. You control what Debo remembers. You can disconnect anytime and all imported data will be removed.
        </p>
      </div>

      <div className="space-y-8">
        {categoryEntries.map(([category, items], idx) => (
          <div key={category}>
            {idx > 0 && <Separator className="mb-8" />}
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
