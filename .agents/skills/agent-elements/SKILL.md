---
name: agent-elements
description: |
  Use whenever the user wants to build or modify a chat, agent, or tool-calling
  UI in a React 19 + Tailwind v4 project — especially if the code imports from
  `@/components/agent-elements/*` or the project has that folder on disk.
  Triggers: "agent chat", "tool call UI", "streaming chat", "plan approval",
  "AgentChat", "InputBar", "tool renderer", mentions of Agent Elements, or
  requests to add a new agent surface with shadcn.

  Do NOT use for plain chat UIs that don't need tool/plan/approval cards, or
  for projects already committed to a different agent UI kit.
---

# Agent Elements skill

Project-aware context for building chat and agent UIs with **Agent Elements** —
an open-source shadcn registry at `https://agent-elements.21st.dev`.

## What this skill gives you

When this skill loads, you know:

1. **The registry is shadcn-compatible.** Every component is installed with
   `npx shadcn@latest add https://agent-elements.21st.dev/r/<component>.json`.
   Files land under `components/agent-elements/` (the library's internal
   `components/` prefix is stripped — see Paths below).
2. **The API is typed around the Vercel AI SDK.** Messages are
   `UIMessage[]` from `ai`, status is `ChatStatus`. `useChat()` plugs in
   directly.
3. **The full component catalog with API shapes and composition rules** (see
   sections below).
4. **Theming guardrails** — the Tailwind tokens Agent Elements depends on.

## Detection

Consider this project "Agent Elements-ready" if any of these are true:

- `components/agent-elements/` exists on disk
- `components.json` includes an alias or registry reference to Agent Elements
- `package.json` dependencies include `ai` + `@tabler/icons-react` and the user
  mentions Agent Elements

If the folder does not exist yet, install on demand with:

```bash
npx shadcn@latest add https://agent-elements.21st.dev/r/agent-chat.json
```

`agent-chat` transitively pulls every other component it needs via
`registryDependencies` (MessageList, InputBar, tool renderers, shared utils).

## Paths (post-install layout)

After `shadcn add`, files sit under `@/components/agent-elements/` with this
shape:

```
components/agent-elements/
  agent-chat.tsx
  message-list.tsx
  input-bar.tsx
  markdown.tsx
  user-message.tsx
  error-message.tsx
  text-shimmer.tsx
  spiral-loader.tsx
  input/
    attachment-button.tsx
    send-button.tsx
    file-attachment.tsx
    suggestions.tsx
    model-picker.tsx
    mode-selector.tsx
  tools/
    bash-tool.tsx
    edit-tool.tsx
    search-tool.tsx
    todo-tool.tsx
    plan-tool.tsx
    tool-group.tsx
    subagent-tool.tsx
    mcp-tool.tsx
    thinking-tool.tsx
    generic-tool.tsx
  question/
    question-tool.tsx
  hooks/use-tool-complete.ts
  utils/cn.ts
  types.ts
```

**Import rule:** always import from the exact file, never from a barrel.

```tsx
// ✅
import { AgentChat } from "@/components/agent-elements/agent-chat";
import { BashTool } from "@/components/agent-elements/tools/bash-tool";

// ❌ — no barrel exists
import { AgentChat } from "@/components/agent-elements";
```

## Component catalog

### Chat surface

- **AgentChat** — the full chat shell. Renders `MessageList` + `InputBar`,
  handles tool invocations via `toolRenderers`, shows an empty state with
  optional `suggestions`. Props: `messages`, `status`, `onSend`, `onStop`,
  `toolRenderers?`, `suggestions?`, `attachments?`, `classNames?`, `slots?`.
- **MessageList** — transcript only. Use when you need the input bar somewhere
  else. Accepts `toolRenderers` and `showCopyToolbar`.
- **UserMessage / ErrorMessage / Markdown** — low-level message pieces.
  `Markdown` streams safely (external links get `rel="noreferrer"` by default).

### Input

- **InputBar** — composer. Props: `status`, `onSend({ content })`, `onStop`,
  `value?` + `onChange?` (controlled), `attachedImages`/`attachedFiles` with
  their remove handlers, `leftActions`/`rightActions` slots, `suggestions?`,
  `questionBar?`, `infoBar?`.
- **Suggestions** — quick-prompt chips for the empty state or inline.
- **ModelPicker / ModeSelector** — designed to drop into `leftActions`. Both
  accept a simple `{ id, name, version? }` / `{ id, label, icon?, description? }`
  shape. Do not import `CLAUDE_MODELS` — it was removed; supply your own array.
- **SendButton / AttachmentButton / FileAttachment** — usable standalone if
  you're building a custom composer.

### Tool cards

All tool cards accept a `part` prop of type
`Extract<UIMessage["parts"][number], { type: \`tool-<Name>\` }>` from the AI
SDK. Register them via `toolRenderers` on `AgentChat`/`MessageList`:

```tsx
<AgentChat
  toolRenderers={{
    Bash: BashTool,
    Edit: EditTool,
    Write: EditTool,      // Write reuses EditTool
    Search: SearchTool,
    WebSearch: SearchTool,
    TodoWrite: TodoTool,
    PlanWrite: PlanTool,
    Task: SubagentTool,
    Thinking: ThinkingTool,
  }}
/>
```

Cards available:

- **BashTool** — command + stdout, collapsible.
- **EditTool** — diff card. Supports `input.old_string`/`input.new_string` or
  `output.structuredPatch`, plus an approval footer via `input.approval`.
- **SearchTool** — grouped search results. Pass `results` or use `output.results`.
- **TodoTool** — diffed todo list from `input.todos` vs `output.oldTodos`.
- **PlanTool** — plan title + summary with approve/reject footer.
- **ToolGroup** — collapses consecutive tool calls into one row.
- **SubagentTool** — sub-agent task with nested tools.
- **McpTool** — generic MCP tool output; use `parseMcpToolType` from
  `@/components/agent-elements/tools/tool-registry` to get `mcpInfo`.
- **ThinkingTool** — collapsible reasoning row.
- **GenericTool** — fallback for unknown tools.
- **QuestionTool** — clarifying question with single/multi/text answer kinds.

### Streaming states

- **TextShimmer** — shimmering status label.
- **SpiralLoader** — Lottie spiral; use for multi-second loading states.

## Composition patterns

### Full chat with tool rendering (most common)

```tsx
"use client";

import { AgentChat } from "@/components/agent-elements/agent-chat";
import { BashTool } from "@/components/agent-elements/tools/bash-tool";
import { EditTool } from "@/components/agent-elements/tools/edit-tool";
import { SearchTool } from "@/components/agent-elements/tools/search-tool";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, status, sendMessage, stop } = useChat();
  return (
    <AgentChat
      messages={messages}
      status={status}
      onSend={({ content }) => sendMessage({ text: content })}
      onStop={stop}
      toolRenderers={{
        Bash: BashTool,
        Edit: EditTool,
        Write: EditTool,
        Search: SearchTool,
      }}
    />
  );
}
```

### Composer with mode + model pickers

```tsx
import { InputBar } from "@/components/agent-elements/input-bar";
import { ModeSelector } from "@/components/agent-elements/input/mode-selector";
import { ModelPicker } from "@/components/agent-elements/input/model-picker";
import { IconBulb, IconCursor } from "@tabler/icons-react";

const modes = [
  { id: "agent", label: "Agent", icon: IconCursor },
  { id: "plan", label: "Plan", icon: IconBulb },
];
const models = [
  { id: "sonnet", name: "Sonnet", version: "4.6" },
  { id: "opus", name: "Opus", version: "4.7" },
];

<InputBar
  status="ready"
  onSend={handleSend}
  onStop={handleStop}
  leftActions={
    <>
      <ModeSelector modes={modes} defaultValue="agent" />
      <ModelPicker models={models} defaultValue="sonnet" />
    </>
  }
/>
```

### Custom tool renderer

`toolRenderers` values are React components that receive `{ part, chatStatus }`.
Return whatever UI you want; reuse `GenericTool` as a fallback shell.

## Theming

Agent Elements reads these Tailwind CSS vars (shadcn-style). Do not remove or
rename them in the consumer theme:

- `--an-foreground`, `--an-background`, `--an-primary-color`
- Standard shadcn tokens: `--background`, `--foreground`, `--border`,
  `--muted`, `--muted-foreground`, `--accent`, `--primary`, etc.

Customising a component is just editing the installed file. Prefer that over
wrapping — the code is yours now.

## When NOT to use Agent Elements

- Projects using `assistant-ui`, `ai-elements`, `copilotkit`, or another kit —
  don't mix.
- Pure chat UIs that never render tool calls or plans — `InputBar` + your own
  message rendering may be enough; skip `AgentChat`.
- React < 19 or Tailwind < v4 — the components depend on both.

## Quick answers for common asks

- **"Add Agent Elements to this project"** → run `npx shadcn@latest init` if
  `components.json` is missing, then
  `npx shadcn@latest add https://agent-elements.21st.dev/r/agent-chat.json`.
- **"Switch the default SendButton look"** → edit
  `components/agent-elements/input/send-button.tsx` directly. Tokens live on
  `--an-*` CSS vars.
- **"Render a custom tool"** → map its type in `toolRenderers`; fall back to
  `GenericTool` for unknown tools.
- **"Use with useChat"** → pass `messages` and `status` straight through,
  translate `sendMessage`/`stop` to `onSend({ content })`/`onStop`.

## Registry reference

- Index: `https://agent-elements.21st.dev/r/index.json`
- Per-component: `https://agent-elements.21st.dev/r/<id>.json`
- Full docs in one file:
  `https://agent-elements.21st.dev/llms-full.txt`
