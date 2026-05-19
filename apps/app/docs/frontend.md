# Debo Frontend Product Spec

## Product Vision

Debo is not just a notes app, not just a chatbot, and not just a second brain. Debo is a **private memory operating system** for people whose thoughts, commitments, links, files, meetings, voice notes, and ideas are scattered everywhere.

The frontend should feel like a calm, premium command center for your personal context.

The product feeling should be:

* Minimal, focused, quiet, and trusted.
* Fast like Raycast.
* Organized like Notion.
* Conversational like ChatGPT.
* Context-aware like a personal chief of staff.
* Private like a vault.
* Beautiful enough to feel like a billion-dollar product, but simple enough to build fast.

The core promise:

> Capture anything. Ask your past. Trust every answer because Debo shows the source.

---

# 1. Core Frontend Principles

## 1.1 The Interface Should Feel Like Memory

Debo should not look like a normal dashboard with random cards. It should feel like entering a clean personal memory space.

Use these interface metaphors:

* **Library** for saved sources.
* **Timeline** for life/project memory over time.
* **Ask** for natural language recall.
* **Inbox** for unprocessed captures.
* **Graph** for people, tasks, projects, and relationships.
* **Vault** for privacy, export, delete, and controls.

## 1.2 Source-Backed Trust Is the Main Differentiator

Every AI answer must visually show:

* Where the answer came from.
* When it was captured.
* Which source type it came from.
* Confidence level.
* Related memories.

The frontend should make citations beautiful, not academic.

Instead of ugly citation footnotes, use source chips:

```txt
Voice note · Tuesday · Marketing Sync
Journal · May 12 · Product Ideas
PDF · Uploaded 2 days ago · Q4 Allocation Draft
Gmail · Raj · Budget Follow-up
```

## 1.3 Capture Must Be Frictionless

Debo will win if capturing is faster than thinking.

Every page should have a global capture action:

```txt
⌘K → Capture
⌘J → Journal
⌘V → Voice note
⌘U → Upload
⌘A → Ask Debo
```

There should always be a floating `+ Capture` button on mobile.

## 1.4 Frontend Before Backend

Build the frontend with mocked states first:

* Mock user.
* Mock memories.
* Mock AI answers.
* Mock upload states.
* Mock source citations.
* Mock connector cards.
* Mock transcript viewer.
* Mock task extraction.
* Mock people graph.

The frontend should be demo-ready even before real backend exists.

---

# 2. Product Information Architecture

## Main App Structure

```txt
app.debo.life
├── /onboarding
├── /home
├── /ask
├── /capture
├── /journal
├── /library
├── /memory
├── /timeline
├── /people
├── /tasks
├── /projects
├── /sources
├── /connectors
├── /voice
├── /settings
├── /vault
└── /profile
```

## Recommended MVP Routes

Start with only these:

```txt
/home
/ask
/journal
/library
/tasks
/people
/connectors
/settings
```

Then add:

```txt
/timeline
/voice
/projects
/vault
```

---

# 3. Global Layout

## 3.1 Desktop Layout

Use a three-zone layout:

```txt
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: Search, Ask, Capture, Sync Status, Profile           │
├───────────────┬───────────────────────────────┬──────────────┤
│ Sidebar       │ Main Content                   │ Context Rail │
│ Navigation    │ Current Page                   │ Related Info │
│               │                               │              │
└───────────────┴───────────────────────────────┴──────────────┘
```

### Left Sidebar

The sidebar should be clean and iconic.

Primary items:

```txt
Home
Ask Debo
Journal
Library
Timeline
People
Tasks
Connectors
Vault
Settings
```

Secondary items:

```txt
Recent memories
Pinned sources
Private beta badge
Storage indicator
```

### Top Bar

Top bar elements:

```txt
Global search input: “Search or ask Debo…”
Quick Capture button
Command Menu trigger
Sync status
Notification bell
User avatar
```

### Right Context Rail

The context rail should change based on the page.

Examples:

On Ask page:

```txt
Sources used
Related memories
Suggested follow-ups
Confidence
```

On Journal page:

```txt
Detected people
Detected tasks
Related past memories
Writing stats
```

On Person page:

```txt
Recent interactions
Open tasks
Related projects
Source history
```

## 3.2 Mobile Layout

Mobile should not be a compressed desktop.

Use:

