# Debo - Personal Life Intelligence System

## Priority Features

### 1. UI/UX
- [ ] Use OpenUI for UI components
- [ ] Replace mascot image with custom design
- [ ] Add more interactive demo on landing

### 2. Connectors & Integrations
- [x] Slack connector (working)
- [x] Discord connector (working)
- [x] Notion connector (working)
- [x] GitHub connector (working)
- [x] Gmail connector (working)
- [x] Calendar connector (working)
- [x] Custom webhook connector (working)
- [ ] Telegram connector (pending)
- [ ] WhatsApp connector (pending)
- [ ] Linear connector (working)
- [ ] Trello connector (working)
- [ ] Asana connector (pending)
- [ ] Jira connector (pending)
- [ ] Google Drive connector (pending) - Store video/audio journals

### 8. Media Storage (Google Drive)
- [x] Google Drive OAuth2 integration via Nango
- [x] Create folder structure: /Debo/Videos/, /Debo/Audios/, /Debo/Transcripts/
- [ ] Upload video journals to Google Drive
- [ ] Upload audio journals to Google Drive
- [ ] Store metadata in database (file ID, Drive URL, thumbnail)
- [ ] Stream media directly from Drive

### 9. Database Restructure
- [x] Create `video_journals` table (id, userId, title, driveFileId, driveWebUrl, thumbnailUrl, duration, transcript, createdAt)
- [x] Create `audio_journals` table (id, userId, title, driveFileId, driveWebUrl, transcript, duration, createdAt)
- [x] Keep `journals` table for text-only entries
- [ ] Add sorting options on /dashboard (date, title, type)
- [ ] Add filter by content type (text/video/audio)

### 3. Chat Apps
- [x] /chat - Web chat with AI
- [x] /talk - Voice chat with LiveKit
- [ ] Dedicated assistant mobile app (pending)
- [ ] Telegram bot integration (pending)

### 4. Claude Integration
- [x] MCP server at /api/mcp (working)
- [x] 19 MCP tools available
- [ ] Claude Code connector (pending)

### 5. Memory System
- [x] PostgreSQL-based memory storage
- [x] Entity extraction from text
- [x] Fact storage with weight tracking
- [ ] Vector search for memories (pending)
- [ ] AI-powered extraction (pending)

### 6. Landing Page
- [x] Revamped Hero section
- [x] Updated CTA with social proof
- [x] Features section
- [ ] Add connector showcase
- [ ] Add Claude Code integration demo
- [ ] Add Telegram bot preview

### 7. Infrastructure
- [x] Qdrant for journal vector search (configured)
- [ ] Fix Qdrant vector size mismatch (4096 vs 1024)
- [x] Context7 MCP installed
- [ ] MemPalace integration (pending)

---

## Quick Links
- Dashboard: /dashboard
- Chat: /chat
- Talk (Voice): /talk
- Journals: /dashboard/journals
- Memories: /dashboard/memories
- MCP: /dashboard/mcp
- Connectors: /dashboard/connectors
- Settings: /dashboard/settings
- MCP API: /api/mcp

### 10. Memory System Improvements
- [ ] Improve memory system architecture
- [ ] Get and set memories while chatting
- [ ] Integrate mem0 for memory management
- [ ] Save important chat events to memories automatically

### 11. Chat Page Refinement
- [ ] Remove chat history from display
- [ ] Keep minimal UI with just chatbox
- [ ] Add inline citations when retrieving journal data
- [ ] Optimize chat performance

### 12. Talk (Voice) Page
- [ ] Delete existing /dashboard/talk implementation
- [ ] Recreate with LiveKit integration
- [ ] Optimize LiveKit usage
- [ ] Test context access and conversation quality
- [ ] Verify all APIs from .env are working

### 13. Dashboard Navigation & Search
- [ ] Delete /dashboard/timeline
- [ ] Fix navbar search functionality
- [ ] Implement semantic search for journals
- [ ] Test search across all content types

### 14. Settings Page
- [ ] Remove all existing settings
- [ ] Keep only AI tone control option
- [ ] Simplify UI/UX

### 15. Insights Page
- [ ] Improve backend logic for /dashboard/insights
- [ ] Optimize performance
- [ ] Better data visualization

### 16. Capture Page
- [ ] Delete and recreate /capture
- [ ] Clean, distraction-free UI/UX design
- [ ] Auto-generate titles after recording
- [ ] Analyze video/audio for description
- [ ] Fallback to date/day if analysis fails
- [ ] Support video/audio recording

### 17. Journal API Fixes
- [ ] Fix GET /dashboard/journal/{id}?type=text endpoint
- [ ] Setup AI analysis for journal text/id
- [ ] Optimize query performance
- [ ] Fix vector search parameters (nvidia/nv-embedqa-e5-v5)

### 18. Dependencies & Updates
- [ ] Upgrade composio-core from 0.9.1 to 0.10.0
- [ ] Fix asymmetric model 'input_type' parameter
- [ ] Enable semantic vectors

### 19. MCP System
- [ ] Optimize all system prompts in /mcp
- [ ] Verify all 19 tools are working correctly
- [ ] Test MCP API endpoints

### 20. Final Deployment
- [ ] Test all features end-to-end
- [ ] Verify context access in chat
- [ ] Run `bun run deploy`
- [ ] Git push all changes 

