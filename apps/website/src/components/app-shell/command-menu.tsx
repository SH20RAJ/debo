"use client";

import { useRouter } from "next/navigation";
import {
  BookOpen,
  Mic,
  Upload,
  Link as LinkIcon,
  MessageSquare,
  Library,
  Users,
  CheckSquare,
  Plug,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import type { LucideIcon } from "lucide-react";

interface CommandItemDef {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

function buildCommands(router: ReturnType<typeof useRouter>): CommandItemDef[] {
  return [
    { icon: BookOpen, label: "New journal entry", shortcut: "⌘J", group: "Capture", action: () => router.push("/dashboard/journal") },
    { icon: Mic, label: "Record voice note", shortcut: "⌘⇧V", group: "Capture", action: () => router.push("/dashboard/voice") },
    { icon: Upload, label: "Upload file", shortcut: "⌘U", group: "Capture", action: () => document.getElementById("cmd-file-input")?.click() },
    { icon: LinkIcon, label: "Save link", group: "Capture", action: () => {
      const url = window.prompt("Paste the URL:");
      if (url?.trim()) {
        import("@/lib/api").then(({ api }) => {
          api.sources.create({ type: "link", title: url, content: url, origin: "manual" });
        });
      }
    }},
    { icon: MessageSquare, label: "Ask Debo", shortcut: "⌘A", group: "Ask", action: () => router.push("/dashboard/ask") },
    { icon: Search, label: "Search memories", group: "Ask", action: () => router.push("/dashboard/ask") },
    { icon: Library, label: "Go to Library", shortcut: "⌘L", group: "Navigate", action: () => router.push("/dashboard/library") },
    { icon: Users, label: "Go to People", group: "Navigate", action: () => router.push("/dashboard/people") },
    { icon: CheckSquare, label: "Go to Tasks", group: "Navigate", action: () => router.push("/dashboard/tasks") },
    { icon: Plug, label: "Go to Connectors", group: "Navigate", action: () => router.push("/dashboard/connectors") },
  ];
}

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

export function CommandMenu({ open, onOpenChange, onClose }: CommandMenuProps) {
  const router = useRouter();
  const commands = buildCommands(router);

  const groups = ["Capture", "Ask", "Navigate"] as const;

  const run = (action: () => void) => {
    action();
    onClose?.();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <input
        id="cmd-file-input"
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            import("@/lib/api").then(({ api }) => {
              api.media.upload(file);
            });
          }
          e.target.value = "";
        }}
      />
      <CommandInput placeholder="Search or type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((g) => {
          const items = commands.filter((c) => c.group === g);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={g} heading={g}>
              {items.map((item) => (
                <CommandItem key={item.label} onSelect={() => run(item.action)}>
                  <item.icon />
                  <span>{item.label}</span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