* Bottom navigation.
* Floating capture button.
* Full-screen ask experience.
* Swipeable source cards.
* Compact memory cards.

Mobile bottom nav:

```txt
Home | Ask | Capture | Library | You
```

The center `Capture` button should be visually dominant.

---

# 4. Visual Design Direction

## 4.1 Overall Feel

The app should feel like:

```txt
Private AI workspace + memory vault + personal command center
```

Avoid:

* Generic SaaS blue dashboards.
* Too many gradients.
* Overly playful illustrations.
* Heavy borders everywhere.
* Random colorful cards.
* “AI-generated startup UI” look.

Use:

* Soft neutral backgrounds.
* Excellent spacing.
* Premium typography.
* Subtle glass/blur only where useful.
* Calm accent color.
* Smooth motion.
* Dense information only when requested.

## 4.2 Color System

Recommended palette:

```txt
Background: warm off-white / near-black for dark mode
Surface: white / dark graphite
Primary text: deep charcoal
Secondary text: muted gray
Accent: electric indigo or memory purple
Success: muted green
Warning: amber
Danger: soft red
```

Use color meaningfully:

```txt
Purple = memory/AI
Blue = source/reference
Green = task completed
Amber = needs review
Red = private/delete/security
```

## 4.3 Typography

Use a clean modern font system.

Recommended:

```txt
Primary UI: Inter or Geist Sans
Optional premium headings: Instrument Sans / Satoshi-style feel
Monospace: Geist Mono
```

Hierarchy:

```txt
Page title: 28–36px
Section title: 18–22px
Body: 14–16px
Metadata: 12–13px
Command labels: 12px mono
```

## 4.4 Spacing

Use generous spacing. Debo should feel calm.

```txt
Page padding desktop: 32px
Card padding: 20–24px
Section gap: 32px
Card radius: 20–28px
Button radius: 999px or 12px depending context
```

## 4.5 Motion

Motion should feel intelligent, not flashy.

Use motion for:

* Command menu open.
* Capture confirmation.
* Ask answer streaming.
* Source card reveal.
* Memory timeline expansion.
* Task extraction appearing.
* Connector sync progress.

Avoid:

* Bouncy cartoon animations.
* Excessive hover transformations.
* Slow page transitions.

---

# 5. App Shell

## 5.1 Sidebar Design

Sidebar sections:

```txt
Debo logo
Primary navigation
Pinned memories
Recent sources
Private beta status
User/profile controls
```

Sidebar item states:

```txt
Default
Hover
Active
Unread/needs review
Beta locked
```

Example:

```txt
Ask Debo        ⌘A
Journal         ⌘J
Library         ⌘L
Tasks           8
People          12
Connectors      3 active
```

## 5.2 Command Menu

The command menu is one of the most important frontend features.

Open with:

```txt
⌘K
Ctrl K
```

Command groups:

```txt
Capture
- New journal entry
- Record voice note
- Upload file
- Save link

Ask
- Ask Debo
- Search memories
- Find tasks
- Find person

Navigate
- Go to Library
- Go to People
- Go to Tasks
- Go to Connectors

Actions
- Export memory
- Delete source
- Connect Gmail
- Review extracted tasks
```

Command menu should support natural language:

```txt
“what did I promise Raj”
“new voice note”
“upload pdf”
“show tasks from meetings”
```

---

# 6. Onboarding Flow

## Goal

Onboarding should make the user feel:

```txt
This is my private memory system.
I control what goes in.
Debo will not randomly spy on me.
```

## Step 1: Welcome

Headline:

```txt
Build your private memory layer.
```

Subtext:

```txt
Debo helps you capture thoughts, notes, files, tasks, and conversations — then recall them with source-backed answers.
```

Primary CTA:

```txt
Start building my memory
```

Secondary:

```txt
See how Debo works
```

## Step 2: Choose Your Use Case

Cards:

```txt
Founder
Student / Researcher
Creator / Builder
Personal life
Work memory
```

Each card updates suggested starter memories.

## Step 3: Choose Capture Types

Options:

```txt
Journal entries
Voice notes
Files and PDFs
Links
Tasks
Meetings
Connected apps
```

## Step 4: Privacy Promise

Show 4 clear commitments:

```txt
You choose what gets saved.
Every answer shows sources.
You can delete/export anytime.
Connectors are optional.
```

CTA:

```txt
Continue
```

## Step 5: Create First Memory

Do not send the user to an empty dashboard.

