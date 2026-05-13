import { composio } from "@/lib/composio";

const EMPTY_OUTPUT_PARAMETERS = {
  type: "object",
  properties: {},
  additionalProperties: true,
};

const composioSchemaOptions = {
  modifySchema: ({ schema }: { schema: any }) => ({
    ...schema,
    outputParameters: EMPTY_OUTPUT_PARAMETERS,
  }),
};

/**
 * Mapping of toolkit slugs to safe tool actions that don't trigger
 * Composio SDK $ref resolution errors (e.g. AddParentResponse, AddFileSharingPreferenceResponse).
 * We load specific actions instead of entire toolkits.
 */
const SAFE_TOOLKIT_ACTIONS: Record<string, string[]> = {
  googledrive: [
    "GOOGLEDRIVE_FIND_FILE",
    "GOOGLEDRIVE_FIND_FOLDER",
    "GOOGLEDRIVE_UPLOAD_FILE",
    "GOOGLEDRIVE_CREATE_FILE",
    "GOOGLEDRIVE_LIST_FILES",
    "GOOGLEDRIVE_CREATE_FOLDER",
    "GOOGLEDRIVE_DELETE_FILE",
  ],
  youtube: [
    "YOUTUBE_SEARCH_YOU_TUBE",
  ],
  gmail: [
    "GMAIL_SEND_EMAIL",
    "GMAIL_FETCH_EMAILS",
    "GMAIL_GET_EMAIL",
    "GMAIL_CREATE_EMAIL_DRAFT",
  ],
  slack: [
    "SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL",
    "SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_PAGINATION",
  ],
  github: [
    "GITHUB_LIST_REPOSITORIES",
    "GITHUB_CREATE_AN_ISSUE",
    "GITHUB_GET_A_REPOSITORY",
  ],
};

/**
 * Fetches Mastra-compatible tools from Composio for a specific user.
 * Uses specific action IDs instead of full toolkits to avoid $ref resolution bugs.
 */
export async function getComposioTools(userId: string, toolkits: string[] = ["googledrive"]) {
  // Gather safe actions for the requested toolkits
  const actions: string[] = [];
  for (const tk of toolkits) {
    const safe = SAFE_TOOLKIT_ACTIONS[tk.toLowerCase()];
    if (safe) {
      actions.push(...safe);
    }
  }

  if (actions.length === 0) {
    console.warn("[ComposioTools] No known safe actions for toolkits:", toolkits);
    return {};
  }

  try {
    const tools = await composio.tools.get(userId, { tools: actions }, composioSchemaOptions);
    console.log(`[ComposioTools] Loaded ${Object.keys(tools).length} tools for: ${toolkits.join(", ")}`);
    return tools;
  } catch (error) {
    console.warn(`[ComposioTools] Batch tool fetch failed, retrying one action at a time: ${getComposioErrorSummary(error)}`);
  }

  const loadedTools: Record<string, any> = {};
  const failedActions: string[] = [];

  for (const action of actions) {
    try {
      const tools = await composio.tools.get(userId, action, composioSchemaOptions);
      Object.assign(loadedTools, tools);
    } catch (error) {
      failedActions.push(action);
      console.warn(`[ComposioTools] Skipping ${action}: ${getComposioErrorSummary(error)}`);
    }
  }

  if (failedActions.length > 0) {
    console.warn(`[ComposioTools] Skipped ${failedActions.length} tools: ${failedActions.join(", ")}`);
  }

  const toolCount = Object.keys(loadedTools).length;
  if (toolCount === 0) return {};

  console.log(`[ComposioTools] Loaded ${toolCount} tools for: ${toolkits.join(", ")}`);
  return loadedTools;
}

/**
 * Lazily fetches Google Drive tools from Composio.
 * Uses specific actions to avoid $ref resolution errors.
 */
export async function getGoogleDriveTools() {
  return getComposioTools("default", ["googledrive"]);
}

function getComposioErrorSummary(error: unknown) {
  if (!error || typeof error !== "object") return String(error);

  const err = error as {
    code?: string;
    message?: string;
    meta?: { ref?: string };
  };

  const parts = [err.code, err.meta?.ref, err.message].filter(Boolean);
  return parts.join(" - ");
}
