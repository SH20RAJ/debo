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

  const connection = await composio.connections.initiate({
    appName,
    entityId: user.id,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connectors?composio_success=true`,
  });

  if (connection.redirectUrl) {
    redirect(connection.redirectUrl);
  }
}

/**
 * Checks if a user has an active connection for a specific app.
 */
export async function getComposioConnectionStatus(appName: string = "googledrive") {
  const user = await stackServerApp.getUser();
  if (!user) return false;

  try {
    const connections = await composio.connections.list({
      entityId: user.id,
    });
    return connections.some((c) => c.appName === appName && c.status === "ACTIVE");
  } catch (error) {
    console.error("Error fetching Composio connections:", error);
    return false;
  }
}
