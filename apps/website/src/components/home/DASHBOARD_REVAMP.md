<!--
DASHBOARD REVAMP — Plan

Audit (current home):
+ Greeting w/ inbox count, QuickCapture grid, OpenLoops, RecentMemories,
  SuggestedQuestions, DeboChatWidget. Live data is wired (tasks, sources).
- Five flat capture cards bury the primary act ("What's on your mind?").
- Three separate question surfaces (chat widget, suggested asks, ask page)
  fragment intent and confuse the path to answers.
- "Open Loops", "Recent Memories", "Suggested Asks" each get a full row,
  so above-the-fold is title-heavy and mostly empty for new users.
- Chat widget feels like a debug card pinned next to a list — no presence.
- Hardcoded suggested questions ("What did I promise Raj?") leak demo copy.
- Nothing surfaces decisions, even though /api/decisions exists.

Direction (matches motto: Capture / Ask / Trust):
1. CONFIDENT HERO. Greeting collapses into one line. Below it sits a single
   smart input — "What's on your mind?". Submitting routes by intent:
     • starts with ?/who/what/when/why/how -> /dashboard/ask?q=...
     • a URL -> create link source then toast
     • plain text >= 12 chars -> create journal source
   Side affordances: voice (push-to-talk -> /voice), upload, ask mode toggle.
2. ACTION TRIAD. One row of three big tiles: Capture (journal/voice/upload/
   link menu), Ask Debo, Review (jumps to inbox with count). Replaces the
   5-card grid; secondary actions live inside the Capture tile's menu.
3. TODAY RAIL. Two-column section ("Today" / "Open loops"):
     • Today  = sources created today + decisions decided today, merged,
                newest first, capped at 6.
     • Loops  = inbox tasks (re-skinned OpenLoops, denser).
   On <lg both stack; on >=lg they sit side-by-side.
4. CHAT BAR -> ChatPreview. Compact card showing last thread + "Continue"
   button using api.ask.listThreads(). New chat opens /dashboard/chat.
   Removes the in-home streaming widget — Ask page is the real surface.
5. RECENT MEMORIES strip. Horizontal scroller (4 cards on desktop, swipe
   on mobile) using existing MemoryCard. Cut SuggestedQuestions entirely.

Component fate:
- greeting.tsx        -> rewrite (one line, no badge; count moves to Review tile)
- quick-capture.tsx   -> rewrite as <CaptureHero /> (hero input + triad)
- open-loops.tsx      -> rewrite (denser, no big section header in card)
- recent-memories.tsx -> rewrite (horizontal scroll, live)
- debo-chat-widget.tsx-> rewrite as <ChatPreview /> (no streaming on home)
- suggested-questions.tsx -> delete usage from page (file kept untouched
                              to avoid unrelated import churn)
- new: today-rail.tsx (sources+decisions merged for today)

Data:
- api.tasks.list("inbox") for loops + Review badge
- api.sources.list() for Today + RecentMemories
- api.decisions.list() for Today
- api.ask.listThreads() for ChatPreview last thread

Layout (>=lg): hero (full) / triad (3 cols) / today+loops (2 cols) /
chatpreview (full) / recent memories (full scroller).
On <lg everything stacks; triad goes 1->2->3 cols across breakpoints.

Constraints honored: only existing UI primitives + lucide; semantic tokens
only (no text-black/bg-white); all components "use client"; empty/loading/
error states on every async surface.
-->
