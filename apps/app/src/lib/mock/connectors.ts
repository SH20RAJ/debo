import type { Connector } from "../types";

export const CONNECTORS: Connector[] = [
  {
    id: "conn-001",
    name: "Gmail",
    description:
      "Import emails you choose as memories. Debo only reads what you select — never your entire inbox.",
    icon: "mail",
    status: "connected",
    permissions: [
      "Read selected emails",
      "Debo will not send emails unless you ask",
      "Disconnect anytime",
    ],
    category: "Communication",
  },
  {
    id: "conn-002",
    name: "Google Calendar",
    description:
      "Remember meetings, events, and schedules. Debo summarizes past meetings and flags follow-ups.",
    icon: "calendar",
    status: "connected",
    permissions: [
      "Read calendar events",
      "Debo will not create or modify events",
      "Disconnect anytime",
    ],
    category: "Calendar",
  },
  {
    id: "conn-003",
    name: "Notion",
    description:
      "Sync pages and databases from Notion. Great for project docs, meeting notes, and wikis.",
    icon: "book-open",
    status: "not_connected",
    permissions: [
      "Read selected pages and databases",
      "Debo will not edit your Notion workspace",
      "Disconnect anytime",
    ],
    category: "Knowledge",
  },
  {
    id: "conn-004",
    name: "GitHub",
    description:
      "Remember issues, PRs, and code discussions. Debo tracks commits and pull request context.",
    icon: "github",
    status: "not_connected",
    permissions: [
      "Read repositories you select",
      "Debo will not push code or open issues",
      "Disconnect anytime",
    ],
    category: "Knowledge",
  },
  {
    id: "conn-005",
    name: "Google Drive",
    description:
      "Import documents, spreadsheets, and PDFs. Debo extracts key information and makes it searchable.",
    icon: "hard-drive",
    status: "syncing",
    permissions: [
      "Read files you select",
      "Debo will not modify or delete files",
      "Disconnect anytime",
    ],
    category: "Knowledge",
  },
  {
    id: "conn-006",
    name: "Slack",
    description:
      "Remember important messages and threads. Debo surfaces key discussions and decisions from channels you choose.",
    icon: "hash",
    status: "not_connected",
    permissions: [
      "Read selected channels and DMs",
      "Debo will not send messages on your behalf",
      "Disconnect anytime",
    ],
    category: "Communication",
  },
];
