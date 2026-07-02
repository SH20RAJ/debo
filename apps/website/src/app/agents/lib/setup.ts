import type { SetupStatus } from "./chat/types";

export function getInitialSetupStatus(): SetupStatus {
  return {
    appReady: true,
    authReady: true,
    databaseConfigured: true,
    databaseReady: true,
    databaseSchemaReady: true,
    missing: [],
    rateLimitReady: true,
  };
}

export async function getSetupStatus(): Promise<SetupStatus> {
  return getInitialSetupStatus();
}

export async function isAppConfigured() {
  return true;
}
