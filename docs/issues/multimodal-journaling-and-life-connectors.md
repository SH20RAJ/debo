# Build multimodal journaling and connector-aware Jarvis actions

## Summary

Add audio journaling, video journaling, and image journaling so users can capture life faster than typing. Debo should transcribe recordings, OCR diary pages/images, extract durable memories, and add the resulting text to AI context with citations.

## User Examples

- A user records a private vlog and says: "Make me remember that I have to attend the product review meeting today at 5."
- Debo transcribes the recording, extracts the meeting, checks connected calendar context, drafts a calendar event, and asks for approval before saving it.
- A user uploads handwritten diary pages. Debo OCRs them, stores the original images, creates journal text, and adds memories from the content.
- A user uploads an old voice memo. Debo turns it into a dated journal entry and makes it available in Ask/Chat.

## Scope

- Audio journal recording and upload.
- Video journal recording and upload.
- Image upload for diary pages, handwritten notes, and whiteboards.
- Transcription and OCR background workflows.
- Media attachment storage and source linking.
- Memory extraction from transcripts/OCR text.
- Calendar/task/note/email connector actions exposed to chat and LiveKit voice after user authorization.
- Onboarding and settings flows for connecting social accounts and productivity tools.
- Human approval before external write actions.

## Orchestration

Use Mastra workflows for deterministic heavy work:

- save capture immediately,
- enqueue transcription/OCR,
- extract tasks and durable memories,
- index transcript chunks,
- refresh the memory graph,
- draft connector actions,
- stream user-visible status quickly.

This keeps the app fast while the AI pipeline does real work in the background.

## Acceptance Criteria

- Users can create a journal from an audio/video/image input.
- Original media is linked to the generated journal text.
- Generated context appears in search, memory, timeline, and chat citations.
- LiveKit voice can call approved connector tools.
- Calendar writes are drafts/confirmations unless the user creates an explicit automation rule.
- Onboarding/settings clearly show connected accounts and scopes.
- The capture path returns quickly even when transcription/OCR is still running.
