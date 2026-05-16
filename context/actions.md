# Server Actions

All server actions are in `src/actions/` and use Next.js Server Actions.

## `auth-sync.ts`
- `resolveUserId()` - Resolves current user ID from session
- Handles Stack Auth session validation

## `chat.ts`
- Chat-related server actions
- Message sending, history retrieval

## `composio.ts`
- `getComposioActiveApps()` - Lists active Composio integrations
- Composio client initialization

## `connectors.ts`
- CRUD operations for connectors
- Sync trigger logic

## `journals.ts`
- `saveTextJournal()` - Save/update text journal
- `getTextJournals()` - List text journals
- `getTextJournal()` - Get single journal
- `deleteTextJournal()` - Delete journal
- Handles memory extraction and character graph updates after save

## `media-journals.ts`
- `uploadMediaToDrive()` - Upload audio/video to Google Drive
- `saveAudioJournal()` / `saveVideoJournal()` - Save journal metadata
- `getAudioJournals()` / `getVideoJournals()` - List media journals
- `generateCaptureTitle()` - Generate title from description
- Google Drive folder management (Debo/Audio Journals/YYYY-MM/)
- Drive permission management (public access for embeds)

## `mcp.ts`
- MCP server management actions

## `memories.ts`
- Memory CRUD operations
- Memory query for chat context injection

## `search.ts`
- `searchJournals()` - Semantic + text search across journals

## `settings.ts`
- User preference management
- AI provider CRUD
- Active provider selection

## `mcp/` (directory)
- MCP-specific action implementations
