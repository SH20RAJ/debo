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
    const connections = await composio.connectedAccounts.list({
      userIds: [user.id],
    });
    return connections.items
      .filter((c) => c.status === "ACTIVE")
      .map((c) => c.toolkit.slug.toLowerCase());
  } catch (error) {
    console.error("Error fetching Composio connections:", error);
    return [];
  }
}
