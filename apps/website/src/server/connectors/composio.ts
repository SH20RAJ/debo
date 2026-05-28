import { Composio } from "@composio/core";

/**
 * Composio integration helpers.
 *
 * Required env:
 *   - COMPOSIO_API_KEY
 *
 * Strategy:
 *   - We map our internal connector provider slugs (e.g. "gmail") to Composio
 *     toolkit slugs and use composio.toolkits.authorize(userId, slug) to begin
 *     OAuth. The redirect URL is what the frontend opens in a popup.
 *   - We track `connector_accounts` rows in our DB; the Composio connection
 *     ID is stored in `external_account_id` so we can later target a specific
 *     account when executing tools.
 */

export const SUPPORTED_PROVIDERS = [
  "gmail",
  "google_calendar",
  "notion",
  "github",
  "slack",
  "drive",
] as const;

export type ConnectorProvider = (typeof SUPPORTED_PROVIDERS)[number];

const PROVIDER_TO_TOOLKIT: Record<ConnectorProvider, string> = {
  gmail: "gmail",
  google_calendar: "googlecalendar",
  notion: "notion",
  github: "github",
  slack: "slack",
  drive: "googledrive",
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

export function isSupportedProvider(p: string): p is ConnectorProvider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(p);
}

export function getToolkitSlug(p: ConnectorProvider): string {
  return PROVIDER_TO_TOOLKIT[p];
}
