"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./settings-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="w-full mb-8 overflow-x-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="ai-preferences">AI Preferences</TabsTrigger>
          <TabsTrigger value="memory-preferences">Memory Preferences</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSection />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSection />
        </TabsContent>
        <TabsContent value="ai-preferences">
          <AIPreferencesSection />
        </TabsContent>
        <TabsContent value="memory-preferences">
          <MemoryPreferencesSection />
        </TabsContent>
        <TabsContent value="shortcuts">
          <ShortcutsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccountSection() {
  return (
    <SettingsSection title="Account" description="Your account information.">
      <div className="space-y-3">
        <Field label="Email" value="shaswat@example.com" />
        <Separator />
        <Field label="Name" value="Shaswat Raj" />
        <Separator />
        <Field label="Plan" value="Private Beta" />
      </div>
    </SettingsSection>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState("system");
  const [density, setDensity] = useState("comfortable");

  return (
    <SettingsSection title="Appearance" description="Customize how Debo looks.">
      <div>
        <label className="text-sm font-semibold mb-2 block">Theme</label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block">Density</label>
        <Select value={density} onValueChange={setDensity}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SettingsSection>
  );
}

function AIPreferencesSection() {
  const [askMode, setAskMode] = useState("recall");
  const [answerStyle, setAnswerStyle] = useState("concise");
  const [sourceStrictness, setSourceStrictness] = useState("strict");
  const [autoExtract, setAutoExtract] = useState(true);

  return (
    <SettingsSection title="AI Preferences" description="Configure how Debo responds and processes information.">
      <div>
        <label className="text-sm font-semibold mb-2 block">Default ask mode</label>
        <Select value={askMode} onValueChange={setAskMode}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recall">Recall</SelectItem>
            <SelectItem value="summarize">Summarize</SelectItem>
            <SelectItem value="find-tasks">Find tasks</SelectItem>
            <SelectItem value="compare">Compare</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block">Answer style</label>
        <Select value={answerStyle} onValueChange={setAnswerStyle}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concise">Concise</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="bullet-points">Bullet points</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block">Source strictness</label>
        <Select value={sourceStrictness} onValueChange={setSourceStrictness}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strict">Strict - only answer from saved sources</SelectItem>
            <SelectItem value="moderate">Moderate - prefer sources, allow reasoning</SelectItem>
            <SelectItem value="relaxed">Relaxed - answer freely</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium">Auto-extract tasks</p>
          <p className="text-xs text-muted-foreground">Automatically detect tasks from journals, voice notes, and meetings.</p>
        </div>
        <Switch checked={autoExtract} onCheckedChange={setAutoExtract} />
      </div>
    </SettingsSection>
  );
}

function MemoryPreferencesSection() {
  const [prefs, setPrefs] = useState({
    journals: true,
    voice: true,
    files: true,
    connectors: false,
    requireReview: true,
  });

  function toggle(key: keyof typeof prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <SettingsSection title="Memory Preferences" description="Choose what Debo remembers.">
      <ToggleRow label="Remember journal entries" description="Save and index your journal entries." checked={prefs.journals} onChange={() => toggle("journals")} />
      <ToggleRow label="Remember voice notes" description="Transcribe and save voice recordings." checked={prefs.voice} onChange={() => toggle("voice")} />
      <ToggleRow label="Remember uploaded files" description="Process and index uploaded documents." checked={prefs.files} onChange={() => toggle("files")} />
      <ToggleRow label="Remember connector data" description="Save data from connected apps." checked={prefs.connectors} onChange={() => toggle("connectors")} />
      <ToggleRow label="Require review before saving" description="Review extracted facts before they are saved to memory." checked={prefs.requireReview} onChange={() => toggle("requireReview")} />
    </SettingsSection>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { keys: ["\u2318", "K"], label: "Command menu" },
    { keys: ["\u2318", "A"], label: "Ask Debo" },
    { keys: ["\u2318", "J"], label: "New journal" },
    { keys: ["\u2318", "U"], label: "Upload" },
    { keys: ["\u2318", "\u21E7", "V"], label: "Voice note" },
    { keys: ["/"], label: "Slash commands" },
    { keys: ["Esc"], label: "Close modal" },
  ];

  return (
    <SettingsSection title="Shortcuts" description="Keyboard shortcuts for power users.">
      <div className="space-y-2">
        {shortcuts.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="text-sm">{s.label}</span>
            <div className="flex gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="inline-flex items-center justify-center h-7 min-w-[1.75rem] px-1.5 rounded-lg border border-border bg-muted text-xs font-mono text-muted-foreground"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

/* Shared primitives */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
