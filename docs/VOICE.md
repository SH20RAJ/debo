# Project Jarvis: Ambient Voice Intelligence (LiveKit)

Debo leverages **LiveKit** to power "Project Jarvis"—a real-time, zero-latency ambient voice intelligence. By using LiveKit's multimodal pipeline, we create an AI companion that doesn't just listen, but understands emotion, context, and the subtle nuances of your life through a sub-100ms conversational loop.

## Why LiveKit?

1.  **Ultra-Low Latency**: Built on WebRTC, LiveKit eliminates the lag typically found in turn-based chat APIs. Audio is streamed bidirectionally in real-time.
2.  **Multimodal Pipeline**: LiveKit Agents coordinate the entire pipeline:
    - **VAD (Voice Activity Detection)**: Instantly detects when the user starts/stops speaking.
    - **STT (Speech-to-Text)**: Deepgram/OpenAI Whisper integration for near-instant transcription.
    - **LLM (Reasoning)**: OpenAI/Anthropic models process the query with tool-calling capabilities.
    - **TTS (Text-to-Speech)**: Cartesia/ElevenLabs for emotive, human-like voice synthesis.
3.  **Open Source & Scalable**: LiveKit is open-source, allowing us to maintain data sovereignty while scaling to thousands of concurrent "rooms."

## Implementation Strategy

### 1. The Voice Agent Worker
We will deploy a dedicated **LiveKit Agent** (Node.js) that joins a LiveKit room whenever a user initiates a voice session.
- **Context Injection**: The agent queries the user's memories, Qdrant journal index, recent chat context, and authorized connector context before answering.
- **Tool Access**: The agent receives a safe tool surface for calendar, notes, tasks, email, and other connected accounts. Write actions should be previewed or confirmed before execution.
- **Capture Events**: Voice sessions can become audio journals. Transcripts are saved, indexed, and passed through the memory extraction workflow.

### 2. Frontend Integration
The dashboard will feature a `VoiceCompanion` interface built with `@livekit/components-react`.
- **Visualizers**: Real-time waveform visualizers for both user and AI audio.
- **Token Management**: Next.js Server Actions will securely generate LiveKit access tokens using the `livekit-server-sdk`.

### 3. Telephony (SIP)
Using **LiveKit SIP**, we will provision a dedicated phone number. Users can call this number to:
- "Brain dump" their thoughts while driving or walking.
- Ask questions about their past journal entries over a standard phone call.

### 4. Multimodal Capture
Voice is only the first ambient input. The same orchestration path should support:

- audio uploads,
- video journaling and private vlog transcripts,
- image uploads for diary pages, handwritten notes, whiteboards, and receipts,
- task extraction from spoken or scanned context.

Example: while recording a private vlog, the user says, "make me remember that I have to attend the product review today at 5." Debo extracts the task, prepares a calendar event through the authorized connector, and asks before saving it.

## Roadmap

- [ ] **Infrastructure**: Provision LiveKit Cloud/Self-hosted server.
- [ ] **Agent Worker**: Implement the `VoicePipelineAgent` with STT/LLM/TTS.
- [ ] **Context Linking**: Connect the agent to Neon Postgres, Qdrant, memories, and thread history.
- [ ] **Dashboard UI**: Build the real-time audio interface.
- [ ] **Connector Tools**: Expose approved calendar, notes, tasks, and email actions to the voice agent.
- [ ] **Audio/Video Journaling**: Store recordings, transcribe them, and extract memory.
- [ ] **Image Journaling**: OCR diary pages and image uploads into journal context.
- [ ] **Telephony**: Configure SIP trunking for inbound phone calls.
