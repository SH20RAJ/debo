/**
 * Google Drive API integration for media journal storage.
 * Handles OAuth2 flow and file operations via Nango.
 */

import { nango } from "./nango";

const GOOGLE_DRIVE_PROVIDER_CONFIG_KEY = "google-drive";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

export class GoogleDriveClient {
  private connectionId: string;

  constructor(connectionId: string) {
    this.connectionId = connectionId;
  }

  /**
   * Get or create the Debo root folder
   */
  async getOrCreateDeboFolder(): Promise<DriveFolder> {
    const rootFolder = await this.findFolder("Debo");
    if (rootFolder) return rootFolder;
    return this.createFolder("Debo");
  }

  /**
   * Get or create a subfolder
   */
  async getOrCreateSubfolder(parentId: string, name: string): Promise<DriveFolder> {
    const folder = await this.findFolder(name, parentId);
    if (folder) return folder;
    return this.createFolder(name, parentId);
  }

  /**
   * Find a folder by name
   */
  async findFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    try {
      let query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const result = await nango.proxy({
        method: "GET",
        endpoint: "/files",
        providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
        connectionId: this.connectionId,
        params: { q: query, fields: "files(id, name)" },
      });

      const files = (result.data as { files?: DriveFile[] }).files || [];
      if (files.length > 0) {
        return { id: files[0].id, name: files[0].name };
      }
      return null;
    } catch (error) {
      console.error("Error finding folder:", error);
      return null;
    }
  }

  /**
   * Create a folder
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFolder> {
    const metadata: Record<string, unknown> = {
      name,
      mimeType: "application/vnd.google-apps.folder",
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const result = await nango.proxy({
      method: "POST",
      endpoint: "/files",
      providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
      connectionId: this.connectionId,
      data: metadata,
    });

    const file = result.data as DriveFile;
    return { id: file.id, name: file.name };
  }

  /**
   * Upload a file to Drive
   */
  async uploadFile(
    name: string,
    content: ArrayBuffer,
    mimeType: string,
    parentId?: string
  ): Promise<DriveFile> {
    // Note: Google Drive API requires multipart upload for binary content
    // This is a simplified version - in production, use the Drive API directly
    const metadata: Record<string, unknown> = {
      name,
      mimeType,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const result = await nango.proxy({
      method: "POST",
      endpoint: "/files",
      providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
      connectionId: this.connectionId,
      data: {
        metadata,
        content: Buffer.from(content).toString("base64"),
      },
    });

    return result.data as DriveFile;
  }

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<DriveFile | null> {
    try {
      const result = await nango.proxy({
        method: "GET",
        endpoint: `/files/${fileId}`,
        providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
        connectionId: this.connectionId,
        params: {
          fields: "id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime,modifiedTime",
        },
      });

      return result.data as DriveFile;
    } catch (error) {
      console.error("Error getting file:", error);
      return null;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await nango.proxy({
        method: "DELETE",
        endpoint: `/files/${fileId}`,
        providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
        connectionId: this.connectionId,
      });
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Make file publicly accessible and return shareable URL
   */
  async makePublic(fileId: string): Promise<string> {
    const result = await nango.proxy({
      method: "POST",
      endpoint: `/files/${fileId}/permissions`,
      providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
      connectionId: this.connectionId,
      data: {
        role: "reader",
        type: "anyone",
      },
    });

    const file = await this.getFile(fileId);
    return file?.webViewLink || "";
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    let query = "mimeType != 'application/vnd.google-apps.folder'";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const result = await nango.proxy({
      method: "GET",
      endpoint: "/files",
      providerConfigKey: GOOGLE_DRIVE_PROVIDER_CONFIG_KEY,
      connectionId: this.connectionId,
      params: { q: query, fields: "files(id,name,mimeType,webViewLink,thumbnailLink,size,createdTime)" },
    });

    return ((result.data as { files?: DriveFile[] }).files || []) as DriveFile[];
  }
}

/**
 * Initialize folder structure for a user
 */
export async function initializeUserDriveFolders(connectionId: string): Promise<{
  rootFolderId: string;
  videosFolderId: string;
  audiosFolderId: string;
  transcriptsFolderId: string;
}> {
  const drive = new GoogleDriveClient(connectionId);

  // Create root "Debo" folder
  const rootFolder = await drive.getOrCreateDeboFolder();

  // Create subfolders
  const videosFolder = await drive.getOrCreateSubfolder(rootFolder.id, "Videos");
  const audiosFolder = await drive.getOrCreateSubfolder(rootFolder.id, "Audios");
  const transcriptsFolder = await drive.getOrCreateSubfolder(rootFolder.id, "Transcripts");

  return {
    rootFolderId: rootFolder.id,
    videosFolderId: videosFolder.id,
    audiosFolderId: audiosFolder.id,
    transcriptsFolderId: transcriptsFolder.id,
  };
}
