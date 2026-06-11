# Debo Architecture Overview

Debo is a full-stack, AI-first memory and productivity application. The core philosophy is "capture first, organize automatically." The system ingests journals, voice notes, emails, and calendar events, processing them into a searchable memory graph, and automatically extracts commitments (tasks) and contexts (projects).

## 1. High-Level System Architecture

The application is built on a modern, serverless-friendly monorepo using **Turborepo** or similar workspaces.

- **Frontend (`apps/website`)**: A Next.js 16 (React 19) application using the App Router.
- **Backend (Next.js API Routes)**: Serverless functions inside `apps/website/src/app/api` handle routing, authentication, and core business logic.
- **Database (`packages/db`)**: Drizzle ORM managing a serverless PostgreSQL database (Neon).
- **AI/LLM (`packages/ai`)**: Interactions with language models (OpenAI, LangChain) for parsing, entity extraction, and chatting.

## 2. Core Data Models (The Memory Graph)

The database schema (`packages/db/src/schema.ts`) is designed around a unified graph of interconnected concepts.

### **Ingestion (Sources)**
- **`sources`**: The root of any piece of information. A source can be a `journal`, `voice` note, `email`, `file`, or a `manual` entry.
- **`source_files`**: Binary attachments (audio, images) linked to a source.
- **`transcripts` & `documents`**: Processed text representations of the source.

### **Understanding (Memory & Entities)**
- **`memory_chunks`**: Split, vector-embedded pieces of text from documents for semantic search (RAG).
- **`memory_items`**: Extracted nuggets of meaning (e.g., `fact`, `preference`, `idea`, `decision`).
- **`entities`**: Recognized specific nouns (e.g., `person`, `project`, `company`).
- **`people`**: Rich profiles of contacts auto-generated from mentions across sources.
- **`memory_relations`**: The edges of the graph. It maps how a task `depends_on` a person, or how a memory `contradicts` a source.

### **Action (The Work Workspace)**
- **`tasks`**: Actionable commitments. 
  - *Hybrid extraction:* Tasks can be manually created (`extractionStatus: 'manual'`) or suggested by AI (`extractionStatus: 'extracted_pending'`). 
- **`projects`**: Collections of memories and tasks. Like tasks, these can be auto-suggested based on recurring themes.

## 3. Frontend Architecture

The frontend is built with Tailwind CSS, `shadcn/ui`, and Framer Motion. 

### Key Layout Concepts
- **`app/dashboard/layout.tsx`**: The main application shell. It manages the `Sidebar` (left) and `Topbar` (top). It handles the responsive state (mobile drawer vs. desktop sidebar).
- **`Sidebar` (`lib/sidebar-prefs.ts`)**: Highly customizable, allowing users to collapse sections or hide unused modules.

### The "Split-View" AI Paradigm
In the **Work Workspace** (Tasks and Projects) and **Inbox**, we utilize a standard paradigm:
1. **Main Content (Left/Center)**: The user's active, verified data.
2. **AI Sidebar (Right)**: An inbox of pending, AI-extracted suggestions. The user acts as an editor, approving or dismissing the AI's tentative extractions.

## 4. The Request Lifecycle (Example: Voice Note)

1. **Capture**: User records audio in `/dashboard/voice`.
2. **Upload**: Audio is sent to `POST /api/media/upload` and saved to an R2 bucket.
3. **Ingest**: A new `source` and `voice_session` are created in the database.
4. **Process (Async/Background)**:
   - Audio is sent to a transcription service (Deepgram/OpenAI).
   - Transcript is saved to the `transcripts` table.
   - The LLM pipeline kicks in:
     - Chunks text into `memory_chunks` and embeds them.
     - Extracts action items -> Creates `tasks` with `extractionStatus: 'extracted_pending'`.
     - Extracts facts/entities -> Creates `memory_items` and updates `people`.
5. **Review**: User visits `/dashboard/tasks`, sees the new task in the "AI Suggestions" sidebar, and clicks "Approve".
6. **Action**: The task's status changes to `todo` and moves to the active board.

## 5. Optimal "Library" Implementation

The user reported an error on the Library page. The optimal architecture for the library involves:
- **Unified Querying**: A single `GET /api/sources` endpoint that can filter by `type`, `status`, and `search` query.
- **Client-Side Hydration**: The `LibraryPage` fetches all sources on mount. This allows instantaneous client-side filtering (Grid/List toggle, Type filtering).
- **Robust Normalization**: The `normalizeSource` helper function in the frontend ensures that variations in database casing (`created_at` vs `createdAt`) don't cause `TypeError: Cannot read properties of undefined` exceptions during render. (This was a likely culprit for the reported bug).