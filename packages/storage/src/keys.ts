/**
 * R2 object key helpers for Debo storage.
 *
 * Key format follows the backend spec (section 10.2):
 *   workspaces/{workspaceId}/users/{userId}/sources/{sourceId}/original/{filename}
 *   workspaces/{workspaceId}/users/{userId}/sources/{sourceId}/processed/{filename}
 *   workspaces/{workspaceId}/users/{userId}/exports/{exportId}/debo-export.zip
 */

/** Key for an uploaded original source file (audio, video, PDF, image, etc.). */
export function sourceOriginalKey(
  workspaceId: string,
  userId: string,
  sourceId: string,
  filename: string,
): string {
  return `workspaces/${workspaceId}/users/${userId}/sources/${sourceId}/original/${filename}`;
}

/** Key for a processed/derived file (transcript JSON, extracted text, etc.). */
export function sourceProcessedKey(
  workspaceId: string,
  userId: string,
  sourceId: string,
  filename: string,
): string {
  return `workspaces/${workspaceId}/users/${userId}/sources/${sourceId}/processed/${filename}`;
}

/** Key for a user export archive. */
export function exportKey(
  workspaceId: string,
  userId: string,
  exportId: string,
): string {
  return `workspaces/${workspaceId}/users/${userId}/exports/${exportId}/debo-export.zip`;
}
