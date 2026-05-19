"use client";

import { ShieldCheck } from "lucide-react";
import { ConnectorCard } from "./connector-card";
import { Separator } from "@/components/ui/separator";
import { CONNECTORS } from "@/lib/mock";

const categories = [
  { name: "Communication", ids: ["conn-001", "conn-006"] },
  { name: "Calendar", ids: ["conn-002"] },
  { name: "Knowledge", ids: ["conn-003", "conn-005", "conn-004"] },
];

export function ConnectorsPage() {
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
        {categories.map((category, idx) => (
          <div key={category.name}>
            {idx > 0 && <Separator className="mb-8" />}
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.ids
                .map((id) => CONNECTORS.find((c) => c.id === id)!)
                .map((connector) => (
                  <ConnectorCard key={connector.id} connector={connector} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