Ask them to create one memory immediately:

```txt
What is something you don’t want to forget?
```

Input options:

```txt
Write
Record
Upload
Paste link
```

After save, show:

```txt
Memory saved.
Debo can now answer questions from this source.
```

## Step 6: First Ask

Auto-suggest:

```txt
Ask: “Summarize what I just saved.”
Ask: “What tasks are hidden in this?”
Ask: “What should I remember from this?”
```

This creates the “aha” moment.

---

# 7. Home Page

## Purpose

Home is not a generic dashboard. It is a daily memory cockpit.

## Sections

```txt
Today’s Memory
Quick Capture
Continue Where You Left Off
Open Loops
Recent Sources
People To Follow Up With
Suggested Questions
```

## Hero Area

Show a calm greeting:

```txt
Good morning, Shaswat.
Your memory is up to date.
```

Alternative states:

```txt
You have 3 new memories waiting for review.
You mentioned 4 tasks this week.
Raj appears in 3 recent sources.
```

## Quick Capture Cards

Cards:

```txt
Write journal
Record voice
Upload file
Save link
Ask Debo
```

Each card should be one-click.

## Open Loops

This is a powerful feature.

Show things Debo thinks need attention:

```txt
You promised Raj the Q4 budget by Friday.
You saved 5 product ideas but didn’t tag them.
You mentioned “landing page revamp” in 3 places.
You have 2 unreviewed voice notes.
```

Each open loop card has actions:

```txt
Mark done
Create task
Ask about this
Open source
Dismiss
```

## Recent Memories

Memory cards should show:

```txt
Icon by source type
Title
Summary
Source type
Date
Detected people/tasks
```

Example:

```txt
Voice note
Marketing Sync Follow-up
You discussed Q4 allocation and promised Raj a finalized draft by Friday.
Raj · Q4 Budget · 1 task
```

---

# 8. Ask Debo Page

## Purpose

This is the core experience.

Ask Debo should feel like ChatGPT, but with a memory library behind it.

## Layout

```txt
Main chat area
Right source/context rail
Bottom composer
```

## Empty State

Headline:

```txt
Ask your past anything.
```

Suggested prompts:

```txt
What did I promise Raj?
What ideas did I save about Debo?
Summarize my last 7 days.
What tasks are hidden in my notes?
What did I learn from recent PDFs?
Who should I follow up with?
```

## Composer

Input placeholder:

```txt
Ask Debo about your memories…
```

Composer actions:

```txt
Attach source
Voice input
Filter sources
Choose time range
Ask mode
```

Ask modes:

```txt
Recall
Summarize
Find tasks
Compare
Plan
Draft
```

## Answer Design

Each answer should have:

```txt
Direct answer
Source-backed evidence
Related memories
Suggested next actions
```

Example structure:

```txt
You promised Raj that you would send the finalized Q4 budget allocation by Friday before the board meeting.

Sources:
- Voice note · Marketing Sync · Tuesday
- Task · Q4 Allocation Draft · Uploaded 2 days ago

Suggested actions:
- Create task
- Draft message to Raj
- Open related memory
```

## Source Cards

Source cards should be beautiful and expandable.

Collapsed:

```txt
Voice note · Tuesday · Marketing Sync
```

Expanded:

```txt
Transcript excerpt
Timestamp
Detected people
Related tasks
Open original
```

## Confidence UI

Do not show fake percentages everywhere. Use human confidence labels:

```txt
Strong source match
Partial source match
Needs more context
No source found
```

## No Source State

If Debo cannot find proof:

```txt
I couldn’t find a saved source for that. I can still help reason from the current conversation, but I won’t treat it as memory.
```

Buttons:

```txt
Search wider
Add memory
Connect source
```

---

# 9. Journal Page

## Purpose

This is the Notion-like writing space.

The journal should support:

* Daily notes.
* Project notes.
* Reflections.
* Meeting notes.
* Quick thoughts.
* Long-form writing.

## Layout

```txt
Left: entries list / calendar
Center: Block editor
Right: memory insights
```

## Editor Features

Use a block-based editor.

Required blocks:

```txt
Text
Heading
Checklist
Bullet list
Numbered list
Quote
Code
Divider
Image
File
Callout
Task
Person mention
Date mention
Source embed
AI insight block
```

## Slash Commands

```txt
/task
/person
/source
/voice
/file
/summary
/ask
/reminder
/decision
```

