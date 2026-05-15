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

, also you have used so much of hardcoded data like openai base url sync it with .env

shaswatraj@Sh debo % bun run voice
$ node --import tsx src/workers/voice-agent.ts dev
[21:13:48.365] INFO (98035): starting worker
    version: "1.4.0"
[21:13:48.399] INFO (98035): Server is listening on port 8081
[21:13:48.708] DEBUG (98035): connected to LiveKit server
    version: "1.4.0"
[21:13:48.783] INFO (98035): registered worker
    version: "1.4.0"
    id: "AW_qWmiYiqLusNR"
    server_info: {
      "edition": "Cloud",
      "version": "1.11.0",
      "protocol": 17,
      "region": "India South",
      "nodeId": "NC_OHYDERABAD1A_4DdxJ4GEic7k",
      "debugInfo": "",
      "agentProtocol": 0
    }
[21:13:53.808] INFO (98035): received job request
    version: "1.4.0"
    jobId: "AJ_naVqX2EjnJLN"
    resuming: false
    agentName: "debo-voice"
[21:13:56.315] DEBUG (98400): initializing job runner
[21:13:56.317] DEBUG (98400): job runner initialized
[21:13:56.322] DEBUG (98400): job started
    jobID: "AJ_naVqX2EjnJLN"
{"level":20,"time":1778859841325,"pid":98400,"hostname":"Sh.local","name":"lk-rtc","msg":"Connect callback received"}
[Debo Voice] Connected to room: debo-talk-1778859801171
[Debo Voice] settings unavailable: ENOTFOUND Error connecting to database: fetch failed
[Debo Voice] memories unavailable: ENOTFOUND Error connecting to database: fetch failed
[21:14:01.455] DEBUG (98400): connection state changed
    state: 1
[Debo Voice] Agent state: initializing -> thinking
[Debo Voice] Agent state: thinking -> listening
[Debo Voice] Session active for user: 7e0d6132-3baf-4363-9d6b-e1b4bdbb6bd4
[21:14:01.458] DEBUG (98400): Agent handoff inserted into chat context
    newAgentId: "debo-voice"
[21:14:01.461] DEBUG (98400): Task.runTask: task AgentActivity_onEnter started
[21:14:01.461] INFO (98400): Creating speech handle
    speech_id: "speech_7e7a6cdc-f6c"
[21:14:01.461] DEBUG (98400): Task.runTask: task AgentActivity.pipelineReply started
[21:14:01.462] DEBUG (98400): Task.runTask: task performLLMInference started
[21:14:01.469] DEBUG (98400): setting participant
    participantIdentity: "7e0d6132-3baf-4363-9d6b-e1b4bdbb6bd4"
[21:14:01.469] DEBUG (98400): setting participant audio input
    participant: "7e0d6132-3baf-4363-9d6b-e1b4bdbb6bd4"
[21:14:01.469] INFO (98400): participantValue.trackPublications
    participantValue: "7e0d6132-3baf-4363-9d6b-e1b4bdbb6bd4"
    trackPublications: [
      {
        "info": {
          "sid": "TR_AM8uH9ZjkY2rEk",
          "name": "",
          "kind": "KIND_AUDIO",
          "source": "SOURCE_MICROPHONE",
          "simulcasted": false,
          "width": 0,
          "height": 0,
          "mimeType": "audio/red",
          "muted": false,
          "remote": true,
          "encryptionType": "NONE",
          "audioFeatures": [
            "TF_AUTO_GAIN_CONTROL",
            "TF_ECHO_CANCELLATION",
            "TF_NOISE_SUPPRESSION"
          ]
        },
        "ffiHandle": {},
        "subscribed": true,
        "track": {
          "info": {
            "sid": "TR_AM8uH9ZjkY2rEk",
            "name": "",
            "kind": "KIND_AUDIO",
            "streamState": "STATE_ACTIVE",
            "muted": false,
            "remote": true
          },
          "ffi_handle": {}
        }
      }
    ]
    lengthOfTrackPublications: 1
[21:14:01.470] DEBUG (98400): onTrackSubscribed in _input
    participant: "7e0d6132-3baf-4363-9d6b-e1b4bdbb6bd4"
