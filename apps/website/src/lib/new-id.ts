/**
 * Generates a stable unique ID with a prefix.
 */
export function newId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${prefix}_${ts}${rand}`;
}