## AI Writing Features

Keep AI subtle.

Commands:

```txt
Summarize this note
Extract tasks
Find related memories
Turn into action plan
Rewrite clearly
Create follow-up message
Tag people and projects
```

## Right Insight Rail

Show:

```txt
Detected people
Detected tasks
Related memories
Suggested tags
Source quality
Last edited
```

## Journal Empty State

```txt
Start with one thought.
Debo will organize the rest.
```

Buttons:

```txt
Write freely
Use daily template
Record instead
Paste meeting notes
```

## Templates

Include templates:

```txt
Daily reflection
Meeting notes
Startup idea
Customer call
Research note
Learning note
Decision log
Weekly review
```

---

# 10. Capture Page / Capture Modal

## Purpose

Capture should be available everywhere.

## Capture Types

```txt
Quick thought
Journal entry
Voice note
File upload
Link save
Screenshot/image
Task
Meeting note
```

## Capture Modal Layout

```txt
Tabs: Write | Record | Upload | Link | Task
```

## Write Capture

Placeholder:

```txt
Write anything you want Debo to remember…
```

Actions:

```txt
Save
Save and ask
Save as task
Save to project
```

## Voice Capture

Visual design:

* Large record button.
* Waveform animation.
* Timer.
* Pause/resume.
* Add title.
* Save to project.

After recording:

```txt
Transcribing…
Extracting useful memory…
Finding tasks and people…
```

Mock this frontend even before backend exists.

## Upload Capture

Support UI for:

```txt
PDF
Image
Audio
Video
Doc
Markdown
Text
```

Upload states:

```txt
Uploading
Processing
Ready
Needs review
Failed
```

## Link Capture

Input:

```txt
Paste any URL…
```

Preview card:

```txt
Title
Domain
Description
Save button
```

---

# 11. Library Page

## Purpose

The library is the complete source archive.

## Layout

```txt
Top search/filter bar
Source type tabs
Memory grid/list
Right preview panel
```

## Source Type Tabs

```txt
All
Journal
Voice
Files
Links
Meetings
Tasks
Connectors
Images
```

## Filters

```txt
Source type
Date range
People
Projects
Has tasks
Needs review
Connected app
```

## Views

Support 3 views:

```txt
Grid view
List view
Timeline view
```

## Memory Card

Each card should contain:

```txt
Source icon
Title
Short summary
Date
People chips
Task count
Source status
```

Statuses:

```txt
Ready
Processing
Needs review
Failed
Private
```

## Preview Panel

Clicking a source opens right-side preview:

```txt
Title
Summary
Original text/transcript
People
Tasks
Related memories
Actions
```

Actions:

```txt
Ask about this
Open full source
Create task
Edit summary
Delete
Export
```

---

# 12. Source Detail Page

## Route

```txt
/library/[sourceId]
```

## Purpose

Show one source deeply.

## Sections

```txt
Source header
Summary
Original content
Transcript/document viewer
Extracted memories
Tasks
People
Related sources
Activity log
```

## Source Header

Show:

```txt
Title
Source type
Created date
Status
Privacy level
Actions
```

## Transcript Viewer

For audio/video:

```txt
Audio player
Transcript with timestamps
Speaker labels
Highlights
Search transcript
```

## Document Viewer

For docs:

```txt
Page preview
Extracted text
AI summary
Citations to pages/sections
```

## Extracted Memory Section

Cards:

```txt
Important facts
Decisions
Tasks
People
Dates
Questions
```

---

# 13. Timeline Page

## Purpose

Timeline makes Debo feel alive.

The user should see their thoughts, promises, tasks, and memories across time.

## Views

```txt
Today
This week
This month
Custom range
```

## Timeline Items

Types:

```txt
Journal entry
Voice note
Task created
Task completed
Person mentioned
File uploaded
Meeting recorded
Connector sync
```

## Timeline Item Design

```txt
Date/time
Source icon
Summary
People/project chips
Open source
Ask about this
```

## Weekly Memory Review

This can become a premium feature.

Sections:

```txt
What you captured
People you mentioned
Tasks you created
Ideas you repeated
Open loops
Decisions made
Suggested next steps
```

---

# 14. People Page

## Purpose

Debo should remember people like a personal CRM.

## People List

Cards:

```txt
Name
Relationship/context
Last mentioned
Open tasks
Recent sources
```

