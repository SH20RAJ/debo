-- Migration: Add video_journals, audio_journals, and google_drive_credentials tables
-- Created for Issue #39

-- Google Drive credentials table
CREATE TABLE IF NOT EXISTS "google_drive_credential" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") UNIQUE,
  "access_token" text,
  "refresh_token" text,
  "expiry_date" timestamp,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "gdc_user_id_idx" ON "google_drive_credential"("user_id");

-- Video journals table
CREATE TABLE IF NOT EXISTS "video_journal" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "title" text NOT NULL,
  "drive_file_id" text NOT NULL,
  "drive_web_url" text,
  "thumbnail_url" text,
  "duration" integer,
  "transcript" text,
  "folder_id" text,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "video_journal_user_id_idx" ON "video_journal"("user_id");
CREATE INDEX IF NOT EXISTS "video_journal_created_at_idx" ON "video_journal"("created_at");

-- Audio journals table
CREATE TABLE IF NOT EXISTS "audio_journal" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "title" text NOT NULL,
  "drive_file_id" text NOT NULL,
  "drive_web_url" text,
  "transcript" text,
  "duration" integer,
  "folder_id" text,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audio_journal_user_id_idx" ON "audio_journal"("user_id");
CREATE INDEX IF NOT EXISTS "audio_journal_created_at_idx" ON "audio_journal"("created_at");
