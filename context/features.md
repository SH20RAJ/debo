# Features Spec

## 1. Journals

### Text Journals
- Rich text editor using Plate.js (primary) and Tiptap (alternative)
- AI-powered commands: generate, edit, comment, choose tool, edit table
- Tags for categorization
- Auto-save to Postgres
- Semantic indexing to Qdrant after save
- Memory and character extraction after save

### Audio Journals
- Browser-based audio recording via MediaRecorder API
- Upload to Google Drive (organized: `Debo/Audio Journals/YYYY-MM/`)
- Auto-generated title from description or date fallback
- Transcript storage
- Duration tracking
- Public sharing via Drive permissions

### Video Journals
- Browser-based video recording
- Upload to Google Drive (organized: `Debo/Video Journals/YYYY-MM/`)
- Thumbnail generation
- Same metadata as audio journals

### Journal Pages
- `/dashboard/journals` - Grid view of all journals
- `/dashboard/journal/[id]` - Journal detail (dispatches by type)
- `/dashboard/journal/text/[id]` - Text journal view
- `/dashboard/journal/audio/[id]` - Audio journal player
- `/dashboard/journal/video/[id]` - Video journal player

---

## 2. Memory Engine

### Extraction
- Runs after journal save and during chat
- Extracts: facts, entities, emotions, topics
- Uses LLM with structured prompts (`src/lib/memory/extract.ts`)

### Storage
- **Local**: memory_node, memory_edge, memory_fact, memory_entity tables
- **Remote**: Mem0 API for additional memory persistence

### Retrieval
- Query by semantic similarity
- Used in chat context injection
- Editable via `/dashboard/memories`

### Management
- `/dashboard/memories` - Memory manager UI
- View, edit, delete memories
- Grouped by type (fact, entity, emotion, topic)

---

## 3. Character Graph

### Extraction
- Automatically finds people mentioned in journals and chat
- Creates profiles with name, aliases, relationship, summary
- Deduplicates by normalized name
- Tracks mention count and confidence

### Storage
- `characterProfile` table for person data
- `characterReference` table for source links
- Each reference stores excerpt, source type, source ID

### Management
- `/dashboard/characters` - CharactersManager component
- View all characters with search/filter
- Edit profile details (name, relationship, summary, avatar)
- View source references

### Source Types
- `chat` - Mentioned in chat
- `text_journal` - Mentioned in text journal
- `audio_journal` - Mentioned in audio transcript
- `video_journal` - Mentioned in video transcript
- `manual` - Manually created

---

## 4. Chat

### Interface
- `/dashboard/chat` - Main chat page
- Uses assistant-ui/react for chat UI
- Supports markdown rendering

### Features
- Memory retrieval before response
- Citation of journal sources
- Auto-saves important user facts to memory
- Extracts character mentions on important turns
- Thread management (create, list, switch)

### API
- `POST /api/chat` - Send message, get streamed response
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/threads` - List chat threads
- `POST /api/chat/import` - Import chat data

---

## 5. Talk (Voice Mode)

### Architecture
- LiveKit for WebRTC room transport
- Deepgram for STT (speech-to-text)
- Cartesia for TTS (text-to-speech)
- NVIDIA-compatible LLM for responses

### Flow
1. User clicks Talk → LiveKit room created
2. Audio streamed to Deepgram for transcription
3. Text sent to LLM with memory context
4. Response streamed to Cartesia for audio
5. Audio played back to user

### Files
- `src/workers/voice-agent.ts` - LiveKit agent worker
- `src/app/(chat)/talk/page.tsx` - Talk UI
- `src/app/api/livekit/token/route.ts` - Token generation
- `src/components/dashboard/experimental/agent/voice-agent-client.tsx` - Client

---

## 6. Capture

### Interface
- `/dashboard/capture` - Distraction-free recording surface
- Audio and video mode toggle
- Description field for auto-title generation

### Flow
1. User selects audio/video mode
2. Records via browser MediaRecorder
3. Saves to Google Drive (organized folder structure)
4. Generates title from description or date
5. Saves journal entry to database

### Components
- `src/components/dashboard/capture/capture-studio.tsx` - Main capture UI

---

## 7. Search

### Implementation
- Semantic search via Qdrant vector embeddings
- Postgres text search as fallback
- Searches across all journal types

### Files
- `src/lib/vector/search.ts` - Vector search logic
- `src/lib/vector/qdrant.ts` - Qdrant client
- `src/actions/search.ts` - Search server action

---

## 8. Connectors

### Supported
- Slack, Discord, Notion, Linear, Gmail, Calendar, Custom

### Features
- OAuth/API key connection via Composio
- Event ingestion (messages, mentions, files)
- Auto-journal creation from events
- Sync status tracking

### Pages
- `/dashboard/connectors` - Connector management UI

### API
- `GET/POST /api/connectors` - List/create connectors
- `GET/DELETE /api/connectors/[id]` - Get/delete connector
- `POST /api/connectors/[id]/sync` - Trigger sync

---

## 9. Editor

### Rich Text Editor
- Plate.js 53 (primary editor framework)
- Tiptap 3 (alternative/legacy)
- Extensions: code blocks, tables, lists, images, links, mentions, math, emoji, etc.

### AI Commands
- Generate content
- Edit/rewrite selection
- Add comments
- Edit tables
- Choose appropriate tool

### Page
- `/editor` - Standalone editor page

---

## 10. Settings

### AI Provider Configuration
- Add/manage multiple AI providers
- Set active provider
- API keys stored encrypted
- Supports OpenAI, Anthropic, Ollama, custom endpoints

### Page
- `/dashboard/settings` - Settings form with provider cards

---

## 11. MCP (Model Context Protocol)

### Server
- Debo exposes its own MCP server
- Tools available to external agents

### Client
- Connect external MCP servers
- Manage MCP connections

### Pages
- `/dashboard/mcp` - MCP manager UI

### API
- `GET/POST /api/mcp` - MCP endpoint
- `POST /api/mcp/messages` - MCP messages
