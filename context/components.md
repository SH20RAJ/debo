# Component Structure

## Layout Components

### Root Layout (`src/app/layout.tsx`)
- StackProvider + StackTheme for auth
- ThemeProvider (next-themes, default: light)
- TooltipProvider
- StackEventTrackerGuard
- Toaster (sonner)
- Fonts: Nunito + Nunito Sans (Google Fonts)

### Dashboard Layout (`src/app/(dashboard)/dashboard/layout.tsx`)
- SidebarProvider with AppSidebar
- Header with search, notifications, "New Entry" button
- Auth guard (redirects to /join if not logged in)
- Production preview mode shows LaunchPreview

### Marketing Layout (`src/app/(marketing)/layout.tsx`)
- Landing page layout

### Auth Layout (`src/app/(auth)/layout.tsx`)
- Login/signup layout

---

## Dashboard Components (`src/components/dashboard/`)

### `app-sidebar.tsx`
- Main navigation sidebar
- Links to all dashboard sections

### `dashboard-search.tsx`
- Global search bar in header

### `capture/capture-studio.tsx`
- Audio/video recording interface
- Mode toggle, description input, save flow

### `connectors/connectors-list.tsx`
- List of connected services
- Add/manage connectors

### `journal/journal-editor.tsx`
- Rich text journal editor (Plate.js)

### `journal/journal-list-manager.tsx`
- Journal list with filtering/sorting

### `journal/journals-grid.tsx`
- Grid view of journal cards

### `journal/related-journals.tsx`
- Shows related journals based on content

### `life/insights-hero.tsx`
- Insights overview hero section

### `life/life-timeline.tsx`
- Timeline view of life events

### `life/pattern-list.tsx`
- Detected patterns in user data

### `mcp/mcp-manager.tsx`
- MCP server connection management

### `memories/memory-manager.tsx`
- Memory CRUD interface
- View/edit/delete memories by type

### `settings/provider-card.tsx`
- AI provider configuration card

### `settings/settings-form.tsx`
- User settings form

---

## Editor Components (`src/components/editor/`)
- Plate.js editor setup
- AI command integration
- Toolbar and formatting

---

## Journal Components (`src/components/journal/`)
- Journal-specific UI components

---

## Landing Components (`src/components/landing/`)
- Hero section
- Feature sections
- Pricing/CTA
- LaunchPreview (production preview gate)

---

## UI Components (`src/components/ui/`)
Shared primitives from shadcn/ui:
- Button, Input, Card, Dialog, Sheet, Sidebar
- Tooltip, Popover, Command, Tabs
- Form, Label, Select, Textarea
- Avatar, Badge, Separator, Skeleton
- Sonner (toast), Carousel, Resizable panels

---

## Auth Components (`src/components/auth/`)
- Stack Auth integration components

---

## Chat Components (`src/components/chat/`)
- Chat UI using assistant-ui/react
- Message rendering with markdown

---

## Tool UI Components (`src/components/tool-ui/`)
- Custom tool result renderers for AI tools
