# Pages & Routes

## Marketing (`(marketing)/`)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing page | Hero, features, CTA |
| `/foundation` | Foundation | Company info |
| `/pitch` | Pitch | Investor pitch |
| `/privacy` | Privacy Policy | Legal |
| `/terms` | Terms of Service | Legal |

## Auth (`(auth)/`)

| Route | Page | Description |
|-------|------|-------------|
| `/join` | Login/Signup | Stack Auth login/signup |

## Dashboard (`(dashboard)/dashboard/`)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Overview | Dashboard home |
| `/dashboard/chat` | Chat | AI chat interface |
| `/dashboard/capture` | Capture | Audio/video recording |
| `/dashboard/journals` | Journals | All journals grid |
| `/dashboard/journal/[id]` | Journal Detail | View journal (dispatches by type) |
| `/dashboard/journal/text/[id]` | Text Journal | Rich text journal view |
| `/dashboard/journal/audio/[id]` | Audio Journal | Audio player view |
| `/dashboard/journal/video/[id]` | Video Journal | Video player view |
| `/dashboard/characters` | Characters | Character graph manager |
| `/dashboard/memories` | Memories | Memory manager |
| `/dashboard/insights` | Insights | Life insights & patterns |
| `/dashboard/talk` | Talk | Voice mode (LiveKit) |
| `/dashboard/connectors` | Connectors | Integration management |
| `/dashboard/mcp` | MCP | MCP server management |
| `/dashboard/settings` | Settings | AI providers & preferences |

## Standalone

| Route | Page | Description |
|-------|------|-------------|
| `/editor` | Editor | Standalone rich text editor |

## Chat (`(chat)/`)

| Route | Page | Description |
|-------|------|-------------|
| `/talk` | Talk | Voice interface (alternative route) |

## API Routes (`api/`)

See `api.md` for full API documentation.
