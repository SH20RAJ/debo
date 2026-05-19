"use client";

import { useState } from "react";
import {
  Shield, Eye, Pause, Trash2, Download, Globe, Lock, FileText,
  ChevronRight, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PrivacyMode = "normal" | "private" | "local";

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
            <div className="flex items-center gap-2">
              <CardTitle>Connected Apps</CardTitle>
              <Badge variant="outline" className="text-xs">Coming soon</Badge>
            </div>
            <CardDescription>Apps that have shared data with your memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No connected apps yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Connectors will be available after backend integration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Modes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Privacy Modes</CardTitle>
              <Badge variant="outline" className="text-xs">Coming soon</Badge>
            </div>
            <CardDescription>Control how Debo handles your data in this session.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={privacyMode} onValueChange={(v) => setPrivacyMode(v as PrivacyMode)} disabled>
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
            <div className="flex items-center gap-2">
              <CardTitle>Audit Log</CardTitle>
              <Badge variant="outline" className="text-xs">Coming soon</Badge>
            </div>
            <CardDescription>A record of actions taken on your memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No audit entries yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Audit logging will be available after backend integration.
              </p>
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
