You are building a new Debo feature called “Debo Mail”.

Read the current codebase, frontend.md, and backend.md first. Then implement Debo Mail in the most efficient, clean, and scalable way possible.

Feature idea:
Debo users get a public-looking identity like:

username@debo.life

But this is NOT normal email.

Important:
- External people cannot send emails to this address using Gmail/Outlook/etc.
- Do not build SMTP, MX records, or real email receiving.
- Debo Mail is internal Debo-to-Debo messaging only.
- It should feel like email, but technically work like internal messages.
- It is mainly for identity, community, showoff, and Debo-native communication.
- Only verified Debo users can send Debo Mail to other Debo users.

Product positioning:
“Your private Debo identity and internal memory-aware inbox.”

Add a new main app tab:

/mail

Sidebar label:

Debo Mail

Core UX:
- User sees their Debo address: username@debo.life
- User can copy it
- User can set/change username if available
- User can receive Debo Mail from other Debo users
- User can send Debo Mail to username@debo.life
- Messages look like premium minimal email threads
- Debo can optionally save selected messages into memory
- User can choose “Remember this mail” or “Do not remember”
- Important Debo Mail can become sources in the memory system

Do not overbuild. Create the clean MVP first.

Frontend requirements:

Create route:

/mail

Mail page should include:
- Inbox
- Sent
- Drafts maybe mocked
- Archived maybe mocked
- Compose button
- Search bar
- Thread list
- Thread detail panel
- Empty states
- Copy Debo address card

Desktop layout:
left: folders
middle: message/thread list
right: selected conversation

Mobile layout:
folder list → thread list → thread detail as separate views

Mail folders:
- Inbox
- Sent
- Starred
- Archived
- Drafts
- Memory Saved

Mail card should show:
- sender name
- sender Debo address
- subject
- preview
- date
- unread status
- memory saved badge if saved
- source-backed badge if converted to memory

Compose modal:
Fields:
- To: username@debo.life
- Subject
- Message body
- Attach memory/source optional placeholder
- Send button

Composer validation:
- recipient must end with @debo.life
- recipient must exist as Debo user
- cannot send to external emails
- show clear error:
  “Debo Mail only works between Debo users.”

Add premium copy:
- “Your Debo address”
- “Internal mail for your trusted memory network”
- “Only Debo users can message this address”
- “External email delivery is not supported”

Backend requirements:

Add database tables if missing:

debo_mail_addresses
- id
- user_id
- workspace_id
- username
- address
- is_primary
- created_at
- updated_at

debo_mail_threads
- id
- workspace_id
- subject
- created_by_user_id
- last_message_at
- created_at
- updated_at

debo_mail_messages
- id
- thread_id
- sender_user_id
- sender_address
- recipient_user_id
- recipient_address
- subject
- body
- status: sent | delivered | read | archived | deleted
- is_memory_saved
- source_id nullable
- created_at
- read_at
- deleted_at

debo_mail_participants
- id
- thread_id
- user_id
- address
- role: sender | recipient
- archived_at
- deleted_at
- last_read_at

Optional later:
debo_mail_attachments
- id
- message_id
- source_id nullable
- r2_key nullable
- filename
- mime_type
- created_at

API endpoints:

GET /mail/address
POST /mail/address/check
POST /mail/address/claim

GET /mail/threads
GET /mail/threads/:threadId
POST /mail/send
POST /mail/threads/:threadId/read
POST /mail/threads/:threadId/archive
DELETE /mail/threads/:threadId

POST /mail/messages/:messageId/save-to-memory

Rules:
- Only authenticated Debo users can send.
- Sender address must belong to current user.
- Recipient must be an existing Debo Mail address.
- No external email delivery.
- No SMTP.
- No MX.
- No external forwarding in MVP.
- All queries must be scoped by user_id/workspace_id.
- A user can only view threads where they are a participant.
- Soft delete for user view, not global delete unless all participants delete.
- Save audit logs for sending, reading, deleting, and saving to memory.

Memory integration:
When user clicks “Save to memory”:
- Create a normal Debo source with type: debo_mail
- Source title = subject
- Source plain_text = message body + sender/recipient metadata
- Create source relation to message
- Run normal ingestion pipeline
- Mark message is_memory_saved = true
- Store source_id on message

Source type to add:
debo_mail

Memory behavior:
- Do not automatically save every mail to memory by default.
- User should manually save or enable a setting later.
- If manually saved, it becomes searchable in Ask Debo.
- Ask Debo can cite it like:
  “Debo Mail · from raj@debo.life · May 19”

Settings:
Add simple mail settings placeholder:
- Debo address
- Allow mail from:
  - anyone on Debo
  - people I follow/know only later
- Auto-save Debo Mail to memory: off by default

Username rules:
- lowercase letters, numbers, hyphen, underscore
- 3 to 30 characters
- no spaces
- no offensive/reserved usernames
- reserved:
  admin
  support
  root
  mail
  hello
  team
  founder
  shaswat maybe optional
  debo
  noreply
  privacy
  security

Frontend mock states:
- no address claimed yet
- address claimed
- empty inbox
- inbox with messages
- compose success
- invalid recipient
- message saved to memory

Add mocked examples:
- raj@debo.life sends: “Q4 budget follow-up”
- dev@debo.life sends: “Landing page revamp idea”
- shaswat@debo.life sends internal test mail

UI quality:
Make it feel like premium minimal email, not Gmail clone.
Use Debo design system.
Use soft cards, good spacing, clear badges, and source/memory actions.

Suggested folder structure:

apps/api/src/routes/mail.routes.ts

packages/db/schema/mail.schema.ts
packages/db/queries/mail.queries.ts

packages/domain/mail/
  mail-address.service.ts
  mail-thread.service.ts
  mail-message.service.ts
  mail-memory.service.ts
  mail-permissions.ts
  username-policy.ts

apps/web/src/app/mail/
  page.tsx

apps/web/src/components/mail/
  mail-shell.tsx
  mail-sidebar.tsx
  mail-address-card.tsx
  mail-thread-list.tsx
  mail-thread-card.tsx
  mail-thread-detail.tsx
  mail-compose-modal.tsx
  mail-empty-state.tsx

Implementation order:
1. Add DB schema/types.
2. Add backend services and route handlers.
3. Add frontend mock UI.
4. Connect frontend to API if backend exists.
5. Add save-to-memory flow.
6. Add settings/address claim UI.
7. Run typecheck/lint/build.
8. Fix all errors.

Keep it MVP and clean.
Do not build real email infrastructure.
Do not add SMTP.
Do not configure DNS.
Do not allow external email sending.
Do not allow public unauthenticated sending.

Commit style:
- feat(mail): add Debo Mail address model
- feat(mail): add internal message backend
- feat(mail): add Debo Mail inbox UI
- feat(mail): add compose and internal delivery flow
- feat(mail): add save mail to memory action

After implementation, summarize:
- what was built
- what is mocked
- what needs backend keys/config
- how Debo Mail works
- what is intentionally not supported