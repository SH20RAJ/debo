import { Composio } from "@composio/core";

export const SUPPORTED_PROVIDERS = [
  "gmail",
  "google_calendar",
  "notion",
  "github",
  "slack",
  "drive",
  "jira",
  "hubspot",
  "discord",
  "trello",
  "zoom",
  "salesforce",
] as const;

export type ConnectorProvider = string;

const PROVIDER_TO_TOOLKIT: Record<string, string> = {
  gmail: "gmail",
  google_calendar: "googlecalendar",
  googlecalendar: "googlecalendar",
  notion: "notion",
  github: "github",
  slack: "slack",
  drive: "googledrive",
  googledrive: "googledrive",
  jira: "jira",
  hubspot: "hubspot",
  discord: "discord",
  trello: "trello",
  zoom: "zoom",
  salesforce: "salesforce",
};

let cached: Composio | null = null;

export function getComposio(): Composio | null {
  if (cached) return cached;
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) return null;
  cached = new Composio({ apiKey });
  return cached;
}

export function isComposioConfigured(): boolean {
  return Boolean(process.env.COMPOSIO_API_KEY);
}

export function isSupportedProvider(p: string): boolean {
  return true;
}

export function getToolkitSlug(p: string): string {
  return PROVIDER_TO_TOOLKIT[p.toLowerCase()] || p;
}
