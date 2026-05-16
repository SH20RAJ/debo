# API Routes

## AI Routes

### `POST /api/ai/command`
AI-powered editor commands (generate, edit, comment, etc.)

### `POST /api/ai/copilot`
AI copilot endpoint for inline suggestions

---

## Auth Routes

### `POST /api/auth/nango/session`
Nango integration session management

---

## Capture Routes

### `GET/PUT /api/capture/media/[...key]`
UploadThing file handling for captured media

---

## Chat Routes

### `POST /api/chat`
Send a message and receive streamed AI response.
- Injects memory context before responding
- Saves important facts to memory
- Extracts character mentions

### `GET /api/chat/history`
Retrieve chat history for a user/thread.

### `GET /api/chat/threads`
List all chat threads for the current user.

### `POST /api/chat/import`
Import external chat data.

---

## Connector Routes

### `GET /api/connectors`
List all connectors for the current user.

### `POST /api/connectors`
Create a new connector.

### `GET /api/connectors/[id]`
Get a specific connector.

### `DELETE /api/connectors/[id]`
Delete a connector.

### `POST /api/connectors/[id]/sync`
Trigger sync for a connector.

---

## LiveKit Routes

### `POST /api/livekit/token`
Generate a LiveKit access token for voice sessions.

---

## MCP Routes

### `GET/POST /api/mcp`
MCP server endpoint for external agents.

### `POST /api/mcp/messages`
Handle MCP protocol messages.

---

## Upload Routes

### `POST /api/uploadthing`
UploadThing API endpoint for file uploads.

---

## Webhook Routes

### `POST /api/webhooks/stack`
Stack Auth webhook handler for user events.

---

## Test Routes

### `GET /api/test`
Development test endpoint.
