# Debo - Project Overview

**Debo** is a private AI memory system for your life. It captures personal context from journals, voice notes, chats, and people, converts it into structured memory, and lets the user ask, talk, search, and act with that context.

## What Debo Does

- **Journaling**: Text, audio, and video journals with rich editing (Plate.js / Tiptap)
- **Memory Engine**: Extracts facts, entities, emotions, and topics from all context sources
- **Character Graph**: Automatically discovers and tracks people mentioned across journals and chat
- **Chat**: Conversational AI interface with memory retrieval and citation
- **Talk**: Realtime voice mode via LiveKit (Deepgram STT + NVIDIA LLM + Cartesia TTS)
- **Capture**: Distraction-free audio/video recording with Google Drive upload
- **Search**: Semantic vector search over journals with Postgres fallback
- **Connectors**: Integrates with external services (Slack, Discord, etc.) via Composio MCP
- **Editor**: Rich text editor for journaling with AI commands

## Tagline

"Private AI Memory for Your Life"

## URL

- Production: `https://debo.app`
- Local dev: `http://localhost:3000`

## Key Principles

- Keep main surfaces calm and focused
- Make memory visible and editable
- Prefer source-backed context over mysterious AI guesses
- Add momentum through useful review loops, not manipulative engagement tricks
