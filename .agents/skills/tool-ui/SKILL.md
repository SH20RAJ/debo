---
name: tool-ui
description: Find, install, configure, and integrate Tool UI components in React apps using shadcn registry entries, compatibility checks, scaffolded runtime wiring, toolkit setup with assistant-ui, and troubleshooting workflows. Use when developers ask to add one or more Tool UI components, choose components for a use case, verify compatibility, wire a toolkit in a codebase, or integrate Tool UI payloads into assistant-ui or an existing chat/runtime stack.
---

# Tool UI

Use this skill to move from request to working Tool UI integration quickly.

Prefer assistant-ui when the project has no existing chat UI/runtime. Treat assistant-ui as optional when the app already has a working runtime.

## Step 1: Compatibility and Doctor

Read `components.json` in the user's project and verify:

- `components.json` exists.

## Step 2: Install Components

### Install command from project root

**Preferred (AI-assisted integration):**

```bash
npx tool-agent "integrate the <component> component"
```

Use component-specific prompts from the catalog below (e.g. `integrate the plan component for step-by-step task workflows with status tracking`).

**Alternative (direct registry):**

```bash
npx shadcn@latest add @tool-ui/<component-id>
```

Multiple components:

```bash
npx tool-agent "integrate the plan, progress-tracker, and approval-card components for planning flows"
```

Or via shadcn:

```bash
npx shadcn@latest add @tool-ui/plan @tool-ui/progress-tracker @tool-ui/approval-card
```

### Complete component catalog

All 25 Tool UI components with tool-agent prompts and shadcn install commands:

**Progress**

| Component          | Description                                         | tool-agent prompt                                                                                 | shadcn                                            |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `plan`             | Step-by-step task workflows with status tracking    | `integrate the plan component for step-by-step task workflows with status tracking`               | `npx shadcn@latest add @tool-ui/plan`             |
| `progress-tracker` | Real-time status feedback for multi-step operations | `integrate the progress tracker component for real-time status feedback on multi-step operations` | `npx shadcn@latest add @tool-ui/progress-tracker` |

**Input**

| Component           | Description                                 | tool-agent prompt                                                                      | shadcn                                             |
| ------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `option-list`       | Let users select from multiple choices      | `integrate the option list component to let users select from multiple choices`        | `npx shadcn@latest add @tool-ui/option-list`       |
| `parameter-slider`  | Numeric parameter adjustment controls       | `integrate the parameter slider component for numeric parameter adjustment controls`   | `npx shadcn@latest add @tool-ui/parameter-slider`  |
| `preferences-panel` | Compact settings panel for user preferences | `integrate the preferences panel component for compact user settings`                  | `npx shadcn@latest add @tool-ui/preferences-panel` |
| `question-flow`     | Multi-step guided questions with branching  | `integrate the question flow component for multi-step guided questions with branching` | `npx shadcn@latest add @tool-ui/question-flow`     |

**Display**

| Component        | Description                                   | tool-agent prompt                                                                          | shadcn                                          |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `citation`       | Display source references with attribution    | `integrate the citation component to display source references with attribution`           | `npx shadcn@latest add @tool-ui/citation`       |
| `item-carousel`  | Horizontal carousel for browsing collections  | `integrate the item carousel component for horizontal browsing of collections`             | `npx shadcn@latest add @tool-ui/item-carousel`  |
| `link-preview`   | Rich link previews with Open Graph data       | `integrate the link preview component for rich link previews with Open Graph data`         | `npx shadcn@latest add @tool-ui/link-preview`   |
| `stats-display`  | Key metrics and KPIs in a visual grid         | `integrate the stats display component for key metrics and KPIs in a visual grid`          | `npx shadcn@latest add @tool-ui/stats-display`  |
| `terminal`       | Show command-line output and logs             | `integrate the terminal component to show command-line output and logs`                    | `npx shadcn@latest add @tool-ui/terminal`       |
| `weather-widget` | Weather display with forecasts and conditions | `integrate the weather widget component for weather display with forecasts and conditions` | `npx shadcn@latest add @tool-ui/weather-widget` |

**Artifacts**

