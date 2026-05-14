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
- [x] Linear connector (working)
- [x] Trello connector (working)
- [ ] Asana connector (pending)
- [ ] Jira connector (pending)
- [x] Google Drive connector (working) - Store video/audio journals

### 8. Media Storage (Google Drive)
- [x] Google Drive OAuth2 integration via Nango
- [x] Create folder structure: /Debo/Videos/, /Debo/Audios/, /Debo/Transcripts/
- [x] Upload video journals to Google Drive
- [x] Upload audio journals to Google Drive
- [x] Store metadata in database (file ID, Drive URL, thumbnail)
- [x] Stream media directly from Drive

### 9. Database Restructure
- [x] Create `video_journals` table (id, userId, title, driveFileId, driveWebUrl, thumbnailUrl, duration, transcript, createdAt)
- [x] Create `audio_journals` table (id, userId, title, driveFileId, driveWebUrl, transcript, duration, createdAt)
- [x] Keep `journals` table for text-only entries
- [x] Add sorting options on /dashboard (date, title, type)
- [x] Add filter by content type (text/video/audio)

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
- [x] Fix Qdrant vector size mismatch (4096 vs 1024)
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
- [x] Improve memory system architecture
- [x] Get and set memories while chatting
- [x] Integrate mem0 for memory management
- [x] Save important chat events to memories automatically

### 11. Chat Page Refinement
- [x] Remove chat history from display
- [x] Keep minimal UI with just chatbox
- [x] Add inline citations when retrieving journal data
- [x] Optimize chat performance

### 12. Talk (Voice) Page
- [x] Delete existing /dashboard/talk implementation
- [x] Recreate with LiveKit integration
- [x] Optimize LiveKit usage
- [ ] Test context access and conversation quality
- [ ] Verify all APIs from .env are working

### 13. Dashboard Navigation & Search
- [x] Delete /dashboard/timeline
- [x] Fix navbar search functionality
- [x] Implement semantic search for journals
- [ ] Test search across all content types

### 14. Settings Page
- [x] Remove all existing settings
- [x] Keep only AI tone control option
- [x] Simplify UI/UX

### 15. Insights Page
- [x] Improve backend logic for /dashboard/insights
- [x] Optimize performance
- [x] Better data visualization

### 16. Capture Page
- [x] Delete and recreate /capture
- [x] Clean, distraction-free UI/UX design
- [x] Auto-generate titles after recording
- [ ] Analyze video/audio for description
- [x] Fallback to date/day if analysis fails
- [x] Support video/audio recording

### 17. Journal API Fixes
- [x] Fix GET /dashboard/journal/{id}?type=text endpoint
- [x] Setup AI analysis for journal text/id
- [x] Optimize query performance
- [x] Fix vector search parameters (nvidia/nv-embedqa-e5-v5)

### 18. Dependencies & Updates
- [x] Upgrade composio-core from 0.9.1 to 0.10.0
- [x] Fix asymmetric model 'input_type' parameter
- [x] Enable semantic vectors

### 19. MCP System
- [x] Optimize all system prompts in /mcp
- [ ] Verify all 19 tools are working correctly
- [ ] Test MCP API endpoints

### 20. Final Deployment
- [ ] Test all features end-to-end
- [x] Verify context access in chat
- [ ] Run `bun run deploy`
- [ ] Git push all changes 
