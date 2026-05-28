"use client";

import { Suspense, useState } from "react";
import { useUser } from "@stackframe/stack";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./settings-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useSidebarPrefs,
  ALL_NAV_ITEMS,
  type SidebarSectionDef,
} from "@/lib/sidebar-prefs";
import {
  Eye,
  EyeOff,
  RotateCcw,
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

export function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="w-full mb-8 overflow-x-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
          <TabsTrigger value="ai-preferences">AI Preferences</TabsTrigger>
          <TabsTrigger value="memory-preferences">Memory Preferences</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Suspense fallback={<AccountSectionFallback />}>
            <AccountSection />
          </Suspense>
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSection />
        </TabsContent>
        <TabsContent value="sidebar">
          <SidebarSection />
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
  const user = useUser();

  return (
    <SettingsSection title="Account" description="Your account information.">
      <div className="space-y-3">
        <Field label="Email" value={user?.primaryEmail ?? "Not signed in"} />
        <Separator />
        <Field label="Name" value={user?.displayName ?? "—"} />
        <Separator />
        <Field label="Plan" value="Private Beta" />
      </div>
    </SettingsSection>
  );
}

function AccountSectionFallback() {
  return (
    <SettingsSection title="Account" description="Your account information.">
      <div className="space-y-3" aria-hidden="true">
        <FieldSkeleton label="Email" />
        <Separator />
        <FieldSkeleton label="Name" />
        <Separator />
        <Field label="Plan" value="Private Beta" />
      </div>
    </SettingsSection>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
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
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-semibold block">Density</label>
          <ComingSoonBadge />
        </div>
        <Select value={density} onValueChange={setDensity} disabled>
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
      <div className="flex items-center gap-2 mb-2">
        <ComingSoonBadge />
        <p className="text-xs text-muted-foreground">These preferences will be configurable after backend integration.</p>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block">Default ask mode</label>
        <Select value={askMode} onValueChange={setAskMode} disabled>
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
        <Select value={answerStyle} onValueChange={setAnswerStyle} disabled>
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
        <Select value={sourceStrictness} onValueChange={setSourceStrictness} disabled>
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
      <div className="flex items-center justify-between py-1 opacity-50">
        <div>
          <p className="text-sm font-medium">Auto-extract tasks</p>
          <p className="text-xs text-muted-foreground">Automatically detect tasks from journals, voice notes, and meetings.</p>
        </div>
        <Switch checked={autoExtract} onCheckedChange={setAutoExtract} disabled />
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
      <div className="flex items-center gap-2 mb-2">
        <ComingSoonBadge />
        <p className="text-xs text-muted-foreground">These preferences will be configurable after backend integration.</p>
      </div>
      <ToggleRow label="Remember journal entries" description="Save and index your journal entries." checked={prefs.journals} onChange={() => toggle("journals")} disabled />
      <ToggleRow label="Remember voice notes" description="Transcribe and save voice recordings." checked={prefs.voice} onChange={() => toggle("voice")} disabled />
      <ToggleRow label="Remember uploaded files" description="Process and index uploaded documents." checked={prefs.files} onChange={() => toggle("files")} disabled />
      <ToggleRow label="Remember connector data" description="Save data from connected apps." checked={prefs.connectors} onChange={() => toggle("connectors")} disabled />
      <ToggleRow label="Require review before saving" description="Review extracted facts before they are saved to memory." checked={prefs.requireReview} onChange={() => toggle("requireReview")} disabled />
    </SettingsSection>
  );
}

