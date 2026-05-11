import { composio } from "@/lib/composio";

/**
 * Fetches Mastra-compatible tools from Composio for a specific user.
 * @param userId The unique ID of the user (Entity ID in Composio)
 * @param toolkits List of toolkits to fetch (e.g., ["google-drive", "gmail"])
 */
export async function getComposioTools(userId: string, toolkits: string[] = ["googledrive"]) {
  const session = await composio.create(userId);
  return await session.tools({ 
    toolkits 
  });
}

/**
 * Pre-defined Google Drive tools from Composio.
 * Note: These require the user to have connected their account via OAuth.
 */
export const googleDriveTools = await composio.tools({
  toolkits: ["googledrive"],
});
