"use client";

import { useState } from "react";
import {
  Shield,
  Eye,
  Pause,
  Trash2,
  Download,
  Globe,
  Lock,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

const auditLog = [
  { id: 1, action: "Memory saved", detail: "Marketing Sync voice note", time: "2 hours ago", icon: CheckCircle2, color: "text-primary" },
  { id: 2, action: "Connector connected", detail: "Google Calendar", time: "Yesterday", icon: Link2, color: "text-blue-500" },
  { id: 3, action: "Source deleted", detail: "Old meeting notes", time: "3 days ago", icon: XCircle, color: "text-destructive" },
  { id: 4, action: "Export requested", detail: "Full memory archive", time: "1 week ago", icon: Archive, color: "text-amber-500" },
  { id: 5, action: "Connector disconnected", detail: "Slack", time: "2 weeks ago", icon: Unlink, color: "text-muted-foreground" },
];

const connectedApps = [
  { name: "Google Calendar", icon: "C", color: "#4285F4", sources: 42 },
  { name: "Notion", icon: "N", color: "#000000", sources: 128 },
];

type PrivacyMode = "normal" | "private" | "local";

export function VaultPage() {
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("normal");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Vault</h1>
      </div>
      <p className="text-muted-foreground mb-8">You control what Debo remembers.</p>

      <div className="space-y-6">
        {/* Memory Controls */}
        <Section title="Memory Controls" description="Review, pause, or clear your saved memories.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionCard icon={Eye} label="Review saved memories" description="Browse everything Debo remembers" />
            <ActionCard icon={Pause} label="Pause memory capture" description="Temporarily stop saving new memories" />
            <ActionCard icon={Trash2} label="Clear assistant memory" description="Remove all extracted facts and tasks" destructive />
            <ActionCard icon={Download} label="Export archive" description="Download all your data as a ZIP" />
          </div>
        </Section>

        {/* Connected Apps */}
        <Section title="Connected Apps" description="Apps that have shared data with your memory.">
          <div className="space-y-3">
            {connectedApps.map((app) => (
              <div key={app.name} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: app.color }}
                >
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.sources} sources imported</p>
                </div>
                <button className="text-xs text-destructive hover:underline">Disconnect</button>
              </div>
            ))}
          </div>
        </Section>

        {/* Privacy Modes */}
        <Section title="Privacy Modes" description="Control how Debo handles your data in this session.">
          <div className="space-y-3">
            <PrivacyOption
              label="Normal"
              description="Debo remembers everything you capture."
              icon={Globe}
              active={privacyMode === "normal"}
              onClick={() => setPrivacyMode("normal")}
            />
            <PrivacyOption
              label="Private session"
              description="Nothing is saved during this session."
              icon={Lock}
              active={privacyMode === "private"}
              onClick={() => setPrivacyMode("private")}
            />
            <PrivacyOption
              label="Local-only draft"
              description="Content stays on your device until you choose to save."
              icon={FileText}
              active={privacyMode === "local"}
              onClick={() => setPrivacyMode("local")}
            />
          </div>
        </Section>

        {/* Audit Log */}
        <Section title="Audit Log" description="A record of actions taken on your memory.">
          <div className="space-y-1">
            {auditLog.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Icon className={cn("w-4 h-4 shrink-0", entry.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{entry.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{entry.time}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6">
      <h2 className="font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {children}
    </div>
  );
}

function ActionCard({ icon: Icon, label, description, destructive }: { icon: React.ComponentType<{ className?: string }>; label: string; description: string; destructive?: boolean }) {
  return (
    <button className={cn(
      "flex items-start gap-3 p-4 rounded-xl border border-border text-left transition-all duration-200 hover:shadow-sm group",
      destructive ? "hover:border-destructive/30" : "hover:border-primary/30"
    )}>
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", destructive ? "text-destructive" : "text-primary")} />
      <div className="flex-1">
        <p className={cn("text-sm font-semibold", destructive ? "text-destructive" : "text-foreground")}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function PrivacyOption({ label, description, icon: Icon, active, onClick }: { label: string; description: string; icon: React.ComponentType<{ className?: string }>; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
      <div className="flex-1">
        <p className={cn("text-sm font-semibold", active ? "text-foreground" : "text-foreground")}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {active && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
    </button>
  );
}