Example:

```txt
Raj
Marketing / Q4 Budget
Last mentioned Tuesday
2 open tasks · 4 memories
```

## Person Detail Page

Route:

```txt
/people/[personId]
```

Sections:

```txt
Profile summary
Recent mentions
Promises made
Open tasks
Related projects
Source history
Suggested follow-ups
```

## Person Summary

Debo-generated but editable:

```txt
Raj is related to your marketing work and Q4 budget planning. You recently promised to send him the finalized allocation by Friday.
```

## Follow-Up Actions

```txt
Draft message
Create task
Ask about Raj
Open sources
Merge duplicate person
```

---

# 15. Tasks Page

## Purpose

Debo should turn hidden commitments into visible tasks.

## Task Views

```txt
Inbox
Today
Upcoming
Waiting
Completed
Extracted from memory
```

## Task Card

Show:

```txt
Task title
Due date
Related person
Source
Confidence
Status
```

Example:

```txt
Send finalized Q4 budget to Raj
Due Friday
Source: Marketing Sync voice note
Strong source match
```

## Extracted Task Review

Important feature.

When Debo extracts tasks from notes/calls, show a review queue:

```txt
Debo found 3 possible tasks.
```

For each:

```txt
Accept
Edit
Dismiss
Open source
```

This prevents AI from feeling invasive.

---

# 16. Projects Page

## Purpose

Projects group memories around ongoing work.

Examples:

```txt
Debo
Apify actors
Portfolio services
College
Startup grants
Content ideas
```

## Project Detail Page

Sections:

```txt
Project summary
Pinned memories
Open tasks
People involved
Recent sources
Decisions
Ideas
Ask within project
```

## Ask Within Project

Each project should have scoped Ask:

```txt
Ask Debo about this project…
```

Suggested prompts:

```txt
What are the latest decisions?
What tasks are pending?
Summarize this project.
What should I do next?
```

---

# 17. Connectors Page

## Purpose

Connectors should feel safe and optional.

## Connector Categories

```txt
Communication
- Gmail
- Slack
- Discord

Calendar
- Google Calendar
- Outlook Calendar

Knowledge
- Notion
- Google Drive
- GitHub

Productivity
- Linear
- Todoist
- Trello
```

## Connector Card

Show:

```txt
App logo
Name
Description
Status
Permissions summary
Connect/disconnect button
```

Status states:

```txt
Not connected
Connected
Syncing
Needs attention
Paused
```

## Connector Permission UI

For every connector, show plain English permissions:

```txt
Debo can read selected emails you choose.
Debo will not send emails unless you ask.
You can disconnect anytime.
```

## Connected App Detail

Sections:

```txt
Sync status
Last synced
Sources imported
Permissions
Memory rules
Disconnect
```

## Memory Rules

Powerful privacy UX:

```txt
What should Debo remember from Gmail?
- Starred emails only
- Emails from selected people
- Emails with attachments
- Manual import only
```

---

# 18. Voice Page

## Purpose

Voice is a major differentiator.

## Views

```txt
Voice notes
AI calls
Meeting recordings
Transcripts
```

## Voice Note Experience

Page should have:

```txt
Large record button
Recent recordings
Transcription status
Extracted memories
```

## AI Call Experience

Frontend route:

```txt
/voice/call
```

Modes:

```txt
Talk to Debo
Debrief my day
Plan with Debo
Practice pitch
Meeting assistant
```

## Post-Call Summary

After a voice call:

```txt
Call summary
Decisions
Tasks
People mentioned
Memories saved
Full transcript
```

---

# 19. Vault Page

## Purpose

The Vault is where trust is built.

This page should make Debo feel privacy-first.

## Sections

```txt
Memory controls
Connected apps
Export data
Delete memories
Privacy settings
Audit log
```

## Memory Controls

```txt
Review saved memories
Pause memory capture
Clear assistant memory
Delete all sources
Export archive
```

## Privacy Modes

```txt
Normal
Private session
Local-only draft
Do not remember this
```

## Audit Log

Show:

```txt
Memory saved
Source deleted
Connector connected
Connector disconnected
Export requested
```

This is a trust feature.

---

# 20. Settings Page

## Sections

```txt
Account
Appearance
AI preferences
Memory preferences
Notifications
Shortcuts
Billing
Developer
```

## Appearance

```txt
Theme: Light / Dark / System
Density: Comfortable / Compact
Accent color
Reduce motion
```

