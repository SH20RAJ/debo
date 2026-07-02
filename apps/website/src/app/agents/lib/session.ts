import { stackServerApp } from "@/stack/server";
import type { SetupStatus, Viewer } from "./chat/types";

export async function getServerViewer(setupStatus?: SetupStatus): Promise<Viewer | null> {
  if (process.env.NODE_ENV === "development") {
    return {
      id: "usr_mock",
      email: "mock@example.com",
      name: "Mock User",
      image: null,
    };
  }

  try {
    const user = await stackServerApp.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.primaryEmail || `${user.id}@unknown.local`,
      name: user.displayName || "User",
      image: user.profileImageUrl || null,
    };
  } catch {
    return null;
  }
}
