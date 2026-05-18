// @debo/types - Journal types

export type JournalType = "text" | "audio" | "video";

export type Journal = {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type JournalForIndex = {
  id: string;
  userId: string;
  title?: string | null;
  content: string;
  tags?: string[] | null;
  createdAt: Date | string;
};

export type VideoJournal = {
  id: string;
  userId: string;
  title: string;
  driveFileId: string;
  driveWebUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  transcript: string | null;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AudioJournal = {
  id: string;
  userId: string;
  title: string;
  driveFileId: string;
  driveWebUrl: string | null;
  transcript: string | null;
  duration: number | null;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