[21:14:01.472] DEBUG (98400): Task.runTask: task performTTSInference started
[21:14:01.473] DEBUG (98400): using audio io: `ParticipantAudioInputStream` -> `AgentSession` -> `SyncedAudioOutput`
[21:14:01.473] DEBUG (98400): using transcript io: `AgentSession` -> `SyncedTextOutput`
[21:14:01.474] DEBUG (98400): Using TTS aligned transcripts for transcription node input
[21:14:01.474] DEBUG (98400): Task.runTask: task performTextForwarding started
[21:14:01.474] DEBUG (98400): Task.runTask: task performAudioForwarding started
[21:14:01.474] DEBUG (98400): Task.runTask: task performToolExecutions started
[Debo Voice] Session error: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
[21:14:04.371] WARN (98400): failed to generate LLM completion, retrying in 0.1ms
    llm: "openai.LLM"
    attempt: 1
    error: {
      "type": "APIStatusError",
      "message": "400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!",
      "stack":
          APIStatusError: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
              at LLMStream.run (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/inference/llm.ts:488:15)
              at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
              at async import_telemetry.tracer.startActiveSpan.name (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:172:22)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
              at async LLMStream._mainTaskImpl (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:165:16)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
      "body": {
        "type": "Object",
        "message": "Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!",
        "stack":
            
        "param": null,
        "code": 400
      },
      "retryable": true,
      "name": "APIStatusError",
      "statusCode": 400,
      "requestId": null
    }
[Debo Voice] Session error: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
[21:14:04.779] WARN (98400): failed to generate LLM completion, retrying in 2000ms
    llm: "openai.LLM"
    attempt: 2
    error: {
      "type": "APIStatusError",
      "message": "400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!",
      "stack":
          APIStatusError: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
              at LLMStream.run (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/inference/llm.ts:488:15)
              at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
              at async import_telemetry.tracer.startActiveSpan.name (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:172:22)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
              at async LLMStream._mainTaskImpl (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:165:16)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
      "body": {
        "type": "Object",
        "message": "Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!",
        "stack":
            
        "param": null,
        "code": 400
      },
      "retryable": true,
      "name": "APIStatusError",
      "statusCode": 400,
      "requestId": null
    }
[Debo Voice] Session error: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
[21:14:07.008] WARN (98400): failed to generate LLM completion, retrying in 2000ms
    llm: "openai.LLM"
    attempt: 3
    error: {
      "type": "APIStatusError",
      "message": "400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!",
      "stack":
          APIStatusError: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
              at LLMStream.run (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/inference/llm.ts:488:15)
              at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
              at async import_telemetry.tracer.startActiveSpan.name (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:172:22)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
              at async LLMStream._mainTaskImpl (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:165:16)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
      "body": {
        "type": "Object",
        "message": "Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!",
        "stack":
            
        "param": null,
        "code": 400
      },
      "retryable": true,
      "name": "APIStatusError",
      "statusCode": 400,
      "requestId": null
    }
[Debo Voice] Session error: 400 Cannot put tools in the first user message when there's no first user message! Cannot put tools in the first user message when there's no first user message!
[21:14:09.529] DEBUG (98400): Task.runTask: task performToolExecutions done
[21:14:09.531] DEBUG (98400): Task.runTask: task performLLMInference done
[21:14:09.534] DEBUG (98400): Task.runTask: task performTextForwarding done
[21:14:09.534] DEBUG (98400): firstFrameFut cancelled before first frame
[21:14:09.534] DEBUG (98400): Task.runTask: task performAudioForwarding done
[21:14:09.534] DEBUG (98400): Task.runTask: task performTTSInference done
[21:14:09.534] DEBUG (98400): Task.runTask: task AgentActivity.pipelineReply done
[21:14:09.535] DEBUG (98400): Task.runTask: task AgentActivity_onEnter done
[21:14:09.535] DEBUG (98400): Unhandled promise rejection
    jobID: "AJ_naVqX2EjnJLN"
    error: {
      "type": "APIConnectionError",
      "message": "failed to generate LLM completion after 4 attempts",
      "stack":
          APIConnectionError: failed to generate LLM completion after 4 attempts
              at LLMStream._mainTaskImpl (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/llm/llm.ts:196:19)
              at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
              at async <anonymous> (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:115:16)
              at async DynamicTracer.startActiveSpan (/Users/shaswatraj/Desktop/debo/node_modules/@livekit/agents/src/telemetry/traces.ts:113:12)
      "body": null,
      "retryable": false,
      "name": "APIConnectionError"
    }
[21:14:09.792] ERROR (98400): Cartesia returned error
    error: "Invalid request: Your request could not be processed, make sure it contains valid JSON."
