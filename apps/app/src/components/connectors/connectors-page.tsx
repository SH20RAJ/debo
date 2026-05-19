"use client";

import { ShieldCheck } from "lucide-react";
import { ConnectorCard, type Connector } from "./connector-card";

const mockConnectors: Connector[] = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Read selected emails you choose to share with Debo.",
    icon: "G",
    color: "#EA4335",
    status: "not_connected",
    permission: "Debo can read selected emails you choose. Debo will not send emails unless you ask.",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Import calendar events to remember meetings and appointments.",
    icon: "C",
    color: "#4285F4",
    status: "not_connected",
    permission: "Debo reads your calendar events. You can limit to specific calendars.",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Import pages and databases from your Notion workspace.",
    icon: "N",
    color: "#000000",
    status: "not_connected",
    permission: "Debo reads pages you share. It will not edit or delete anything.",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Link repositories, issues, and pull requests to your memory.",
    icon: "H",
    color: "#333333",
    status: "not_connected",
    permission: "Debo reads repository metadata and issues. No write access unless you allow it.",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Import documents, spreadsheets, and files from Drive.",
    icon: "D",
    color: "#0F9D58",
    status: "not_connected",
    permission: "Debo reads files you select. You control which folders are accessible.",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Import messages from channels you choose to remember.",
    icon: "S",
    color: "#4A154B",
    status: "not_connected",
    permission: "Debo reads messages from selected channels. It will not post or react.",
  },
];

const categories = [
  { name: "Communication", ids: ["gmail", "slack"] },
  { name: "Calendar", ids: ["google-calendar"] },
  { name: "Knowledge", ids: ["notion", "google-drive", "github"] },
];

export function ConnectorsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Connectors</h1>

      <div className="flex items-start gap-2 mb-8 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Connectors are optional. You control what Debo remembers. You can disconnect anytime and all imported data will be removed.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.ids
                .map((id) => mockConnectors.find((c) => c.id === id)!)
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