## AI Preferences

```txt
Default ask mode
Answer style
Source strictness
Auto-extract tasks
Auto-summarize sources
```

## Memory Preferences

```txt
Remember journal entries
Remember voice notes
Remember uploaded files
Remember connector data
Require review before saving extracted facts
```

## Shortcuts

Show keyboard shortcuts clearly:

```txt
⌘K Command menu
⌘A Ask Debo
⌘J New journal
⌘U Upload
⌘V Voice note
/ Slash commands
```

---

# 21. Notifications

Notifications should be useful, not noisy.

Types:

```txt
Task due
Memory processed
Connector sync issue
New extracted tasks
Weekly memory review
Follow-up reminder
```

Notification card:

```txt
Title
Short context
Source
Action buttons
```

Example:

```txt
Follow up with Raj
You promised to send Q4 budget by Friday.
Source: Marketing Sync voice note
[Draft message] [Mark done]
```

---

# 22. Empty States

Empty states are critical for a new user.

## Empty Home

```txt
Your memory starts with one capture.
Save a thought, note, file, or voice memo — Debo will make it searchable.
```

CTA:

```txt
Create first memory
```

## Empty Library

```txt
No sources yet.
Everything you save will appear here with summaries, tasks, and source-backed recall.
```

## Empty Ask

```txt
Ask Debo after saving your first memory.
```

## Empty Tasks

```txt
No tasks yet.
Debo can detect tasks from journals, voice notes, and meetings.
```

## Empty People

```txt
People will appear here when they are mentioned in your memories.
```

---

# 23. Loading States

Debo should make processing feel magical but honest.

## Source Processing States

```txt
Uploading source…
Reading content…
Transcribing audio…
Extracting memory…
Finding people and tasks…
Creating searchable memory…
Ready.
```

Use stepper UI.

## Ask Loading State

Instead of generic spinner:

```txt
Searching your memories…
Checking related sources…
Preparing source-backed answer…
```

Show source cards as they are found.

---

# 24. Error States

Errors should be calm and fixable.

## Upload Failed

```txt
Upload failed. Your file was not saved.
```

Actions:

```txt
Try again
Choose different file
Contact support
```

## Processing Failed

```txt
Debo saved the file, but couldn’t process it yet.
```

Actions:

```txt
Retry processing
Open original
Delete source
```

## No Answer Found

```txt
I couldn’t find this in your saved memories.
```

Actions:

```txt
Search all sources
Add memory
Connect apps
```

---

# 25. Memory Review Queue

This should be a special page or section.

Route:

```txt
/memory/review
```

Purpose:

Debo should not silently create questionable memories. Let the user approve important extracted facts.

Review items:

```txt
Possible task
Possible person
Possible decision
Possible project
Possible important fact
```

Actions:

```txt
Approve
Edit
Dismiss
Always remember this type
Never remember this type
```

This makes Debo feel trustworthy and user-controlled.

---

# 26. Memory Card System

Every memory card should be consistent.

## Memory Card Fields

```txt
Source type icon
Title
One-line summary
Date/time
People chips
Project chips
Task count
Confidence/source status
```

## Card Sizes

```txt
Compact card
Standard card
Expanded card
Preview card
```

## Compact Card

Used in sidebars and related memories.

```txt
[Voice] Marketing Sync
Raj · Q4 Budget · Tuesday
```

## Standard Card

Used in library.

```txt
Marketing Sync
You promised Raj to send the Q4 budget by Friday.
Voice note · Tuesday · 1 task · 2 people
```

## Expanded Card

Used in source previews.

```txt
Marketing Sync
Summary...
Tasks...
People...
Transcript excerpt...
```

---

# 27. Source Type Icons

Use consistent icons:

```txt
Journal = notebook
Voice = waveform/mic
File = document
PDF = file text
Link = globe/link
Email = mail
Calendar = calendar
Task = check circle
Person = user
Project = folder
Decision = diamond/check
Private = lock
```

---

# 28. AI Answer Components

## Components

```txt
AnswerBubble
SourceCitationCard
RelatedMemoryCard
SuggestedActionButton
ConfidenceLabel
FollowUpPrompts
ReasoningHiddenNotice
```

## Answer Bubble Layout

```txt
Answer text
Source evidence section
Related context
Actions
```

## Suggested Actions

Examples:

