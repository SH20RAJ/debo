# Debo Features

Debo is a life intelligence system. It captures personal context, converts it into structured memory, and lets the user ask, talk, search, and act with that context.

## Character Graph

The Character Graph is a private people layer for Debo.

What it does:

- Finds people mentioned in text journals, audio journals, video journals, and chat.
- Creates a profile for each person with name, custom ID, avatar URL, aliases, relationship, summary, and private notes.
- Stores references back to the original source: chat, text journal, audio journal, video journal, or manual note.
- Deduplicates people after sync by normalized name and aliases.
- Lets the user edit everything Debo knows about a person.

Why it matters:

- Debo can understand relationship context, not just isolated facts.
- The user can quickly review who matters in their life and why.
- Answers can become more personal without losing source traceability.

Primary files:

- `src/features/characters/actions.ts`
- `src/features/characters/extract.ts`
- `src/features/characters/normalize.ts`
- `src/features/characters/components/characters-manager.tsx`
- `src/app/(dashboard)/dashboard/characters/page.tsx`
- `src/db/migrations/0006_character_profiles.sql`

## Memory Engine

The memory engine stores facts, entities, emotions, and topics extracted from journal and chat context.

What it does:

- Saves permanent facts locally and through Mem0 when available.
- Retrieves relevant memories during chat.
- Keeps user-editable memory management in `/dashboard/memories`.

## Journals

Debo supports text, audio, and video journals.

What it does:

- Stores text journals in Postgres.
- Stores media journals in Google Drive when connected.
- Indexes journals for semantic search.
- Extracts memory and character context after save.

## Chat

Chat is the conversational interface for Debo.

What it does:

- Retrieves memories and journal citations.
- Saves important user facts to memory.
- Captures people mentioned during important chat turns into the Character Graph.

## Talk

Talk is Debo's LiveKit voice mode.

What it does:

- Uses LiveKit for realtime room transport.
- Uses Deepgram STT, NVIDIA-compatible LLM, and Cartesia TTS.
- Loads memory/settings safely without blocking voice startup.

## Capture

Capture is the distraction-free audio/video journaling surface.

What it does:

- Records audio or video.
- Uploads media to organized Google Drive folders.
- Generates a clear title from the recording description, with a date fallback.

## Search

Debo search uses semantic journal search with structured fallbacks.

What it does:

- Searches journals by meaning when vector services are available.
- Falls back to Postgres text search when vectors are offline.

## Design Principles

- Keep the main surfaces calm and focused.
- Make memory visible and editable.
- Prefer source-backed context over mysterious AI guesses.
- Add momentum through useful review loops, not manipulative engagement tricks.
