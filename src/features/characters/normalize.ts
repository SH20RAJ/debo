const HONORIFICS = /\b(mr|mrs|ms|miss|dr|sir|madam|prof|professor)\.?\s+/gi;
const NON_NAME_CHARS = /[^a-z0-9\s'-]/gi;

const NAME_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "api",
  "audio",
  "chat",
  "debo",
  "friday",
  "google",
  "i",
  "journal",
  "monday",
  "next",
  "saturday",
  "sunday",
  "the",
  "this",
  "thursday",
  "today",
  "tomorrow",
  "tuesday",
  "video",
  "wednesday",
  "we",
  "yesterday",
  "youtube",
]);

export function normalizeCharacterName(value: string) {
  return value
    .replace(HONORIFICS, "")
    .replace(NON_NAME_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function displayCharacterName(value: string) {
  return value
    .replace(HONORIFICS, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export function isLikelyPersonName(value: string) {
  const normalized = normalizeCharacterName(value);
  if (normalized.length < 2 || normalized.length > 80) return false;

  const parts = normalized.split(" ");
  if (parts.some((part) => NAME_STOPWORDS.has(part))) return false;
  if (parts.length > 4) return false;
  if (parts.some((part) => part.length < 2 && parts.length > 1)) return false;

  return /[a-z]/.test(normalized);
}

export function normalizeAliases(values: string[] = []) {
  const seen = new Set<string>();
  const aliases: string[] = [];

  for (const value of values) {
    const display = displayCharacterName(value);
    const normalized = normalizeCharacterName(display);
    if (!display || !isLikelyPersonName(display) || seen.has(normalized)) continue;
    seen.add(normalized);
    aliases.push(display);
  }

  return aliases.slice(0, 12);
}

export function mergeUniqueAliases(...groups: Array<string[] | null | undefined>) {
  return normalizeAliases(groups.flatMap((group) => group || []));
}

export function sourceHref(sourceType: string, sourceId: string) {
  if (sourceType === "text") return `/dashboard/journal/text/${sourceId}`;
  if (sourceType === "audio") return `/dashboard/journal/audio/${sourceId}`;
  if (sourceType === "video") return `/dashboard/journal/video/${sourceId}`;
  if (sourceType === "chat") return `/dashboard/chat?thread=${sourceId}`;
  return null;
}

export function stableId(parts: string[]) {
  const source = parts.join(":");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}
