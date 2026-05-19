import type { Connector } from "../types";

export const CONNECTORS: Connector[] = [
  {
    id: "conn-001",
    name: "Gmail",
    description:
      "Import emails you choose as memories. Debo only reads what you select — never your entire inbox.",
    icon: "mail",
    color: "#EA4335",
    status: "connected",
    permissions: [
      "Read selected emails",
      "Debo will not send emails unless you ask",
      "Disconnect anytime",
    ],
    permission: "Debo can read selected emails you choose. Debo will not send emails unless you ask.",
    category: "Communication",
  },
  {
    id: "conn-002",
    name: "Google Calendar",
    description:
      "Remember meetings, events, and schedules. Debo summarizes past meetings and flags follow-ups.",
    icon: "calendar",
    color: "#4285F4",
    status: "connected",
    permissions: [
      "Read calendar events",
      "Debo will not create or modify events",
      "Disconnect anytime",
    ],
    permission: "Debo reads your calendar events. You can limit to specific calendars.",
    category: "Calendar",
  },
  {
    id: "conn-003",
    name: "Notion",
    description:
      "Sync pages and databases from Notion. Great for project docs, meeting notes, and wikis.",
    icon: "book-open",
    color: "#000000",
    status: "not_connected",
    permissions: [
      "Read selected pages and databases",
      "Debo will not edit your Notion workspace",
      "Disconnect anytime",
    ],
    permission: "Debo reads pages you share. It will not edit or delete anything.",
    category: "Knowledge",
  },
  {
    id: "conn-004",
    name: "GitHub",
    description:
      "Remember issues, PRs, and code discussions. Debo tracks commits and pull request context.",
    icon: "github",
    color: "#333333",
    status: "not_connected",
    permissions: [
      "Read repositories you select",
      "Debo will not push code or open issues",
      "Disconnect anytime",
    ],
    permission: "Debo reads repository metadata and issues. No write access unless you allow it.",
    category: "Knowledge",
  },
  {
    id: "conn-005",
    name: "Google Drive",
    description:
      "Import documents, spreadsheets, and PDFs. Debo extracts key information and makes it searchable.",
    icon: "hard-drive",
    color: "#0F9D58",
    status: "syncing",
    permissions: [
      "Read files you select",
      "Debo will not modify or delete files",
      "Disconnect anytime",
    ],
    permission: "Debo reads files you select. You control which folders are accessible.",
    category: "Knowledge",
  },
  {
    id: "conn-006",
    name: "Slack",
    description:
      "Remember important messages and threads. Debo surfaces key discussions and decisions from channels you choose.",
    icon: "hash",
    color: "#4A154B",
    status: "not_connected",
    permissions: [
      "Read selected channels and DMs",
      "Debo will not send messages on your behalf",
      "Disconnect anytime",
    ],
    permission: "Debo reads messages from selected channels. It will not post or react.",
    category: "Communication",
  },
];
