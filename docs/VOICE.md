# 🎙️ Voice Agent Architecture: LiveKit Integration

Debo leverages **LiveKit** as the core infrastructure for all real-time voice, video, and multimodal interactions. By using LiveKit, we achieve a sub-100ms latency experience, making the AI companion feel truly conversational and "alive."

## 🚀 Why LiveKit?

1.  **Ultra-Low Latency**: Built on WebRTC, LiveKit eliminates the lag typically found in turn-based chat APIs. Audio is streamed bidirectionally in real-time.
2.  **Multimodal Pipeline**: LiveKit Agents coordinate the entire pipeline:
    - **VAD (Voice Activity Detection)**: Instantly detects when the user starts/stops speaking.
    - **STT (Speech-to-Text)**: Deepgram/OpenAI Whisper integration for near-instant transcription.
    - **LLM (Reasoning)**: OpenAI/Anthropic models process the query with tool-calling capabilities.
    - **TTS (Text-to-Speech)**: Cartesia/ElevenLabs for emotive, human-like voice synthesis.
3.  **Open Source & Scalable**: LiveKit is open-source, allowing us to maintain data sovereignty while scaling to thousands of concurrent "rooms."

## 🛠️ Implementation Strategy

### 1. The Voice Agent Worker
We will deploy a dedicated **LiveKit Agent** (Node.js) that joins a LiveKit room whenever a user initiates a voice session.
- **Context Injection**: The agent will automatically query the user's memories and `Vectorize` journal entries to provide personalized responses.
- **Tool Access**: The agent has full access to the **Nango Connectors** (Google Calendar, Notion) to act as a hands-free assistant.

### 2. Frontend Integration
The dashboard will feature a `VoiceCompanion` interface built with `@livekit/components-react`.
- **Visualizers**: Real-time waveform visualizers for both user and AI audio.
- **Token Management**: Next.js Server Actions will securely generate LiveKit access tokens using the `livekit-server-sdk`.

### 3. Telephony (SIP)
Using **LiveKit SIP**, we will provision a dedicated phone number. Users can call this number to:
- "Brain dump" their thoughts while driving or walking.
- Ask questions about their past journal entries over a standard phone call.

## 📈 Roadmap

- [ ] **Infrastructure**: Provision LiveKit Cloud/Self-hosted server.
- [ ] **Agent Worker**: Implement the `VoicePipelineAgent` with STT/LLM/TTS.
- [ ] **Context Linking**: Connect the agent to NeonDB and Vectorize.
- [ ] **Dashboard UI**: Build the real-time audio interface.
- [ ] **Telephony**: Configure SIP trunking for inbound phone calls.
