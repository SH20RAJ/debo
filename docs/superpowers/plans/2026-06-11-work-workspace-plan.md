# Work Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Work Workspace" combining manual and AI-curated Tasks and Projects, adding extractionStatus to projects.

**Architecture:** Database schema updates to track AI extraction status for projects. API updates to filter by extraction status and approve/dismiss AI suggestions. Frontend updates to visually distinguish the AI inbox from the active workspace for both tasks and projects.

**Tech Stack:** Next.js, React, Tailwind CSS, Drizzle ORM, Postgres

---

### Task 1: Database Schema Update

**Files:**
- Modify: `packages/db/src/schema.ts`
- Run: `bun run db:generate` in `packages/db`

- [ ] **Step 1: Add extractionStatus to Projects schema**
In `packages/db/src/schema.ts`, locate the `projects` table definition and add the `extractionStatus` column.

```typescript
// Add inside the projects table definition:
    extractionStatus: text("extraction_status", {
      enum: ["manual", "extracted_pending", "extracted_approved", "rejected"],
    })
      .notNull()
      .default("manual"),
```
Update the index block to include `index("projects_extraction_status_idx").on(t.extractionStatus),`.

- [ ] **Step 2: Generate Migration**
```bash
cd packages/db && bun run db:generate && bun run db:push
```

### Task 2: Backend API Updates (Projects)

**Files:**
- Modify: `apps/website/src/app/api/projects/route.ts`
- Create: `apps/website/src/app/api/projects/[id]/approve/route.ts`
- Create: `apps/website/src/app/api/projects/[id]/dismiss/route.ts`

- [ ] **Step 1: Update GET /api/projects to filter by extractionStatus**
Modify `apps/website/src/app/api/projects/route.ts` to accept an `extractionStatus` query parameter, similar to tasks.

```typescript
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const url = new URL(req.url);
    const extStatusParam = url.searchParams.get("extractionStatus");

    const conditions = [
      eq(projects.userId, user.id),
      eq(projects.workspaceId, workspaceId),
    ];

    if (extStatusParam) {
      const parsed = z.enum(["manual", "extracted_pending", "extracted_approved", "rejected"]).safeParse(extStatusParam);
      if (parsed.success) {
        conditions.push(eq(projects.extractionStatus, parsed.data));
      }
    }

    const rows = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(asc(projects.status), desc(projects.updatedAt));

    return NextResponse.json(rows);
  });
}
```

- [ ] **Step 2: Add initial extractionStatus to POST /api/projects**
In `apps/website/src/app/api/projects/route.ts`, when inserting a new project, explicitly set `extractionStatus: "manual"`.

- [ ] **Step 3: Create Approve Route**
Create `apps/website/src/app/api/projects/[id]/approve/route.ts`.

```typescript
import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { projects, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, newId, requireSession, withErrorHandling } from "@/lib/api-helpers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const [updated] = await db
      .update(projects)
      .set({
        status: "active",
        extractionStatus: "extracted_approved",
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(projects.id, id), eq(projects.userId, user.id), eq(projects.workspaceId, workspaceId)))
      .returning();

    if (!updated) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "project.approve",
      targetType: "project",
      targetId: id,
      metadataJson: null,
    });

    return NextResponse.json(updated);
  });
}
```

- [ ] **Step 4: Create Dismiss Route**
Create `apps/website/src/app/api/projects/[id]/dismiss/route.ts`.

```typescript
import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { projects, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, newId, requireSession, withErrorHandling } from "@/lib/api-helpers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const [updated] = await db
      .update(projects)
      .set({
        status: "archived",
        extractionStatus: "rejected",
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(projects.id, id), eq(projects.userId, user.id), eq(projects.workspaceId, workspaceId)))
      .returning();

    if (!updated) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "project.dismiss",
      targetType: "project",
      targetId: id,
      metadataJson: null,
    });

    return NextResponse.json(updated);
  });
}
```

### Task 3: Backend API Updates (Tasks)

**Files:**
- Modify: `apps/website/src/app/api/tasks/route.ts`

- [ ] **Step 1: Update GET /api/tasks to filter by extractionStatus**
Modify the GET endpoint to also accept and filter by `extractionStatus`.

```typescript
// Inside GET function of apps/website/src/app/api/tasks/route.ts
    const extStatusParam = url.searchParams.get("extractionStatus");
    if (extStatusParam) {
      const parsedExt = z.enum(["manual", "extracted_pending", "extracted_approved", "rejected"]).safeParse(extStatusParam);
      if (parsedExt.success) conditions.push(eq(tasks.extractionStatus, parsedExt.data));
    }
```

### Task 4: Frontend API & Types

**Files:**
- Modify: `apps/website/src/lib/api.ts`
- Modify: `apps/website/src/lib/types/index.ts`

- [ ] **Step 1: Update API Client**
In `apps/website/src/lib/api.ts`, update the `projects` object:
```typescript
  projects: {
    list: (extractionStatus?: string) => fetchApi(`/api/projects${extractionStatus ? `?extractionStatus=${extractionStatus}` : ""}`),
    // ... existing ...
    approve: (id: string) => fetchApi(`/api/projects/${id}/approve`, { method: "POST" }),
    dismiss: (id: string) => fetchApi(`/api/projects/${id}/dismiss`, { method: "POST" }),
  },
```
In the `tasks` object, update `list` to take an options object to support both status and extractionStatus.
```typescript
    list: (opts?: { status?: string; extractionStatus?: string }) => {
      const params = new URLSearchParams();
      if (opts?.status) params.set("status", opts.status);
      if (opts?.extractionStatus) params.set("extractionStatus", opts.extractionStatus);
      const q = params.toString();
      return fetchApi(`/api/tasks${q ? `?${q}` : ""}`);
    },
```

- [ ] **Step 2: Update Types**
In `apps/website/src/lib/types/index.ts`, add `extractionStatus` to `ProjectMemory` and `DeboTask`.
```typescript
export type DeboTask = {
  // ... existing ...
  extractionStatus?: string;
};

export type ProjectMemory = {
  // ... existing ...
  extractionStatus?: string;
};
```

### Task 5: Revamp Tasks Page

**Files:**
- Modify: `apps/website/src/components/tasks/tasks-page.tsx`
- Modify: `apps/website/src/components/tasks/task-card.tsx`

- [ ] **Step 1: Rewrite TasksPage Layout**
Refactor `TasksPage` to use the unified Kanban style design (or a robust grid view) that separates manual active tasks from pending extracted tasks. The API call needs to change to use the new object signature.

- [ ] **Step 2: Implement approval flow**
When an extracted task is approved, call `api.tasks.approve(task.id)` and move it to the manual list.

### Task 6: Revamp Projects Page

**Files:**
- Modify: `apps/website/src/components/projects/projects-page.tsx`

- [ ] **Step 1: Rewrite ProjectsPage Layout**
Fetch both manual projects and pending extracted projects. Show pending AI-suggested projects in an "Inbox" style section. Active projects below it.

- [ ] **Step 2: Implement approval flow**
When an extracted project is approved, call `api.projects.approve(project.id)`.

