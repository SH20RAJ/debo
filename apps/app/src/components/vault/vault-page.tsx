"use client";

import { useState } from "react";
import {
  Shield, Eye, Pause, Trash2, Download, Globe, Lock, FileText,
  ChevronRight, CheckCircle2, XCircle, Link2, Unlink, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AUDIT_LOG, CONNECTED_APPS } from "@/lib/mock";

type PrivacyMode = "normal" | "private" | "local";

const auditIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle2,
  link: Link2,
  x: XCircle,
  archive: Archive,
  unlink: Unlink,
};

export function VaultPage() {
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("normal");

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Vault</h1>
      </div>
      <p className="text-muted-foreground mb-8">You control what Debo remembers.</p>

      <div className="space-y-6">
        {/* Memory Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Controls</CardTitle>
            <CardDescription>Review, pause, or clear your saved memories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard icon={Eye} label="Review saved memories" description="Browse everything Debo remembers" />
              <ActionCard icon={Pause} label="Pause memory capture" description="Temporarily stop saving new memories" />
              <ActionCard icon={Trash2} label="Clear assistant memory" description="Remove all extracted facts and tasks" destructive />
              <ActionCard icon={Download} label="Export archive" description="Download all your data as a ZIP" />
            </div>
          </CardContent>
        </Card>

        {/* Connected Apps */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Apps</CardTitle>
            <CardDescription>Apps that have shared data with your memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CONNECTED_APPS.map((app) => (
                <div key={app.name} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.sources} sources imported</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Modes */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Modes</CardTitle>
            <CardDescription>Control how Debo handles your data in this session.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={privacyMode} onValueChange={(v) => setPrivacyMode(v as PrivacyMode)}>
              <PrivacyOption
                value="normal"
                label="Normal"
                description="Debo remembers everything you capture."
                icon={Globe}
                active={privacyMode === "normal"}
              />
              <PrivacyOption
                value="private"
                label="Private session"
                description="Nothing is saved during this session."
                icon={Lock}
                active={privacyMode === "private"}
              />
              <PrivacyOption
                value="local"
                label="Local-only draft"
                description="Content stays on your device until you choose to save."
                icon={FileText}
                active={privacyMode === "local"}
              />
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>A record of actions taken on your memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {AUDIT_LOG.map((entry, idx) => {
                const Icon = auditIcons[entry.icon] || CheckCircle2;
                return (
                  <div key={entry.id}>
                    {idx > 0 && <Separator className="mb-1" />}
                    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Icon className={cn("w-4 h-4 shrink-0", entry.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">{entry.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{entry.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, label, description, destructive }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  destructive?: boolean;
}) {
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

function PrivacyOption({ value, label, description, icon: Icon, active }: {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
      )}
    >
      <RadioGroupItem value={value} />
      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {active && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
    </label>
  );
}
