"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SidebarItemDef {
  id: string;       // stable key, e.g. "home", "ask", "journal"
  label: string;
  href: string;
  hidden?: boolean;
}

export interface SidebarSectionDef {
  id: string;       // e.g. "core", "tools", "memory", "work"
  label: string;
  collapsed?: boolean;
  itemIds: string[];
}

export interface SidebarPrefs {
  sections: SidebarSectionDef[];
  hiddenItemIds: string[];
  version: number;
}

// ── Defaults ───────────────────────────────────────────────────────────────

export const ALL_NAV_ITEMS: SidebarItemDef[] = [
  { id: "home",       label: "Home",           href: "/dashboard" },
  { id: "ask",        label: "Ask Debo",       href: "/dashboard/ask" },
  { id: "journal",    label: "Journal",        href: "/dashboard/journal" },
  { id: "voice-notes", label: "Voice Notes",    href: "/dashboard/voice" },
  { id: "voice-talk",  label: "Talk to Debo",   href: "/dashboard/voice/talk" },
  { id: "media",      label: "Media",          href: "/dashboard/media" },
  { id: "mail",       label: "Debo Mail",      href: "/dashboard/mail" },
  { id: "connectors", label: "Connectors",     href: "/dashboard/connectors" },
  { id: "vault",      label: "Vault",          href: "/dashboard/vault" },
  { id: "inbox",      label: "Inbox",          href: "/dashboard/inbox" },
  { id: "debrief",    label: "Daily Debrief",  href: "/dashboard/debrief" },
  { id: "timeline",   label: "Timeline",       href: "/dashboard/timeline" },
  { id: "library",    label: "Library",         href: "/dashboard/library" },
  { id: "tasks",      label: "Tasks",           href: "/dashboard/tasks" },
  { id: "projects",   label: "Projects",        href: "/dashboard/projects" },
  { id: "decisions",  label: "Decisions",       href: "/dashboard/decisions" },
  { id: "people",     label: "People",          href: "/dashboard/people" },
  { id: "radar",      label: "Follow-Up Radar", href: "/dashboard/radar" },
  { id: "mcp",        label: "MCP Server",      href: "/dashboard/mcp" },
];

const DEFAULT_SECTIONS: SidebarSectionDef[] = [
  {
    id: "core",
    label: "Core",
    collapsed: false,
    itemIds: ["home", "ask", "journal"],
  },
  {
    id: "tools",
    label: "Tools",
    collapsed: false,
    itemIds: ["voice-notes", "voice-talk", "media", "mail", "connectors", "vault", "mcp"],
  },
  {
    id: "memory",
    label: "Memory",
    collapsed: true,
    itemIds: ["inbox", "debrief", "timeline", "library"],
  },
  {
    id: "work",
    label: "Work",
    collapsed: true,
    itemIds: ["tasks", "projects", "decisions", "people", "radar"],
  },
];

const STORAGE_KEY = "debo-sidebar-prefs";
const PREFS_VERSION = 1;

// ── Helpers ────────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadPrefs(): SidebarPrefs | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SidebarPrefs;
    if (parsed.version !== PREFS_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePrefs(prefs: SidebarPrefs): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, version: PREFS_VERSION }));
  } catch {
    // storage full or blocked
  }
}