function SidebarSection() {
  const {
    prefs,
    hideItem,
    unhideItem,
    moveItem,
    reorderSections,
    addSection,
    removeSection,
    renameSection,
    resetToDefaults,
  } = useSidebarPrefs();

  const [newSectionName, setNewSectionName] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const assignedIds = new Set(prefs.sections.flatMap((s) => s.itemIds));
  const hiddenItems = ALL_NAV_ITEMS.filter(
    (item) => prefs.hiddenItemIds.includes(item.id)
  );
  const unassignedItems = ALL_NAV_ITEMS.filter(
    (item) => !assignedIds.has(item.id) && !prefs.hiddenItemIds.includes(item.id)
  );

  const handleAddSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    addSection(name);
    setNewSectionName("");
  };

  const handleRename = (sectionId: string) => {
    const name = editName.trim();
    if (name) renameSection(sectionId, name);
    setEditingSection(null);
  };

  const handleMoveUp = (sectionIndex: number) => {
    if (sectionIndex > 0) reorderSections(sectionIndex, sectionIndex - 1);
  };

  const handleMoveDown = (sectionIndex: number) => {
    if (sectionIndex < prefs.sections.length - 1) reorderSections(sectionIndex, sectionIndex + 1);
  };

  return (
    <SettingsSection
      title="Sidebar"
      description="Customize your sidebar layout. Drag items between sections, hide what you don't use, or create your own groups."
    >
      {/* Reset button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {prefs.sections.length} sections, {ALL_NAV_ITEMS.length - prefs.hiddenItemIds.length} items visible
        </p>
        <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {prefs.sections.map((section, sectionIndex) => (
          <div key={section.id} className="rounded-xl border-2 border-border bg-card">
            {/* Section header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/30 rounded-t-xl">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveUp(sectionIndex)}
                  disabled={sectionIndex === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveDown(sectionIndex)}
                  disabled={sectionIndex === prefs.sections.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {editingSection === section.id ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(section.id);
                      if (e.key === "Escape") setEditingSection(null);
                    }}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(section.id)}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSection(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <span
                  className="flex-1 text-sm font-semibold cursor-pointer hover:text-primary"
                  onClick={() => {
                    setEditingSection(section.id);
                    setEditName(section.label);
                  }}
                >
                  {section.label}
                </span>
              )}

              {!["core", "tools", "memory", "work"].includes(section.id) && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Section items */}
            <div className="p-2 space-y-0.5">
              {section.itemIds.length === 0 && (
                <p className="text-xs text-muted-foreground/50 py-2 text-center">No items — drag items here or add from below</p>
              )}
              {section.itemIds.map((itemId) => {
                const item = ALL_NAV_ITEMS.find((i) => i.id === itemId);
                if (!item) return null;
                const isHidden = prefs.hiddenItemIds.includes(itemId);

                return (
                  <div
                    key={itemId}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors group",
                      isHidden ? "opacity-40" : "hover:bg-muted/50"
                    )}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 cursor-grab" />
                    <span className="flex-1 truncate">{item.label}</span>

                    {/* Move to prev/next section */}
                    {sectionIndex > 0 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground"
                        title={`Move to ${prefs.sections[sectionIndex - 1]?.label}`}
                        onClick={() => moveItem(itemId, prefs.sections[sectionIndex - 1].id, 999)}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                    )}
                    {sectionIndex < prefs.sections.length - 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground"
                        title={`Move to ${prefs.sections[sectionIndex + 1]?.label}`}
                        onClick={() => moveItem(itemId, prefs.sections[sectionIndex + 1].id, 0)}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    )}

                    {/* Hide/show toggle */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => (isHidden ? unhideItem(itemId) : hideItem(itemId))}
                      title={isHidden ? "Show in sidebar" : "Hide from sidebar"}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add new section */}
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="New section name..."
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddSection();
          }}
          className="h-9"
        />
        <Button onClick={handleAddSection} disabled={!newSectionName.trim()} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Hidden items */}
      {hiddenItems.length > 0 && (
        <div className="mt-6">
          <Separator className="mb-4" />
          <p className="text-sm font-semibold mb-3">Hidden items</p>
          <div className="space-y-1">
            {hiddenItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm opacity-60 hover:opacity-100 transition-opacity">
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => unhideItem(item.id)}
                  title="Show in sidebar"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
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

function ComingSoonBadge() {
  return <Badge variant="outline" className="text-xs">Coming soon</Badge>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function FieldSkeleton({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="h-4 w-32 rounded bg-muted animate-pulse" />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-1", disabled && "opacity-50")}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
