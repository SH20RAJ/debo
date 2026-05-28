export interface AuditEntry {
  id: number;
  action: string;
  detail: string;
  time: string;
  icon: string;
  color: string;
}

export interface ConnectedApp {
  name: string;
  icon: string;
  color: string;
  sources: number;
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: 1, action: "Memory saved", detail: "Marketing Sync voice note", time: "2 hours ago", icon: "check", color: "text-primary" },
  { id: 2, action: "Connector connected", detail: "Google Calendar", time: "Yesterday", icon: "link", color: "text-blue-500" },
  { id: 3, action: "Source deleted", detail: "Old meeting notes", time: "3 days ago", icon: "x", color: "text-destructive" },
  { id: 4, action: "Export requested", detail: "Full memory archive", time: "1 week ago", icon: "archive", color: "text-amber-500" },
  { id: 5, action: "Connector disconnected", detail: "Slack", time: "2 weeks ago", icon: "unlink", color: "text-muted-foreground" },
];

export const CONNECTED_APPS: ConnectedApp[] = [
  { name: "Google Calendar", icon: "C", color: "#4285F4", sources: 42 },
  { name: "Notion", icon: "N", color: "#000000", sources: 128 },
];