```txt
Create task
Draft reply
Save as memory
Open source
Add to project
Remind me
Export answer
```

---

# 29. Search Experience

Global search should support:

```txt
Keyword search
Natural language questions
People search
Task search
Source search
Date search
```

Search UI:

```txt
Search bar
Recent searches
Suggested queries
Grouped results
```

Grouped results:

```txt
Best answer
Sources
Tasks
People
Projects
Recent memories
```

Example query:

```txt
Raj budget Friday
```

Results:

```txt
Best match: Marketing Sync voice note
Task: Send Q4 budget to Raj
Person: Raj
Related source: Q4 Allocation Draft.pdf
```

---

# 30. Frontend Data Model for Mocking

Use mock data like this before backend.

```ts
export type SourceType =
  | "journal"
  | "voice"
  | "file"
  | "link"
  | "meeting"
  | "email"
  | "calendar"
  | "task";

export type SourceStatus =
  | "ready"
  | "processing"
  | "needs_review"
  | "failed";

export type MemorySource = {
  id: string;
  type: SourceType;
  title: string;
  summary: string;
  createdAt: string;
  status: SourceStatus;
  people: string[];
  projects: string[];
  taskCount: number;
  sourceLabel: string;
};

export type DeboTask = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done" | "dismissed";
  dueDate?: string;
  relatedPerson?: string;
  sourceId?: string;
  confidence: "strong" | "partial" | "weak";
};

export type PersonMemory = {
  id: string;
  name: string;
  context: string;
  lastMentioned: string;
  openTaskCount: number;
  memoryCount: number;
};
```

---

# 31. Recommended Component Architecture

```txt
components/
├── app-shell/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── context-rail.tsx
│   └── command-menu.tsx
│
├── capture/
│   ├── capture-modal.tsx
│   ├── voice-recorder.tsx
│   ├── upload-dropzone.tsx
│   ├── link-capture.tsx
│   └── capture-type-tabs.tsx
│
├── memory/
│   ├── memory-card.tsx
│   ├── source-card.tsx
│   ├── source-preview.tsx
│   ├── source-status-badge.tsx
│   └── related-memories.tsx
│
├── ask/
│   ├── ask-composer.tsx
│   ├── answer-bubble.tsx
│   ├── citation-card.tsx
│   ├── suggested-actions.tsx
│   └── follow-up-prompts.tsx
│
├── journal/
│   ├── journal-editor.tsx
│   ├── journal-list.tsx
│   ├── journal-insights.tsx
│   └── journal-template-picker.tsx
│
├── people/
│   ├── person-card.tsx
│   ├── person-detail-header.tsx
│   └── person-memory-timeline.tsx
│
├── tasks/
│   ├── task-card.tsx
│   ├── extracted-task-review.tsx
│   └── task-source-chip.tsx
│
└── ui/
    ├── buttons
    ├── badges
    ├── cards
    ├── modals
    └── empty-states
```

---

# 32. Page Build Order

Build frontend in this order:

## Phase 1: Product Demo Frontend

```txt
1. App shell
2. Home page
3. Ask Debo page with mocked answers
4. Library page with mocked memory cards
5. Capture modal
6. Journal page with editor placeholder
```

## Phase 2: Rich Memory UX

```txt
7. Source detail page
8. Tasks page
9. People page
10. Timeline page
11. Memory review queue
```

## Phase 3: Premium Product UX

```txt
12. Connectors page
13. Voice page
14. Vault page
15. Settings page
16. Mobile responsive polish
```

## Phase 4: Investor/Demo Polish

```txt
17. Beautiful empty states
18. Streaming answer animations
19. Source citation interactions
20. Command menu
21. Keyboard shortcuts
22. Dark mode
```

---

# 33. Exact MVP Demo Flow

This is the demo flow that should impress users/investors.

## Step 1

User lands on Home.

They see:

```txt
Good morning, Shaswat.
You have 3 open loops from recent memories.
```

## Step 2

They click `Record voice note`.

They record:

```txt
I promised Raj I’ll send the Q4 budget allocation by Friday before the board meeting.
```

## Step 3

Debo shows processing:

```txt
Transcribing…
Extracting task…
Finding people…
Memory ready.
```

## Step 4

Debo shows extracted result:

```txt
Task found:
Send Q4 budget allocation to Raj by Friday.
```

User clicks `Accept task`.

## Step 5

