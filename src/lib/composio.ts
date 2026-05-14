import { Composio } from "@composio/core";
import { MastraProvider } from "@composio/mastra";

if (!process.env.COMPOSIO_API_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("COMPOSIO_API_KEY is not set");
  }
}

/**
 * Composio Client for Debo.
 * Manages 1,000+ AI tools and user-specific OAuth connections.
 */
export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY || "placeholder_key",
  provider: new MastraProvider(),
  dangerouslyAllowAutoUploadDownloadFiles: false,
});
