import { composio } from "@/lib/composio";

/**
 * Fetches Mastra-compatible tools from Composio for a specific user.
 * @param userId The unique ID of the user (Entity ID in Composio)
 * @param toolkits List of toolkits to fetch (e.g., ["googledrive", "gmail"])
 */
export async function getComposioTools(userId: string, toolkits: string[] = ["googledrive"]) {
  try {
    const session = await composio.create(userId, {
      toolkits,
      sessionPreset: "direct_tools",
    });
    return await session.tools();
  } catch (error) {
    console.error("[ComposioTools] Failed to fetch tools:", error);
    return {};
  }
}

/**
 * Lazily fetches Google Drive tools from Composio.
 * Wrapped in a function to avoid top-level await crashes from $ref resolution errors
 * in the Composio SDK (e.g. AddFileSharingPreferenceResponse).
 */
export async function getGoogleDriveTools() {
  try {
    return await composio.tools.get("default", {
      toolkits: ["googledrive"],
    });
  } catch (error) {
    console.error("[ComposioTools] Failed to load Google Drive tools (likely a $ref resolution issue in Composio SDK):", error);
    return {};
  }
}