User goes to Ask Debo and asks:

```txt
What did I promise Raj?
```

## Step 6

Debo answers:

```txt
You promised Raj that you would send the Q4 budget allocation by Friday before the board meeting.
```

Sources:

```txt
Voice note · Today · 0:12
Task · Q4 budget follow-up
```

Suggested actions:

```txt
Draft message to Raj
Mark task done
Open voice note
```

This single demo explains the whole product.

---

# 34. Frontend Routes in Detail

## `/home`

Purpose:

```txt
Daily command center.
```

Sections:

```txt
Greeting
Quick capture
Open loops
Recent memories
Suggested asks
```

## `/ask`

Purpose:

```txt
Source-backed memory chat.
```

Sections:

```txt
Chat thread
Composer
Source rail
Related memories
```

## `/journal`

Purpose:

```txt
Notion-like writing and reflection.
```

Sections:

```txt
Entry list
Editor
Insight rail
Templates
```

## `/library`

Purpose:

```txt
All saved sources.
```

Sections:

```txt
Search
Filters
Cards/list
Preview panel
```

## `/tasks`

Purpose:

```txt
Extracted and manual tasks.
```

Sections:

```txt
Task views
Review queue
Source-backed task cards
```

## `/people`

Purpose:

```txt
Personal CRM from memory.
```

Sections:

```txt
People cards
Recent mentions
Follow-up suggestions
```

## `/connectors`

Purpose:

```txt
Optional connected memory sources.
```

Sections:

```txt
Connector cards
Permission summaries
Sync controls
```

## `/vault`

Purpose:

```txt
Privacy, export, delete, audit.
```

Sections:

```txt
Memory controls
Exports
Deletion
Audit log
```

---

# 35. UI Copy Guidelines

Debo copy should be:

```txt
Clear
Calm
Trustworthy
Human
Direct
```

Avoid:

```txt
Magical nonsense
Overpromising
Corporate jargon
“10x productivity” clichés
Fake urgency
```

Use:

```txt
Saved to memory.
Source ready.
Debo found 2 possible tasks.
This answer is based on 3 sources.
You control what Debo remembers.
```

---

# 36. Premium Details That Matter

## 36.1 Microinteractions

Add small premium moments:

```txt
Memory card subtly glows when ready
Source chips animate into answer
Capture button confirms with a soft check
Command menu remembers recent actions
Tasks slide into review queue
Timeline items expand smoothly
```

## 36.2 Keyboard-First UX

Debo should feel fast for power users.

Shortcuts:

```txt
⌘K Command menu
⌘A Ask
⌘J Journal
⌘L Library
⌘U Upload
⌘⇧V Voice note
Esc Close modal
/ Editor commands
```

## 36.3 Personalization

Home should adapt based on user behavior.

For founder:

```txt
Investor notes
Customer calls
Follow-ups
Product decisions
```

For student:

```txt
Lectures
Research papers
Assignments
Study tasks
```

For creator:

```txt
Ideas
Scripts
References
Content plans
```

---

# 37. What Not To Build First

Avoid in frontend MVP:

```txt
Complex graph visualization
Huge settings pages
Team collaboration
Billing screens
Mobile app
Full calendar UI
Too many integrations
Over-designed landing inside app
```

Build the simple memory loop first:

```txt
Capture → Process → Ask → Source-backed answer → Action
```

---

# 38. Final Frontend Identity

Debo should feel like:

```txt
Your private AI memory desk.
```

Not like:

```txt
A random notes app.
A generic chatbot.
A Notion clone.
A task manager.
A file manager.
```

The winning frontend is the one where a user instantly understands:

```txt
I save things here.
Debo remembers them.
I can ask anything later.
Every answer shows proof.
I control my memory.
```

---

# 39. Final Recommended MVP Frontend Scope

Build these screens first:

```txt
1. Onboarding
2. Home
3. Capture modal
4. Ask Debo
5. Library
6. Source detail
7. Journal
8. Tasks
9. People
10. Connectors
11. Settings
```

Use mocked data and make the app feel real.

The first frontend demo should prove one thing:

> Debo turns scattered context into trustworthy memory.

---

# 40. One-Line Product UX Rule

Every screen should answer one of these:

```txt
What did I capture?
What does Debo remember?
What can I ask?
What should I do next?
Can I trust the source?
Can I control/delete/export it?
```

If a screen does not answer one of these, remove it.