| Component        | Description                                                                | tool-agent prompt                                                                         | shadcn                                          |
| ---------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `chart`          | Visualize data with interactive charts (needs `recharts`)                  | `integrate the chart component to visualize data with interactive charts`                 | `npx shadcn@latest add @tool-ui/chart`          |
| `code-block`     | Display syntax-highlighted code snippets                                   | `integrate the code block component for syntax-highlighted code snippets`                 | `npx shadcn@latest add @tool-ui/code-block`     |
| `code-diff`      | Compare code changes with syntax-highlighted diffs (needs `@pierre/diffs`) | `integrate the code diff component to compare code changes with syntax-highlighted diffs` | `npx shadcn@latest add @tool-ui/code-diff`      |
| `data-table`     | Present structured data in sortable tables                                 | `integrate the data table component to present structured data in sortable tables`        | `npx shadcn@latest add @tool-ui/data-table`     |
| `message-draft`  | Review and approve messages before sending                                 | `integrate the message draft component to review and approve messages before sending`     | `npx shadcn@latest add @tool-ui/message-draft`  |
| `instagram-post` | Render Instagram post previews                                             | `integrate the instagram post component to render Instagram post previews`                | `npx shadcn@latest add @tool-ui/instagram-post` |
| `linkedin-post`  | Render LinkedIn post previews                                              | `integrate the linkedin post component to render LinkedIn post previews`                  | `npx shadcn@latest add @tool-ui/linkedin-post`  |
| `x-post`         | Render X post previews                                                     | `integrate the x post component to render X/Twitter post previews`                        | `npx shadcn@latest add @tool-ui/x-post`         |

**Confirmation**

| Component       | Description                             | tool-agent prompt                                                                  | shadcn                                         |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `approval-card` | Binary confirmation for agent actions   | `integrate the approval card component for binary confirmation of agent actions`   | `npx shadcn@latest add @tool-ui/approval-card` |
| `order-summary` | Display purchases with itemized pricing | `integrate the order summary component to display purchases with itemized pricing` | `npx shadcn@latest add @tool-ui/order-summary` |

**Media**

| Component       | Description                                  | tool-agent prompt                                                               | shadcn                                         |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| `audio`         | Audio playback with artwork and metadata     | `integrate the audio component for audio playback with artwork and metadata`    | `npx shadcn@latest add @tool-ui/audio`         |
| `image`         | Display images with metadata and attribution | `integrate the image component to display images with metadata and attribution` | `npx shadcn@latest add @tool-ui/image`         |
| `image-gallery` | Masonry grid with fullscreen lightbox viewer | `integrate the image gallery component with masonry grid and lightbox viewer`   | `npx shadcn@latest add @tool-ui/image-gallery` |
| `video`         | Video playback with controls and poster      | `integrate the video component for video playback with controls and poster`     | `npx shadcn@latest add @tool-ui/video`         |

**Display (Geo Map)**

| Component | Description                                     | tool-agent prompt                                                                    | shadcn                                   |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| `geo-map` | Display geolocated entities and fleet positions | `integrate the geo map component to display geolocated entities and fleet positions` | `npx shadcn@latest add @tool-ui/geo-map` |

### Example installs by use case

**tool-agent (recommended):**

```bash
npx tool-agent "integrate the plan, progress-tracker, and approval-card components for planning flows"
npx tool-agent "integrate citation, link-preview, code-block, and code-diff for research output"
npx tool-agent "integrate data-table, chart, and stats-display for data visualization"
npx tool-agent "integrate image, image-gallery, video, and audio for media display"
```

**shadcn (direct):**

```bash
npx shadcn@latest add @tool-ui/plan @tool-ui/progress-tracker @tool-ui/approval-card
npx shadcn@latest add @tool-ui/citation @tool-ui/link-preview @tool-ui/code-block @tool-ui/code-diff
npx shadcn@latest add @tool-ui/data-table @tool-ui/chart @tool-ui/stats-display
# npm i recharts  # peer for chart
npx shadcn@latest add @tool-ui/image @tool-ui/image-gallery @tool-ui/video @tool-ui/audio
```

### Toolkit setup in a codebase

After installing components, wire them into assistant-ui via a `Toolkit`. This section covers the full setup: provider, runtime, toolkit file, and ID handling.

#### 1. Provider and runtime

Create an assistant wrapper that provides runtime, transport, and tools:

```tsx
"use client";

import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { toolkit } from "@/components/toolkit";

export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const aui = useAui({ tools: Tools({ toolkit }) });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <div className="h-dvh">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
```

Key points:

