"use client";

import { cn } from "@/lib/utils";
import {
  Inbox,
  Send,
  Star,
  Archive,
  FileText,
  Brain,
} from "lucide-react";
import type { MailFolder } from "./mail-shell";

interface FolderItem {
  id: MailFolder;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const folders: FolderItem[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "memory", label: "Memory Saved", icon: Brain },
];

interface MailSidebarProps {
  folder: MailFolder;
  onFolderChange: (folder: MailFolder) => void;
  counts?: Partial<Record<MailFolder, number>>;
}

export function MailSidebar({ folder, onFolderChange, counts = {} }: MailSidebarProps) {
  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
      {folders.map((f) => {
        const count = counts[f.id] ?? f.count;

        return (
          <button
            key={f.id}
            onClick={() => onFolderChange(f.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all",
              folder === f.id
                ? "bg-primary/10 text-primary shadow-[0_2px_0_var(--border)] font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <f.icon className={cn("w-[18px] h-[18px] shrink-0", folder === f.id && "text-primary")} />
            <span className="flex-1 text-left truncate">{f.label}</span>
            {count !== undefined && count > 0 && (
              <span className="text-[11px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
