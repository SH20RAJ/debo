"use server";

import { composio } from "@/lib/composio";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

/**
 * Generates a Composio connection URL for a specific app.
 * Redirects the user to the OAuth consent screen.
 */
export async function connectComposioApp(appName: string = "googledrive") {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // 1. Find or create an auth config for the toolkit
    const authConfigs = await composio.authConfigs.list({
      toolkit: appName,
    });

    let authConfigId = authConfigs.items[0]?.id;

    if (!authConfigId) {
      // Create a default Composio-managed auth config if none exists
      const newConfig = await composio.authConfigs.create(appName, {
        type: "use_composio_managed_auth",
        name: `${appName} Default Auth`,
      });
      authConfigId = newConfig.id;
    }

    // 2. Create a connection link
    console.log("Initiating Composio connection link for user:", user.id, "config:", authConfigId);
    
    if (!composio.connectedAccounts) {
      console.error("CRITICAL: composio.connectedAccounts is undefined. SDK may not be initialized correctly.");
      throw new Error("Composio SDK error: connectedAccounts is undefined");
    }

    const connection = await composio.connectedAccounts.link(
      user.id,
      authConfigId,
      {
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connectors?composio_success=true`,
      }
    );

    if (connection.redirectUrl) {
      redirect(connection.redirectUrl);
    }
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error initiating Composio connection:", error);
    throw error;
  }
}

/**
 * Returns a list of apps the user has actively connected via Composio.
 */
export async function getComposioActiveApps() {
  const user = await stackServerApp.getUser();
  if (!user) return [];

  try {
    if (!composio.connectedAccounts) {
      console.error("CRITICAL: composio.connectedAccounts is undefined in getComposioActiveApps.");
      return [];
    }

    const connections = await composio.connectedAccounts.list({
      userIds: [user.id],
    });
    return connections.items
      .filter((c) => c.status === "ACTIVE")
      .map((c) => ({
        slug: c.toolkit.slug.toLowerCase(),
        id: c.id
      }));
  } catch (error) {
    console.error("Error fetching Composio connections:", error);
    return [];
  }
}

/**
 * Disconnects a Composio app for the current user.
 */
export async function disconnectComposioApp(toolkitSlug: string) {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    if (!composio.connectedAccounts) {
      throw new Error("Composio SDK not initialized");
    }

    const connections = await composio.connectedAccounts.list({
      userIds: [user.id],
      toolkitSlugs: [toolkitSlug]
    });

    const activeConnections = connections.items.filter(c => c.status === "ACTIVE");
    
    for (const conn of activeConnections) {
      await composio.connectedAccounts.delete(conn.id);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error disconnecting ${toolkitSlug}:`, error);
    throw error;
  }
}
