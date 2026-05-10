"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  MessageSquare,
  Calendar,
  Mail,
  Link2,
} from "lucide-react";

type Connector = {
  id: string;
  name: string;
  connectorType: string;
  isEnabled: boolean;
  lastSyncAt: string | null;
  syncStatus: string;
  webhookUrl: string | null;
  createdAt: string;
};

type ConnectorHealth = {
  total: number;
  active: number;
  error: number;
  connectors: Connector[];
};

const CONNECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: MessageSquare, // Slack icon not in lucide
  discord: MessageSquare,
  notion: Link2,
  linear: Zap,
  gmail: Mail,
  calendar: Calendar,
  github: Link2, // GitHub icon not in lucide
  custom: Link2,
};

const CONNECTOR_TYPES = [
  { value: "slack", label: "Slack", icon: MessageSquare },
  { value: "discord", label: "Discord", icon: MessageSquare },
  { value: "notion", label: "Notion", icon: Link2 },
  { value: "linear", label: "Linear", icon: Zap },
  { value: "gmail", label: "Gmail", icon: Mail },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "github", label: "GitHub", icon: Link2 },
  { value: "custom", label: "Custom Webhook", icon: Link2 },
];

export default function ConnectorsPage() {
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [newConnector, setNewConnector] = useState({
    name: "",
    connectorType: "slack" as string,
    apiKey: "",
    webhookUrl: "",
  });

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connectors");
      const data = await res.json() as ConnectorHealth;
      setConnectors(data.connectors || []);
    } catch (error) {
      console.error("Failed to load connectors:", error);
    }
    setLoading(false);
  };

  const handleAddConnector = async () => {
    try {
      const res = await fetch("/api/connectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConnector),
      });
      const data = await res.json() as { success?: boolean };

      if (data.success) {
        setShowAddModal(false);
        setNewConnector({ name: "", connectorType: "slack", apiKey: "", webhookUrl: "" });
        loadConnectors();
      }
    } catch (error) {
      console.error("Failed to add connector:", error);
    }
  };

  const handleDeleteConnector = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this app?")) return;

    try {
      await fetch(`/api/connectors/${id}`, { method: "DELETE" });
      loadConnectors();
    } catch (error) {
      console.error("Failed to delete connector:", error);
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await fetch(`/api/connectors/${id}/sync`, { method: "POST" });
      loadConnectors();
    } catch (error) {
      console.error("Failed to sync:", error);
    }
    setSyncingId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-screen-xl mx-auto w-full px-6 py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="duolingo-outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl hover-bounce h-12 w-12"
          >
            <ArrowLeft className="h-6 w-6 text-duo-eel" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-black text-duo-eel">Connected Apps</h1>
            <p className="text-sm text-duo-swan font-bold">Connect external services to sync with Debo</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-duo-green text-duo-snow hover:bg-duo-green/90 rounded-2xl font-bold"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto w-full px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : connectors.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-duo-polar/30 mb-4">
              <Link2 className="h-8 w-8 text-duo-swan" />
            </div>
            <h2 className="text-xl font-heading font-black text-duo-eel mb-2">No Connected Apps</h2>
            <p className="text-duo-swan font-bold mb-6">Connect your favorite tools to sync with Debo</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-duo-green text-duo-snow hover:bg-duo-green/90 rounded-2xl font-bold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Connect Your First App
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((connector) => {
              const Icon = CONNECTOR_ICONS[connector.connectorType] || Link2;
              return (
                <div
                  key={connector.id}
                  className="bg-duo-polar/20 rounded-2xl p-6 border border-duo-swan/20 hover:border-duo-swan/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-duo-swan/20 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-duo-wolf" />
                      </div>
                      <div>
                        <h3 className="font-black text-duo-eel">{connector.name}</h3>
                        <p className="text-xs text-duo-swan font-bold uppercase tracking-wider">
                          {connector.connectorType}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(connector.syncStatus)}
                  </div>

                  {connector.webhookUrl && (
                    <div className="mb-4 p-3 bg-duo-snow/50 rounded-xl">
                      <p className="text-xs text-duo-swan mb-1">Webhook URL</p>
                      <code className="text-xs font-mono text-duo-eel break-all">
                        {connector.webhookUrl.slice(0, 40)}...
                      </code>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-duo-swan">
                    <span>
                      {connector.lastSyncAt
                        ? `Synced ${new Date(connector.lastSyncAt).toLocaleDateString()}`
                        : "Never synced"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync(connector.id)}
                        className="p-2 hover:bg-duo-swan/20 rounded-lg transition-colors"
                        title="Sync now"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${syncingId === connector.id ? "animate-spin" : ""}`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteConnector(connector.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Connector Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-duo-snow rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-heading font-black text-duo-eel mb-6">Connect New App</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-duo-wolf mb-2">Name</label>
                <Input
                  value={newConnector.name}
                  onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })}
                  placeholder="My Slack Workspace"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-duo-wolf mb-2">App Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONNECTOR_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setNewConnector({ ...newConnector, connectorType: value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                        newConnector.connectorType === value
                          ? "border-duo-green bg-duo-green/10 text-duo-green"
                          : "border-duo-swan/30 text-duo-wolf hover:border-duo-swan/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-duo-wolf mb-2">API Key (optional)</label>
                <Input
                  value={newConnector.apiKey}
                  onChange={(e) => setNewConnector({ ...newConnector, apiKey: e.target.value })}
                  placeholder="sk-..."
                  type="password"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-duo-wolf mb-2">Webhook URL (optional)</label>
                <Input
                  value={newConnector.webhookUrl}
                  onChange={(e) => setNewConnector({ ...newConnector, webhookUrl: e.target.value })}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="duolingo-outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddConnector}
                disabled={!newConnector.name}
                className="flex-1 bg-duo-green text-duo-snow hover:bg-duo-green/90 rounded-xl font-bold"
              >
                Add Connector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