function defaultPrefs(): SidebarPrefs {
  return {
    sections: DEFAULT_SECTIONS.map((s) => ({ ...s, itemIds: [...s.itemIds] })),
    hiddenItemIds: [],
    version: PREFS_VERSION,
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSidebarPrefs() {
  const [prefs, setPrefs] = useState<SidebarPrefs>(defaultPrefs);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadPrefs();
    if (stored) {
      // Validate: ensure all known items are present somewhere
      const allAssigned = new Set(stored.sections.flatMap((s) => s.itemIds));
      const allKnown = new Set(ALL_NAV_ITEMS.map((i) => i.id));
      const missing = [...allKnown].filter((id) => !allAssigned.has(id) && !stored.hiddenItemIds.includes(id));
      if (missing.length > 0) {
        // Orphaned items → add to a catch-all section
        stored.sections.push({ id: "other", label: "Other", collapsed: false, itemIds: missing });
      }
      setPrefs(stored);
    }
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (loaded) savePrefs(prefs);
  }, [prefs, loaded]);

  // Toggle a section's collapsed state
  const toggleSection = useCallback((sectionId: string) => {
    setPrefs((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
      ),
    }));
  }, []);

  // Hide an item
  const hideItem = useCallback((itemId: string) => {
    setPrefs((prev) => {
      const newSections = prev.sections.map((s) => ({
        ...s,
        itemIds: s.itemIds.filter((id) => id !== itemId),
      }));
      // Remove empty sections (except the 4 default ones)
      const kept = newSections.filter(
        (s) => s.itemIds.length > 0 || ["core", "tools", "memory", "work"].includes(s.id)
      );
      return {
        ...prev,
        sections: kept,
        hiddenItemIds: [...new Set([...prev.hiddenItemIds, itemId])],
      };
    });
  }, []);

  // Unhide an item (adds back to its default section)
  const unhideItem = useCallback((itemId: string) => {
    setPrefs((prev) => {
      const defaultSection = DEFAULT_SECTIONS.find((s) => s.itemIds.includes(itemId));
      const targetSectionId = defaultSection?.id ?? "tools";
      const newHidden = prev.hiddenItemIds.filter((id) => id !== itemId);
      const newSections = prev.sections.map((s) =>
        s.id === targetSectionId && !s.itemIds.includes(itemId)
          ? { ...s, itemIds: [...s.itemIds, itemId] }
          : s
      );
      return { ...prev, sections: newSections, hiddenItemIds: newHidden };
    });
  }, []);

  // Move item within a section or between sections
  const moveItem = useCallback(
    (itemId: string, toSectionId: string, toIndex: number) => {
      setPrefs((prev) => {
        const newSections = prev.sections.map((s) => ({
          ...s,
          itemIds: s.itemIds.filter((id) => id !== itemId),
        }));
        const target = newSections.find((s) => s.id === toSectionId);
        if (target) {
          const clamped = Math.min(toIndex, target.itemIds.length);
          target.itemIds.splice(clamped, 0, itemId);
        }
        return { ...prev, sections: newSections };
      });
    },
    []
  );

  // Reorder sections
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setPrefs((prev) => {
      const newSections = [...prev.sections];
      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, moved);
      return { ...prev, sections: newSections };
    });
  }, []);

  // Add a new custom section
  const addSection = useCallback((label: string) => {
    const id = `custom-${Date.now()}`;
    setPrefs((prev) => ({
      ...prev,
      sections: [...prev.sections, { id, label, collapsed: false, itemIds: [] }],
    }));
    return id;
  }, []);

  // Remove a custom section (moves items to "other")
  const removeSection = useCallback((sectionId: string) => {
    if (["core", "tools", "memory", "work"].includes(sectionId)) return;
    setPrefs((prev) => {
      const section = prev.sections.find((s) => s.id === sectionId);
      if (!section) return prev;
      const other = prev.sections.find((s) => s.id === "other");
      const newSections = prev.sections
        .filter((s) => s.id !== sectionId)
        .map((s) => {
          if (s.id === "other" || (!other && s === prev.sections[0])) {
            return { ...s, itemIds: [...s.itemIds, ...section.itemIds] };
          }
          return s;
        });
      if (!other && newSections.length === prev.sections.length) {
        newSections.push({ id: "other", label: "Other", collapsed: false, itemIds: [...section.itemIds] });
      }
      return { ...prev, sections: newSections };
    });
  }, []);

  // Rename a section
  const renameSection = useCallback((sectionId: string, label: string) => {
    setPrefs((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, label } : s)),
    }));
  }, []);

  // Reset everything to defaults
  const resetToDefaults = useCallback(() => {
    setPrefs(defaultPrefs());
  }, []);

  return {
    prefs,
    loaded,
    toggleSection,
    hideItem,
    unhideItem,
    moveItem,
    reorderSections,
    addSection,
    removeSection,
    renameSection,
    resetToDefaults,
  };
}