- `useChatRuntime` + `AssistantChatTransport`: connects to your chat API.
- `Tools({ toolkit })`: forwards tool definitions and renderers to the model.
- `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls`: auto-continues after tool calls (optional but common for tool-heavy flows).

#### 2. Toolkit file structure

Create a single `toolkit.ts` (or `toolkit.tsx`) that exports a `Toolkit` object. Each key is a tool name; each value has `type`, `description`, `parameters`, and `render`.

**Tool descriptions** — Always include a `description` on every tool. Describe _when_ to call the tool and what role it plays, not the visible content. The Tool UI component already renders the payload (options, plan, chart, etc.) to the user; a description that repeats that content is redundant. Prefer model-oriented guidance (e.g. "Present a plan for the user to follow" or "Let the user pick one option") over content echo (e.g. "Shows a list of options with labels and descriptions").

## -**Frontend vs backend tools**

| -   |                    | Frontend                                                      | Backend                                                                 |
| --- | ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| -   | **Implementation** | Runs in the browser; user interaction commits via `addResult` | Tool implementation lives on the server; model returns the result       |
| -   | **`execute`**      | Required — runs the tool UI flow client-side                  | Not needed                                                              |
| -   | **`parameters`**   | Required (schema for model args)                              | does not use, uses inputSchema instead if backend llm is done via aisdk |
| -   | **`render`**       | Required (UI for args, status, result, `addResult`)           | Required (UI for `result`)                                              |

**Backend tools** (model returns result; no user input):

```tsx
import { type Toolkit } from "@assistant-ui/react";
import { Plan } from "@/components/tool-ui/plan";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan/schema";

export const toolkit: Toolkit = {
  showPlan: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializablePlan(result);
      if (!parsed) return null;
      return <Plan {...parsed} />;
    },
  },
};
```

**Frontend tools** (model sends args; user interaction commits via `addResult`):

```tsx
import { type Toolkit } from "@assistant-ui/react";
import { OptionList } from "@/components/tool-ui/option-list";
import {
  SerializableOptionListSchema,
  safeParseSerializableOptionList,
} from "@/components/tool-ui/option-list/schema";

const optionListTool: Toolkit[string] = {
  description: "Render selectable options with confirm and clear actions.",
  parameters: SerializableOptionListSchema,
  render: ({ args, toolCallId, result, addResult }) => {
    const parsed = safeParseSerializableOptionList({
      ...args,
      id: args?.id ?? `option-list-${toolCallId}`,
    });
    if (!parsed) return null;

    if (result) {
      return <OptionList {...parsed} choice={result} />;
    }
    return (
      <OptionList
        {...parsed}
        onAction={async (actionId, selection) => {
          if (actionId === "confirm" || actionId === "cancel") {
            await addResult?.(selection);
          }
        }}
      />
    );
  },
};

export const toolkit: Toolkit = {
  option_list: optionListTool,
  approval_card: {
    /* ... */
  },
};
```

#### 3. API route (AI SDK)

When the chat API uses the AI SDK (`streamText`), define backend tools with `tool()` from `ai`:

- Use **`inputSchema`**
- Backend tools use **`execute`** on the server; the result is streamed and rendered via the toolkit `render` function

```ts
import { streamText, tool, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// With frontend tools: ...frontendTools(clientTools) — clientTools come from the request body via AssistantChatTransport
const result = streamText({
  model: openai("gpt-4o"),
  messages: await convertToModelMessages(messages),
  tools: {
    get_weather: tool({
      description:
        "Get the current weather and forecast for a location. Returns data to display in a weather widget.",
      inputSchema: z.object({
        location: z.string().describe("City name, e.g. 'San Francisco'"),
        units: z
          .enum(["celsius", "fahrenheit"])
          .default("fahrenheit")
          .describe("Temperature unit"),
      }),
      execute: async ({ location, units }) => {
        // Fetch weather data, return shape matching your widget schema
        return { location, units /* ... */ };
      },
    }),
  },
});
```

#### 4. Action-centric vs compound components

| Pattern            | Components                                                          | Usage                                                                                                              |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Action-centric** | `OptionList`, `ParameterSlider`, `PreferencesPanel`, `ApprovalCard` | Wire `onAction` or `onConfirm`/`onCancel` directly; no `ToolUI` wrapper. Pass `choice={result}` for receipt state. |
| **Compound**       | `OrderSummary`, `DataTable`, etc.                                   | Wrap in `ToolUI` + `ToolUI.Surface` + `ToolUI.Actions`; use `DecisionActions` or `LocalActions`.                   |

