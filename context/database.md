# Database Schema

**ORM**: Drizzle ORM with PostgreSQL (Neon Serverless)
**Config**: `drizzle.config.ts` → migrations in `src/db/migrations/`
**Schema**: `src/db/schema.ts`

## Tables

### Auth Tables

#### `user`
| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| name | text | not null |
| email | text | unique, not null |
| emailVerified | boolean | not null |
| image | text | nullable |
| createdAt | timestamp | not null |
| updatedAt | timestamp | not null |

#### `session`
| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| expiresAt | timestamp | not null |
| token | text | unique, not null |
| userId | text | FK → user |
| ipAddress | text | nullable |
| userAgent | text | nullable |

#### `account`
OAuth accounts linked to users. Contains access/refresh tokens.

#### `verification`
Email/password verification tokens.

### Content Tables

#### `journal` (text journals)
| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| userId | text | FK → user |
| title | text | nullable |
| content | text | not null |
| tags | text[] | default '{}' |
| createdAt | timestamp | default now |
| updatedAt | timestamp | default now |

#### `videoJournal`
| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| userId | text | FK → user |
| title | text | not null |
| driveFileId | text | Google Drive file ID |
| driveWebUrl | text | nullable |
| thumbnailUrl | text | nullable |
| duration | integer | seconds |
| transcript | text | nullable |
| folderId | text | Google Drive folder ID |

#### `audioJournal`
Same structure as videoJournal.

### Memory Tables

#### `memoryNode`
Graph nodes representing concepts, entities, emotions.
- Unique on (userId, type, normalizedName)
- Tracks firstSeenAt, lastSeenAt, weight

#### `memoryEdge`
Graph edges connecting memory nodes.
- Unique on (userId, fromKey, toKey, relation)
- Tracks weight, lastSeenAt

#### `memoryFact`
Discrete facts extracted from context.
- Unique on (userId, type, content)

#### `memoryEntity`
Named entities (people, places, orgs).
- Unique on (userId, type, normalizedName)
- Tracks frequency

### Character Graph

#### `characterProfile`
| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| userId | text | FK → user |
| displayName | text | not null |
| normalizedName | text | not null, unique per user |
| customId | text | nullable, unique per user |
| avatarUrl | text | nullable |
| aliases | text[] | default '{}' |
| relationship | text | nullable |
| summary | text | nullable |
| context | text | nullable |
| source | text | default 'manual' |
| confidence | integer | default 1 |
| mentionCount | integer | default 0 |
| firstSeenAt / lastSeenAt | timestamp | nullable |

#### `characterReference`
Links characters to source content (journals, chat, etc.).
- Unique on (userId, characterId, sourceType, sourceId)

### Integration Tables

#### `connector`
External service connections (Slack, Discord, etc.).
- Types: slack, discord, notion, linear, gmail, calendar, custom
- Tracks syncStatus, lastSyncAt

#### `connectorEvent`
Incoming events from connectors.
- Types: message, mention, file, reaction, webhook
- Can link to auto-created journal via journalId

#### `googleDriveCredential`
Per-user Google Drive OAuth credentials.

### Settings Tables

#### `userPreference`
User API keys and active provider settings.

#### `aiProvider`
User-configured AI providers (encrypted API keys).

### Chat Tables

#### `chat`
Chat sessions with titles.

#### `message`
Chat messages with role (user/assistant/system/tool) and JSON content.

## Indexes

All tables have userId indexes. Key composite unique indexes enforce data integrity (e.g., memory uniqueness per user).
