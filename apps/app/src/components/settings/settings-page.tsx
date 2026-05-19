"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./settings-section";

const tabs = ["Account", "Appearance", "AI Preferences", "Memory Preferences", "Shortcuts"] as const;
type Tab = (typeof tabs)[number];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Account");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Account" && <AccountSection />}
      {activeTab === "Appearance" && <AppearanceSection />}
      {activeTab === "AI Preferences" && <AIPreferencesSection />}
      {activeTab === "Memory Preferences" && <MemoryPreferencesSection />}
      {activeTab === "Shortcuts" && <ShortcutsSection />}
    </div>
  );
}

function AccountSection() {
  return (
    <SettingsSection title="Account" description="Your account information.">
      <div className="space-y-3">
        <Field label="Email" value="shaswat@example.com" />
        <Field label="Name" value="Shaswat Raj" />
        <Field label="Plan" value="Private Beta" />
      </div>
    </SettingsSection>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  return (
    <SettingsSection title="Appearance" description="Customize how Debo looks.">
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Theme</label>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "py-2 px-4 rounded-xl text-sm font-medium transition-all border-2",
                theme === t
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/20"
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Density</label>
        <div className="flex gap-2">
          {(["comfortable", "compact"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={cn(
                "py-2 px-4 rounded-xl text-sm font-medium transition-all border-2",
                density === d
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/20"
              )}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
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
      <SelectField
        label="Default ask mode"
        value={askMode}
        onChange={setAskMode}
        options={[
          { value: "recall", label: "Recall" },
          { value: "summarize", label: "Summarize" },
          { value: "find-tasks", label: "Find tasks" },
          { value: "compare", label: "Compare" },
          { value: "plan", label: "Plan" },
        ]}
      />
      <SelectField
        label="Answer style"
        value={answerStyle}
        onChange={setAnswerStyle}
        options={[
          { value: "concise", label: "Concise" },
          { value: "detailed", label: "Detailed" },
          { value: "bullet-points", label: "Bullet points" },
        ]}
      />
      <SelectField
        label="Source strictness"
        value={sourceStrictness}
        onChange={setSourceStrictness}
        options={[
          { value: "strict", label: "Strict - only answer from saved sources" },
          { value: "moderate", label: "Moderate - prefer sources, allow reasoning" },
          { value: "relaxed", label: "Relaxed - answer freely" },
        ]}
      />
      <Toggle
        label="Auto-extract tasks"
        description="Automatically detect tasks from journals, voice notes, and meetings."
        checked={autoExtract}
        onChange={setAutoExtract}
      />
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
      <Toggle label="Remember journal entries" description="Save and index your journal entries." checked={prefs.journals} onChange={() => toggle("journals")} />
      <Toggle label="Remember voice notes" description="Transcribe and save voice recordings." checked={prefs.voice} onChange={() => toggle("voice")} />
      <Toggle label="Remember uploaded files" description="Process and index uploaded documents." checked={prefs.files} onChange={() => toggle("files")} />
      <Toggle label="Remember connector data" description="Save data from connected apps." checked={prefs.connectors} onChange={() => toggle("connectors")} />
      <Toggle label="Require review before saving" description="Review extracted facts before they are saved to memory." checked={prefs.requireReview} onChange={() => toggle("requireReview")} />
    </SettingsSection>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { keys: ["⌘", "K"], label: "Command menu" },
    { keys: ["⌘", "A"], label: "Ask Debo" },
    { keys: ["⌘", "J"], label: "New journal" },
    { keys: ["⌘", "U"], label: "Upload" },
    { keys: ["⌘", "⇧", "V"], label: "Voice note" },
    { keys: ["/"], label: "Slash commands" },
    { keys: ["Esc"], label: "Close modal" },
  ];

  return (
    <SettingsSection title="Shortcuts" description="Keyboard shortcuts for power users.">
      <div className="space-y-2">
        {shortcuts.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="text-sm text-foreground">{s.label}</span>
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
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground mb-2 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5",
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
