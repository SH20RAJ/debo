/**
 * Internal client for calling the Debo Agents service.
 *
 * apps/api can optionally forward AI-heavy requests to apps/agents
 * via internal HTTP. If AGENTS_SERVICE_URL is not configured, the
 * API falls back to direct LLM calls.
 */

const AGENTS_SERVICE_URL = process.env.AGENTS_SERVICE_URL;
const AGENTS_INTERNAL_SECRET = process.env.AGENTS_INTERNAL_SECRET;

/** Returns true if the agents service is configured. */
export function isAgentsConfigured(): boolean {
  return !!(AGENTS_SERVICE_URL && AGENTS_INTERNAL_SECRET);
}

/**
 * Forward an "ask" request to the agents service.
 * Returns the raw Response for streaming.
 */
export async function askViaAgents(
  userId: string,
  question: string,
  mode: string,
): Promise<Response> {
  if (!AGENTS_SERVICE_URL || !AGENTS_INTERNAL_SECRET) {
    throw new Error("Agents service not configured");
  }

  const url = `${AGENTS_SERVICE_URL}/ask`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-agents-secret": AGENTS_INTERNAL_SECRET,
    },
    body: JSON.stringify({ userId, question, mode }),
  });
}

/**
 * Request memory extraction from the agents service.
 */
export async function extractMemoryViaAgents(
  userId: string,
  sourceId: string,
  content: string,
  sourceType: string,
): Promise<{ status: string; extractedItems: unknown[] }> {
  if (!AGENTS_SERVICE_URL || !AGENTS_INTERNAL_SECRET) {
    throw new Error("Agents service not configured");
  }

  const url = `${AGENTS_SERVICE_URL}/extract-memory`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-agents-secret": AGENTS_INTERNAL_SECRET,
    },
    body: JSON.stringify({ userId, sourceId, content, sourceType }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Agents extraction failed: ${res.status} ${errBody}`);
  }

  return res.json() as Promise<{ status: string; extractedItems: unknown[] }>;
}
