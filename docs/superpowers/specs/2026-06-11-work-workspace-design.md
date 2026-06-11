# Work Workspace Design (Tasks & Projects)

## Purpose
Revamp the Tasks and Projects sections in Debo to create a cohesive "Work Workspace". It must blend manual control (like Linear/Asana) with AI-first curation, where Debo actively suggests tasks and projects based on the user's memories, journals, and voice notes.

## Architecture & Data Flow

### Backend / Database Modifications
1. **Projects Schema**: Add an `extractionStatus` column to the `projects` table (similar to `tasks`).
   - `extractionStatus`: `enum('manual', 'extracted_pending', 'extracted_approved', 'rejected')` defaulting to `'manual'`.
   - This allows the AI to tentatively suggest new projects based on recurring themes in the user's memories, which the user can approve or dismiss.
2. **API Routes**:
   - Add `POST /api/projects/[id]/approve` and `POST /api/projects/[id]/dismiss` to handle project suggestions.
   - Ensure task and project GET routes support filtering by `extractionStatus` to cleanly separate the AI Inbox from active manual items.

### User Interface & Experience

#### 1. Tasks Page (`/dashboard/tasks`)
- **Layout**: A split view or tabs that heavily feature the "Inbox" (AI suggestions) alongside standard manual management.
- **AI Inbox**: A dedicated pane showing tasks Debo extracted from recent inputs (e.g., "From your voice note today: 'Call plumber'").
  - Actions: `Approve` (moves to Todo), `Dismiss`, or `Edit & Approve`.
- **Active Workspace (Kanban/List)**:
  - Columns/Sections: `Todo`, `Doing`, `Done`.
  - Rich task cards showing confidence, related people, and source context (where the task came from).
  - Drag-and-drop support (using something like `@hello-pangea/dnd` or just simple status buttons for MVP).

#### 2. Projects Page (`/dashboard/projects`)
- **Layout**: Similar split view—AI Project Suggestions vs. Active Projects.
- **AI Project Suggestions**: Debo notices when multiple tasks or memories clump around a topic (e.g., "Moving to Austin") and suggests creating a project to group them.
- **Active Projects View**: A rich grid view of active projects.
- **Project Detail Page (`/dashboard/projects/[id]`)**: 
  - A unified dashboard for a single project.
  - Shows linked tasks, pinned memories, linked people, and decisions.

### AI Integration (The "Debo" Factor)
- **Tracing**: Every task/project AI suggestion maintains a link to its `sourceId` or `memoryItemId` so the user knows *why* it was suggested.
- **Global Actions**: The global Chat (`/dashboard/chat`) can emit tool calls to create tasks or projects directly, which will land in the user's workspace as `manual` or `extracted_approved`.

## Trade-offs & Implementation Notes
- *Trade-off*: A full drag-and-drop Kanban board is complex. We will start with a grouped list view (or simple column layout) where status is changed via a dropdown/menu to ensure stability and focus on the AI integration first.
- *Tech Stack*: React (Next.js), Tailwind CSS, Drizzle ORM, Postgres.

## Success Criteria
- The user can manually create, edit, and delete tasks and projects.
- The AI can suggest tasks/projects that appear in an "Inbox", which the user can approve or reject.
- The UI feels premium, distinct from generic AI slop, and uses the defined Debo design language (e.g., `minimal-card`, `duo-card`).