Action-centric example (OptionList):

```tsx
return (
  <OptionList
    {...parsed}
    onAction={async (actionId, selection) => {
      if (actionId === "confirm" || actionId === "cancel") {
        await addResult?.(selection);
      }
    }}
  />
);
```

Compound example (OrderSummary with DecisionActions):

```tsx
return (
  <ToolUI id={parsed.id}>
    <ToolUI.Surface>
      <OrderSummary {...parsed} />
    </ToolUI.Surface>
    <ToolUI.Actions>
      <ToolUI.DecisionActions
        actions={[
          { id: "cancel", label: "Cancel", variant: "outline" },
          { id: "confirm", label: "Purchase" },
        ]}
        onAction={(action) =>
          createDecisionResult({ decisionId: parsed.id, action })
        }
        onCommit={(decision) => addResult?.(decision)}
      />
    </ToolUI.Actions>
  </ToolUI>
);
```

ApprovalCard uses embedded actions; wire `onConfirm`/`onCancel` directly:

```tsx
return (
  <ApprovalCard
    {...parsed}
    choice={
      result === "approved" || result === "denied" ? result : parsed.choice
    }
    onConfirm={async () => addResult?.("approved")}
    onCancel={async () => addResult?.("denied")}
  />
);
```

## Action Model

Tool UI uses two action surfaces, rendered as compound siblings outside the display component:

- `ToolUI.LocalActions`: non-consequential side effects (export, copy, open link). Handlers must not call `addResult(...)`.
- `ToolUI.DecisionActions`: consequential choices that produce a `DecisionResult` envelope via `createDecisionResult(...)`. The commit callback calls `addResult(...)`.

Compound wrapper pattern for display components with actions:

```tsx
<ToolUI id={surfaceId}>
  <ToolUI.Surface>
    <DataTable {...props} />
  </ToolUI.Surface>
  <ToolUI.Actions>
    <ToolUI.LocalActions
      actions={[{ id: "export-csv", label: "Export CSV" }]}
      onAction={(actionId) => {
        /* side effects only */
      }}
    />
  </ToolUI.Actions>
</ToolUI>
```

Three components are action-centric exceptions — they keep embedded action props instead of sibling surfaces. All three share a unified interface:

- `actions`: action buttons rendered by the component.
- `onAction(actionId, state)`: runs after the action and receives post-action state.
- `onBeforeAction(actionId, state)`: guard evaluated before an action runs.

| Component          | State type passed to handlers |
| ------------------ | ----------------------------- |
| `OptionList`       | `OptionListSelection`         |
| `ParameterSlider`  | `SliderValue[]`               |
| `PreferencesPanel` | `PreferencesValue`            |

Components using the compound pattern: `CodeBlock`, `CodeDiff`, `Terminal`, `ProgressTracker`.

Context is shared via `createContext` + `use()` (React 19). Subcomponents throw if used outside their Root.

## Receipt and Choice Convention

Components with outcomes use a `choice` prop to render confirmed/completed state:

| Component         | `choice` type            | Values / shape                                         |
| ----------------- | ------------------------ | ------------------------------------------------------ |
| `ApprovalCard`    | `"approved" \| "denied"` | String literal                                         |
| `OptionList`      | `string \| string[]`     | Selected option ID(s)                                  |
| `OrderSummary`    | `OrderDecision`          | `{ action: "confirm", orderId?, confirmedAt? }`        |
| `ProgressTracker` | `ToolUIReceipt`          | `{ outcome, summary, identifiers?, at }` (shared type) |

When `choice` is present, the component renders in receipt mode — read-only, no actions.

## Operational Rules

- Install the smallest set of components that solves the request.
- Every tool must have a `description`; write it for the model (when to call, what role) — avoid repeating content the component will render.

Notes:
Frontend tools need an execute function
Backend tools have the tool implementation on the server side.
Backend tool don't need either
Ignore the generated files
After setup:

- Ensure the required package dependencies are installed so the first experience of running after the changes is magical
- Notify the user if env variables are not set that should be for a successful run of the feature that was just implemented, most likely mainly variables required by the api chat endpoint.
