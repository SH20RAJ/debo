/**
 * Seed script for Debo database.
 *
 * Run:  bun run apps/api/src/scripts/seed.ts
 *   or: cd apps/api && bun run seed
 *
 * Loads DATABASE_URL from apps/api/.env.local, connects to Neon,
 * and inserts a realistic dev dataset covering 21 of 29 tables.
 */

import path from "node:path";
import { readFileSync } from "node:fs";
import { neon, neonConfig } from "@neondatabase/serverless";
import { nanoid } from "nanoid";

// ── load .env.local from apps/api ────────────────────────────────────────────
const envPath = path.resolve(__dirname, "../../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn("Could not load .env.local, relying on environment variables.");
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

// ── neon config (longer timeout for seeding) ─────────────────────────────────
neonConfig.fetchFunction = async (input: string | URL | globalThis.Request, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const upstreamSignal = init?.signal;
  if (upstreamSignal) {
    if (upstreamSignal.aborted) controller.abort();
    else upstreamSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

// ── connect ──────────────────────────────────────────────────────────────────
const sqlClient = neon(DATABASE_URL);

// ── stable IDs ───────────────────────────────────────────────────────────────
const USER_ID = "dev-user-001";
const WORKSPACE_ID = "ws-dev-001";
const now = () => new Date().toISOString();

function uid() {
  return nanoid(12);
}

// ── log helper ───────────────────────────────────────────────────────────────
let count = 0;
function log(table: string, id: string, label?: string) {
  count++;
  console.log(`  [${count}] ${table} ${id}${label ? " — " + label : ""}`);
}

// ── main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n=== Debo Seed Script ===\n");

  // ── 1. user ──────────────────────────────────────────────────────────────
  console.log(">> Creating dev user...");
  await sqlClient`
    INSERT INTO users (id, name, email, avatar_url, created_at, updated_at)
    VALUES (${USER_ID}, 'Shaswat Raj', 'dev@debo.life', 'https://avatars.githubusercontent.com/u/1', ${now()}, ${now()})
    ON CONFLICT (id) DO NOTHING
  `;
  log("users", USER_ID, "Shaswat Raj");

  // ── 2. workspace ────────────────────────────────────────────────────────
  console.log(">> Creating personal workspace...");
  await sqlClient`
    INSERT INTO workspaces (id, owner_user_id, name, type, created_at, updated_at)
    VALUES (${WORKSPACE_ID}, ${USER_ID}, 'Personal', 'personal', ${now()}, ${now()})
    ON CONFLICT (id) DO NOTHING
  `;
  log("workspaces", WORKSPACE_ID, "Personal");

  // workspace member
  const member_id = uid();
  await sqlClient`
    INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at)
    VALUES (${member_id}, ${WORKSPACE_ID}, ${USER_ID}, 'owner', ${now()})
    ON CONFLICT (workspace_id, user_id) DO NOTHING
  `;
  log("workspace_members", member_id, "owner");

  // ── 3. connector accounts ───────────────────────────────────────────────
  console.log(">> Creating connector accounts...");
  const connectors = [
    { id: uid(), provider: "gmail", status: "connected", extId: "user@gmail.com" },
    { id: uid(), provider: "google_calendar", status: "connected", extId: "user@gcal" },
    { id: uid(), provider: "notion", status: "disconnected", extId: null },
  ] as const;

  for (const c of connectors) {
    await sqlClient`
      INSERT INTO connector_accounts (id, user_id, workspace_id, provider, status, external_account_id, created_at, updated_at)
      VALUES (${c.id}, ${USER_ID}, ${WORKSPACE_ID}, ${c.provider}, ${c.status}, ${c.extId}, ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("connector_accounts", c.id, c.provider);
  }
  const gmailConn = connectors[0].id;

  // ── 4. people ───────────────────────────────────────────────────────────
  console.log(">> Creating people records...");
  const peopleData = [
    { id: uid(), name: "Raj", relationship: "colleague", company: "Acme Corp", role: "Marketing Lead", notes: "Works on Q4 budget planning. Board meeting contact." },
    { id: uid(), name: "Sarah", relationship: "client", company: "Acme Corp", role: "Engineering Manager", notes: "Wants API integration for their dashboard. 50-user pilot." },
    { id: uid(), name: "Alex", relationship: "colleague", company: "Debo", role: "Designer", notes: "Working on landing page redesign. Shares mockups on Fridays." },
    { id: uid(), name: "Priya", relationship: "investor", company: "Sequoia Scout", role: "Partner", notes: "Interested in private memory market. 100-user beta traction matters." },
    { id: uid(), name: "Marcus", relationship: "colleague", company: "Debo", role: "Content Lead", notes: "Drafting blog posts on memory OS and privacy-first AI." },
  ] as const;

  const peopleMap: Record<string, string> = {};
  for (const p of peopleData) {
    await sqlClient`
      INSERT INTO people (id, user_id, workspace_id, name, relationship, company, role, notes, last_mentioned_at, created_at, updated_at)
      VALUES (${p.id}, ${USER_ID}, ${WORKSPACE_ID}, ${p.name}, ${p.relationship}, ${p.company}, ${p.role}, ${p.notes}, ${now()}, ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    peopleMap[p.name] = p.id;
    log("people", p.id, p.name);
  }

  // ── 5. projects ─────────────────────────────────────────────────────────
  console.log(">> Creating projects...");
  const projectsData = [
    { id: uid(), name: "Debo", description: "Private memory operating system. Capture anything, ask your past, trust every answer.", color: "#58CC02" },
    { id: uid(), name: "Q4 Budget", description: "Marketing budget planning for Q4. Covers digital, events, and content allocations.", color: "#FF9600" },
    { id: uid(), name: "Landing Page Revamp", description: "Redesign of debo.life landing page with memory OS positioning, feature grid, and waitlist CTA.", color: "#CE82FF" },
  ] as const;

  const projectMap: Record<string, string> = {};
  for (const p of projectsData) {
    await sqlClient`
      INSERT INTO projects (id, user_id, workspace_id, name, description, status, color, created_at, updated_at)
      VALUES (${p.id}, ${USER_ID}, ${WORKSPACE_ID}, ${p.name}, ${p.description}, 'active', ${p.color}, ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    projectMap[p.name] = p.id;
    log("projects", p.id, p.name);
  }

  // ── 6. sources ──────────────────────────────────────────────────────────
  console.log(">> Creating sources...");

  interface SourceSeed {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    origin: string;
    sourceDate: string;
    plainText: string;
    summary: string;
    connectorAccountId?: string;
  }

  const sourcesData: SourceSeed[] = [
    {
      id: uid(),
      type: "voice",
      title: "Marketing Sync Follow-up",
      description: "Voice note recorded after the marketing sync meeting",
      status: "ready",
      origin: "livekit",
      sourceDate: "2026-05-17T14:30:00Z",
      plainText: `Alright, just got out of the marketing sync with Raj. Here's what we agreed on:\n\nFirst, the Q4 budget split — we're going 40% digital ads, 30% events and conferences, 30% content marketing. Raj is happy with this breakdown.\n\nSecond, I promised Raj I'd send him the finalized budget draft by Friday. The board meeting is coming up and he needs the numbers locked in. I said I'd have it ready with the updated digital spend figures.\n\nThird, we talked about the content calendar. Marcus is going to handle the blog series on memory-first AI. We want at least three posts before launch.\n\nAction items for me: send the budget draft to Raj by Friday, review Marcus's content outline, and follow up on the event sponsorship list.`,
      summary: "Q4 budget split agreed: 40% digital, 30% events, 30% content. Promised Raj finalized draft by Friday for board meeting.",
      connectorAccountId: undefined,
    },
    {
      id: uid(),
      type: "file",
      title: "Q4 Allocation Draft",
      description: "PDF with proposed budget breakdown across marketing channels",
      status: "ready",
      origin: "upload",
      sourceDate: "2026-05-15T09:00:00Z",
      plainText: `Q4 Marketing Budget Allocation — Draft v2\n\nTotal Budget: $240,000\n\nDigital Ads: $96,000 (40%)\n  - Google Ads: $40,000\n  - LinkedIn Ads: $30,000\n  - Twitter/X Ads: $15,000\n  - Retargeting: $11,000\n  Projected ROI: 3.2x\n\nEvents & Conferences: $72,000 (30%)\n  - TechCrunch Disrupt booth: $25,000\n  - AI Summit sponsorship: $20,000\n  - 4 local meetups: $12,000\n  - Travel & logistics: $15,000\n  Projected ROI: 1.8x (brand awareness focus)\n\nContent Marketing: $72,000 (30%)\n  - Blog production (12 posts): $18,000\n  - Video series (6 episodes): $24,000\n  - Podcast sponsorship: $15,000\n  - Design assets: $15,000\n  Projected ROI: 2.5x\n\nTimeline: October 1 — December 31\nNote: Digital spend needs updating per Raj's latest email (May 17).`,
      summary: "Draft Q4 budget: $240K total. Digital $96K, Events $72K, Content $72K. Digital spend numbers need updating.",
    },
    {
      id: uid(),
      type: "journal",
      title: "Product Ideas for Debo",
      description: "Brainstorm session on memory-first AI features",
      status: "ready",
      origin: "manual",
      sourceDate: "2026-05-14T21:15:00Z",
      plainText: `Product brainstorm — evening session\n\nHad a long think about where Debo should go next. 12 ideas sketched out, here are the top picks:\n\n1. Voice-first capture — one tap to record a thought, Debo extracts structure automatically. This is the killer feature.\n\n2. Source-backed answers — every answer Debo gives should link back to the exact source. "Trust but verify" should be the UX principle.\n\n3. Memory review queue — before memories are permanently saved, show a daily review. Like Anki for your own knowledge.\n\n4. Connector memory rules — let users set rules for what gets remembered from each connector. Gmail: only flagged emails. Calendar: only meetings I attended.\n\n5. Collaborative memory — share memory spaces with team members. Raj and I should be able to share the Q4 Budget memory space.\n\nLower priority but interesting: memory expiration, voice-to-task extraction, auto-tagging people in memories, and a "what changed" diff view for projects.`,
      summary: "12 product ideas brainstormed. Top picks: voice-first capture, source-backed answers, memory review queue, connector memory rules.",
    },
    {
      id: uid(),
      type: "call",
      title: "Customer Call with Sarah",
      description: "Discovery call with Sarah from Acme Corp about API integration",
      status: "ready",
      origin: "livekit",
      sourceDate: "2026-05-16T10:00:00Z",
      plainText: `Meeting with Sarah — Acme Corp API Integration\n\nSarah wants to integrate Debo's memory API into Acme's internal dashboard. Her team of 50 engineers needs a way to search through project documentation and meeting notes.\n\nKey requirements she mentioned:\n- REST API with webhook support\n- SSO integration (they use Okta)\n- Data residency in US-East\n- Audit logging for compliance\n\nTimeline: She wants a working pilot in 3 weeks. We agreed on a phased approach — basic search first, then full memory graph access.\n\nPricing discussion: She's thinking per-seat, around $15-20/user/month. I said we'd put together a custom proposal.\n\nFollow-ups:\n- Sarah will send technical requirements by Thursday\n- I'll share our API docs and sandbox access\n- Schedule a technical deep-dive with her engineering lead next week\n\nShe also mentioned they evaluated Mem0 but found it too generic. Our source-backed answers were the differentiator.`,
      summary: "Sarah wants Debo API integration for 50 engineers. 3-week pilot timeline. $15-20/user/month pricing range. She sends requirements by Thursday.",
    },
    {
      id: uid(),
      type: "journal",
      title: "Landing Page Revamp Notes",
      description: "Planning notes for the debo.life redesign",
      status: "ready",
      origin: "manual",
      sourceDate: "2026-05-13T16:45:00Z",
      plainText: `Landing page redesign — structure planning\n\nCurrent page converts at 2.1%. Need to push to 5%+.\n\nNew structure:\n\n1. Hero section — "Your private memory OS" headline. Sub: "Capture anything. Ask your past. Trust every answer." One CTA: Join waitlist.\n\n2. Problem section — "Your best ideas disappear. Your decisions get forgotten. Debo remembers everything."\n\n3. Feature grid — 4 cards:\n   - Voice capture (one tap, auto-structured)\n   - Source-backed answers (every answer has proof)\n   - Connectors (Gmail, Calendar, Notion)\n   - Private by design (your data stays yours)\n\n4. Demo flow — animated search bar showing "What did I promise Raj?" with a real answer and citations.\n\n5. Social proof — logos + user quotes (once we have them)\n\n6. Waitlist CTA — email capture with "Early access: 100 spots left"\n\nAlex will share mockups by end of week. Need to finalize copy before that.`,
      summary: "New landing page: hero with memory OS positioning, feature grid (voice, answers, connectors, privacy), demo flow, waitlist CTA. Alex shares mockups by EOW.",
    },
    {
      id: uid(),
      type: "journal",
      title: "Weekly Review — May 12",
      description: "End-of-week reflection and planning",
      status: "ready",
      origin: "manual",
      sourceDate: "2026-05-12T20:00:00Z",
      plainText: `Weekly review — week of May 12\n\nWhat shipped:\n- Memory card component (full CRUD, animations, mobile responsive)\n- Color system finalized — Duolingo green (#58CC02) as primary, Nunito font\n- 3 user interviews completed (2 positive, 1 neutral)\n\nWhat's in progress:\n- Investor deck for Priya's fund — need to add traction metrics\n- Sarah's API integration requirements (waiting on her email)\n- Landing page redesign — Alex starting mockups\n\nWhat slipped:\n- Blog post on memory OS concept (Marcus needs more time)\n- Voice-to-task extraction prototype (deprioritized for memory card)\n\nNext week priorities:\n1. Ship the budget draft to Raj\n2. Finalize investor deck\n3. Review Alex's landing page mockups\n4. Start API docs for Sarah's team\n\nEnergy level: 7/10. Good progress but need to delegate more.`,
      summary: "Shipped memory card component and color system. 3 user interviews done. Next week: budget draft for Raj, investor deck, landing page mockups.",
    },
    {
      id: uid(),
      type: "voice",
      title: "Investor Meeting Prep",
      description: "Talking points for meeting with Priya's fund",
      status: "ready",
      origin: "livekit",
      sourceDate: "2026-05-16T08:30:00Z",
      plainText: `Recording investor meeting prep notes for the call with Priya next week.\n\nKey talking points:\n\nFirst, market size. The personal knowledge management market is projected at $12B by 2028. Notion has 30M users but no memory graph. Obsidian is local-only. There's a gap for a cloud-native, AI-first memory OS.\n\nSecond, Debo's differentiation. Three things: source-backed answers (no other product does this), private by design (user owns all data), and multimodal capture (voice, text, files, connectors).\n\nThird, traction. 100 beta users, 40% weekly active. Average 12 memories created per user per week. NPS of 72. Retention at 85% after 30 days.\n\nFourth, the ask. Raising $2M seed round. Use of funds: 60% engineering (hire 3 more), 20% go-to-market, 20% ops.\n\nPriya specifically asked about the Tinker API for personal model training. Need to prepare a demo of that capability.\n\nAlso remind her about the Sequoia Scout program timeline — applications close June 15.`,
      summary: "Investor prep: $12B market, 100 beta users, 40% WAU, NPS 72. Raising $2M seed. Priya interested in Tinker API demo.",
    },
    {
      id: uid(),
      type: "link",
      title: "Research on Qdrant Performance",
      description: "Benchmark article comparing vector databases",
      status: "ready",
      origin: "manual",
      sourceDate: "2026-05-11T13:20:00Z",
      plainText: `Vector Database Benchmark — Qdrant vs Pinecone vs Weaviate\n\nKey findings from the benchmark:\n\nLatency (p99, 100K vectors):\n- Qdrant: 2.1ms\n- Pinecone: 4.8ms\n- Weaviate: 6.3ms\n\nLatency (p99, 1M vectors):\n- Qdrant: 5.2ms\n- Pinecone: 8.1ms\n- Weaviate: 12.4ms\n\nQdrant leads on latency for datasets under 1M vectors, which fits our early scale perfectly.\n\nCost comparison (1M vectors, monthly):\n- Qdrant Cloud: $90\n- Pinecone: $140\n- Weaviate Cloud: $120\n\nRecommendation: Stick with Qdrant. Our current setup (us-east-1, 768-dim embeddings) is optimal. If we hit 10M+ vectors, revisit Pinecone's serverless tier.\n\nSource: https://benchmark.vectorsearch.dev/2026`,
      summary: "Qdrant leads vector DB benchmarks at <1M vectors. 2.1ms p99 latency at 100K. $90/mo for 1M vectors. Sticking with Qdrant.",
    },
    {
      id: uid(),
      type: "email",
      title: "Budget Follow-up from Raj",
      description: "Raj's email about updated digital spend numbers",
      status: "needs_review",
      origin: "connector",
      sourceDate: "2026-05-17T09:45:00Z",
      plainText: `From: raj@acme.com\nTo: shaswat@debo.life\nSubject: Re: Q4 Budget — Updated Numbers Needed\n\nHey Shaswat,\n\nThanks for the draft breakdown. Looks solid overall.\n\nOne thing — can you update the digital spend numbers? The board wants to see more allocation toward LinkedIn and less on Twitter/X. They feel our B2B audience is stronger on LinkedIn.\n\nAlso, quick heads up: the board meeting has been moved to next Monday (May 26) instead of Friday. So we have a bit more time, but let's not waste it.\n\nCan you send the revised version by Thursday EOD? That gives me Friday to review before the Monday meeting.\n\nCheers,\nRaj`,
      summary: "Raj wants updated digital spend numbers — more LinkedIn, less Twitter/X. Board meeting moved to Monday May 26. Revised draft needed by Thursday EOD.",
      connectorAccountId: gmailConn,
    },
    {
      id: uid(),
      type: "voice",
      title: "Content Strategy Brainstorm",
      description: "Marcus outlining the Debo content plan",
      status: "needs_review",
      origin: "livekit",
      sourceDate: "2026-05-15T17:00:00Z",
      plainText: `Marcus here — recording the content strategy outline for Debo's blog.\n\nThree content pillars:\n\n1. Memory OS Explainer — what is a memory operating system? How is it different from note-taking or personal knowledge management? This is the thought leadership piece.\n\n2. Privacy-First AI — the story of why we built Debo to be private by default. Reference the Apple approach. Contrast with Notion and Google who own your data.\n\n3. Founder Workflow Series — "How I use Debo" — real workflows from the team. My daily capture routine, Shaswat's investor prep workflow, Alex's design research process.\n\nDistribution plan:\n- Blog on debo.life (primary)\n- Twitter thread for each post\n- LinkedIn article for the privacy piece\n- Submit Memory OS explainer to Hacker News\n\nTimeline: First post ready in 2 weeks. One post per week after that.\n\nNeed Shaswat to review the outline and approve the editorial calendar. Also need budget for a freelance editor ($500/post).`,
      summary: "Content plan: 3 pillars — Memory OS explainer, privacy-first AI, founder workflows. 1 post/week. First post in 2 weeks. Needs review and $500/post editor budget.",
    },
  ];

  const sourceMap: Record<string, string> = {};
  for (const s of sourcesData) {
    await sqlClient`
      INSERT INTO sources (id, user_id, workspace_id, type, title, description, status, origin, source_date, language, privacy_level, plain_text, summary, connector_account_id, created_at, updated_at)
      VALUES (${s.id}, ${USER_ID}, ${WORKSPACE_ID}, ${s.type}, ${s.title}, ${s.description}, ${s.status}, ${s.origin}, ${s.sourceDate}, 'en', 'normal', ${s.plainText}, ${s.summary}, ${s.connectorAccountId ?? null}, ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    sourceMap[s.title] = s.id;
    log("sources", s.id, s.title);
  }

  // ── 7. documents ────────────────────────────────────────────────────────
  console.log(">> Creating documents...");
  const docMap: Record<string, string> = {};
  for (const s of sourcesData) {
    const docId = uid();
    const format = s.type === "voice" || s.type === "call" ? "transcript" : s.type === "file" ? "parsed_pdf" : "plain_text";
    await sqlClient`
      INSERT INTO documents (id, user_id, workspace_id, source_id, format, content_text, version, created_at, updated_at)
      VALUES (${docId}, ${USER_ID}, ${WORKSPACE_ID}, ${s.id}, ${format}, ${s.plainText}, 1, ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    docMap[s.title] = docId;
    log("documents", docId, s.title);
  }

  // ── 8. transcripts (for voice/call sources) ─────────────────────────────
  console.log(">> Creating transcripts...");
  const transcriptMap: Record<string, string> = {};
  for (const s of sourcesData) {
    if (s.type === "voice" || s.type === "call") {
      const txId = uid();
      await sqlClient`
        INSERT INTO transcripts (id, user_id, workspace_id, source_id, provider, text, language, confidence, status, created_at, updated_at)
        VALUES (${txId}, ${USER_ID}, ${WORKSPACE_ID}, ${s.id}, 'deepgram', ${s.plainText}, 'en', 0.94, 'ready', ${now()}, ${now()})
        ON CONFLICT (id) DO NOTHING
      `;
      transcriptMap[s.title] = txId;
      log("transcripts", txId, s.title);
    }
  }

  // ── 9. memory_chunks (2-3 per source) ───────────────────────────────────
  console.log(">> Creating memory chunks...");
  const allChunks: { id: string; sourceTitle: string; text: string; index: number }[] = [];

  for (const s of sourcesData) {
    const paras = s.plainText.split("\n\n").filter((p) => p.trim());
    // split into 2-3 chunks
    const chunkSize = Math.ceil(paras.length / 2);
    const chunks: string[] = [];
    for (let i = 0; i < paras.length; i += chunkSize) {
      chunks.push(paras.slice(i, i + chunkSize).join("\n\n"));
    }

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunkId = uid();
      const docId = docMap[s.title];
      const txId = transcriptMap[s.title];
      await sqlClient`
        INSERT INTO memory_chunks (id, user_id, workspace_id, source_id, document_id, transcript_id, chunk_index, text, token_count, created_at)
        VALUES (${chunkId}, ${USER_ID}, ${WORKSPACE_ID}, ${s.id}, ${docId || null}, ${txId || null}, ${ci}, ${chunks[ci]}, ${Math.ceil(chunks[ci].length / 4)}, ${now()})
        ON CONFLICT (id) DO NOTHING
      `;
      allChunks.push({ id: chunkId, sourceTitle: s.title, text: chunks[ci], index: ci });
      log("memory_chunks", chunkId, `${s.title} [chunk ${ci}]`);
    }
  }

  // ── 10. memory_items ────────────────────────────────────────────────────
  console.log(">> Creating memory items...");
  const memoryItemsData = [
    // Promises
    { id: uid(), sourceId: sourceMap["Marketing Sync Follow-up"], type: "promise", title: "Send finalized Q4 budget to Raj by Friday", content: "Promised Raj to send the finalized Q4 budget draft by Friday before the board meeting. Budget split: 40% digital, 30% events, 30% content.", confidence: 0.95, importance: "high" },
    { id: uid(), sourceId: sourceMap["Customer Call with Sarah"], type: "promise", title: "Share API docs and sandbox access with Sarah", content: "Promised Sarah to share Debo API documentation and sandbox access for Acme Corp's integration evaluation.", confidence: 0.92, importance: "high" },
    // Facts
    { id: uid(), sourceId: sourceMap["Marketing Sync Follow-up"], type: "fact", title: "Q4 budget allocation split", content: "Q4 marketing budget split: 40% digital ads ($96K), 30% events ($72K), 30% content marketing ($72K). Total budget: $240K.", confidence: 0.98, importance: "high" },
    { id: uid(), sourceId: sourceMap["Customer Call with Sarah"], type: "fact", title: "Acme Corp wants 50-user API pilot", content: "Sarah from Acme Corp wants API integration for 50 engineers. Timeline: 3-week pilot. Pricing range: $15-20/user/month. They evaluated Mem0 but preferred Debo's source-backed answers.", confidence: 0.93, importance: "high" },
    { id: uid(), sourceId: sourceMap["Research on Qdrant Performance"], type: "fact", title: "Qdrant performance benchmark results", content: "Qdrant leads vector DB benchmarks at <1M vectors: 2.1ms p99 latency at 100K vectors. Cost: $90/mo for 1M vectors. Recommended to stick with Qdrant for current scale.", confidence: 0.97, importance: "medium" },
    // Decisions
    { id: uid(), sourceId: sourceMap["Product Ideas for Debo"], type: "decision", title: "Voice-first capture is the killer feature", content: "Decided that voice-first capture should be Debo's primary differentiator. One tap to record, automatic structure extraction.", confidence: 0.90, importance: "high" },
    { id: uid(), sourceId: sourceMap["Landing Page Revamp Notes"], type: "decision", title: "Landing page positioning: memory OS", content: "Position Debo as a 'private memory operating system' on the landing page. Tagline: 'Capture anything. Ask your past. Trust every answer.'", confidence: 0.95, importance: "high" },
    // Tasks
    { id: uid(), sourceId: sourceMap["Budget Follow-up from Raj"], type: "task_hint", title: "Update digital spend numbers for Raj", content: "Raj wants updated Q4 digital spend: more LinkedIn allocation, less Twitter/X. Revised draft needed by Thursday EOD.", confidence: 0.96, importance: "high" },
    { id: uid(), sourceId: sourceMap["Customer Call with Sarah"], type: "task_hint", title: "Prepare custom pricing proposal for Acme", content: "Sarah wants a custom per-seat pricing proposal for Acme Corp's 50-engineer pilot. $15-20/user/month range.", confidence: 0.88, importance: "medium" },
    { id: uid(), sourceId: sourceMap["Content Strategy Brainstorm"], type: "task_hint", title: "Review Marcus content strategy outline", content: "Marcus outlined 3 content pillars (Memory OS explainer, privacy-first AI, founder workflows). Needs Shaswat's review and approval of editorial calendar.", confidence: 0.85, importance: "medium" },
    // Ideas
    { id: uid(), sourceId: sourceMap["Product Ideas for Debo"], type: "idea", title: "Memory review queue feature", content: "Build a daily memory review queue — like Anki for your own knowledge. Before memories are permanently saved, show a review screen.", confidence: 0.80, importance: "medium" },
    { id: uid(), sourceId: sourceMap["Product Ideas for Debo"], type: "idea", title: "Connector memory rules", content: "Let users set per-connector memory rules. Gmail: only flagged emails. Calendar: only attended meetings. Notion: only shared pages.", confidence: 0.82, importance: "medium" },
    // Summary
    { id: uid(), sourceId: sourceMap["Weekly Review — May 12"], type: "summary", title: "Week of May 12 summary", content: "Shipped memory card component and color system (Duolingo green, Nunito font). 3 user interviews done. Priorities next week: budget draft for Raj, investor deck, landing page mockups.", confidence: 0.95, importance: "medium" },
  ];

  for (const mi of memoryItemsData) {
    await sqlClient`
      INSERT INTO memory_items (id, user_id, workspace_id, source_id, type, title, content, confidence, importance, review_status, created_at, updated_at)
      VALUES (${mi.id}, ${USER_ID}, ${WORKSPACE_ID}, ${mi.sourceId}, ${mi.type}, ${mi.title}, ${mi.content}, ${mi.confidence}, ${mi.importance}, 'auto_saved', ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("memory_items", mi.id, mi.title);
  }

  // ── 11. entities ────────────────────────────────────────────────────────
  console.log(">> Creating entities...");
  const entitiesData = [
    { sourceId: sourceMap["Marketing Sync Follow-up"], type: "person", value: "Raj", norm: "raj" },
    { sourceId: sourceMap["Marketing Sync Follow-up"], type: "project", value: "Q4 Budget", norm: "q4 budget" },
    { sourceId: sourceMap["Customer Call with Sarah"], type: "person", value: "Sarah", norm: "sarah" },
    { sourceId: sourceMap["Customer Call with Sarah"], type: "company", value: "Acme Corp", norm: "acme corp" },
    { sourceId: sourceMap["Customer Call with Sarah"], type: "product", value: "Debo API", norm: "debo api" },
    { sourceId: sourceMap["Product Ideas for Debo"], type: "project", value: "Debo", norm: "debo" },
    { sourceId: sourceMap["Landing Page Revamp Notes"], type: "person", value: "Alex", norm: "alex" },
    { sourceId: sourceMap["Landing Page Revamp Notes"], type: "project", value: "Landing Page Revamp", norm: "landing page revamp" },
    { sourceId: sourceMap["Weekly Review — May 12"], type: "person", value: "Priya", norm: "priya" },
    { sourceId: sourceMap["Investor Meeting Prep"], type: "person", value: "Priya", norm: "priya" },
    { sourceId: sourceMap["Investor Meeting Prep"], type: "company", value: "Sequoia Scout", norm: "sequoia scout" },
    { sourceId: sourceMap["Content Strategy Brainstorm"], type: "person", value: "Marcus", norm: "marcus" },
    { sourceId: sourceMap["Budget Follow-up from Raj"], type: "person", value: "Raj", norm: "raj" },
  ];

  for (const e of entitiesData) {
    const eid = uid();
    await sqlClient`
      INSERT INTO entities (id, user_id, workspace_id, source_id, type, value, normalized_value, confidence, created_at)
      VALUES (${eid}, ${USER_ID}, ${WORKSPACE_ID}, ${e.sourceId}, ${e.type}, ${e.value}, ${e.norm}, 0.95, ${now()})
      ON CONFLICT (user_id, workspace_id, type, normalized_value) DO NOTHING
    `;
    log("entities", eid, `${e.type}: ${e.value}`);
  }

  // ── 12. person_mentions ─────────────────────────────────────────────────
  console.log(">> Creating person mentions...");
  const mentions = [
    { person: "Raj", sourceTitle: "Marketing Sync Follow-up", context: "Promised Raj finalized budget draft by Friday" },
    { person: "Raj", sourceTitle: "Q4 Allocation Draft", context: "Budget document for Q4 planning with Raj" },
    { person: "Raj", sourceTitle: "Budget Follow-up from Raj", context: "Raj requesting updated digital spend numbers" },
    { person: "Sarah", sourceTitle: "Customer Call with Sarah", context: "Sarah wants API integration for 50 engineers at Acme Corp" },
    { person: "Sarah", sourceTitle: "Weekly Review — May 12", context: "Waiting on Sarah's API requirements email" },
    { person: "Alex", sourceTitle: "Landing Page Revamp Notes", context: "Alex will share landing page mockups by end of week" },
    { person: "Priya", sourceTitle: "Weekly Review — May 12", context: "Investor deck being prepared for Priya's fund" },
    { person: "Priya", sourceTitle: "Investor Meeting Prep", context: "Meeting with Priya about Sequoia Scout program" },
    { person: "Marcus", sourceTitle: "Content Strategy Brainstorm", context: "Marcus outlined content plan for Debo blog" },
    { person: "Marcus", sourceTitle: "Weekly Review — May 12", context: "Marcus needs more time on blog post" },
  ];

  for (const m of mentions) {
    const mid = uid();
    const personId = peopleMap[m.person];
    const sid = sourceMap[m.sourceTitle];
    if (!personId || !sid) continue;
    await sqlClient`
      INSERT INTO person_mentions (id, user_id, workspace_id, person_id, source_id, context_text, created_at)
      VALUES (${mid}, ${USER_ID}, ${WORKSPACE_ID}, ${personId}, ${sid}, ${m.context}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("person_mentions", mid, `${m.person} in ${m.sourceTitle}`);
  }

  // ── 13. project_links ───────────────────────────────────────────────────
  console.log(">> Creating project links...");
  const projectLinks = [
    { proj: "Q4 Budget", sourceTitle: "Marketing Sync Follow-up", rel: "mentioned_in" },
    { proj: "Q4 Budget", sourceTitle: "Q4 Allocation Draft", rel: "belongs_to" },
    { proj: "Q4 Budget", sourceTitle: "Budget Follow-up from Raj", rel: "mentioned_in" },
    { proj: "Debo", sourceTitle: "Product Ideas for Debo", rel: "belongs_to" },
    { proj: "Debo", sourceTitle: "Customer Call with Sarah", rel: "mentioned_in" },
    { proj: "Debo", sourceTitle: "Research on Qdrant Performance", rel: "belongs_to" },
    { proj: "Debo", sourceTitle: "Investor Meeting Prep", rel: "mentioned_in" },
    { proj: "Landing Page Revamp", sourceTitle: "Landing Page Revamp Notes", rel: "belongs_to" },
    { proj: "Landing Page Revamp", sourceTitle: "Weekly Review — May 12", rel: "mentioned_in" },
  ];

  for (const pl of projectLinks) {
    const plId = uid();
    const pid = projectMap[pl.proj];
    const sid = sourceMap[pl.sourceTitle];
    if (!pid || !sid) continue;
    await sqlClient`
      INSERT INTO project_links (id, user_id, workspace_id, project_id, source_id, relation_type, created_at)
      VALUES (${plId}, ${USER_ID}, ${WORKSPACE_ID}, ${pid}, ${sid}, ${pl.rel}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("project_links", plId, `${pl.proj} <-> ${pl.sourceTitle}`);
  }

  // ── 14. tasks ───────────────────────────────────────────────────────────
  console.log(">> Creating tasks...");
  const tasksData = [
    { id: uid(), title: "Send finalized Q4 budget to Raj", description: "Update digital spend numbers (more LinkedIn, less Twitter/X) and send to Raj by Thursday EOD.", status: "todo", dueAt: "2026-05-22T23:59:00Z", sourceTitle: "Marketing Sync Follow-up", person: "Raj", project: "Q4 Budget", confidence: 0.95, extraction: "extracted_approved" },
    { id: uid(), title: "Follow up with Sarah about API integration requirements", description: "Sarah will send technical requirements by Thursday. Schedule technical deep-dive with her engineering lead.", status: "todo", dueAt: "2026-05-22T23:59:00Z", sourceTitle: "Customer Call with Sarah", person: "Sarah", project: "Debo", confidence: 0.92, extraction: "extracted_approved" },
    { id: uid(), title: "Review landing page designs from Alex", description: "Alex will share mockups by end of week. Review for memory OS positioning and demo flow.", status: "todo", dueAt: "2026-05-24T23:59:00Z", sourceTitle: "Landing Page Revamp Notes", person: "Alex", project: "Landing Page Revamp", confidence: 0.88, extraction: "extracted_approved" },
    { id: uid(), title: "Prepare investor deck for Priya's fund", description: "Add traction metrics: 100 beta users, 40% WAU, NPS 72, 85% 30-day retention. Prepare Tinker API demo.", status: "doing", dueAt: "2026-05-25T23:59:00Z", sourceTitle: "Investor Meeting Prep", person: "Priya", project: "Debo", confidence: 0.93, extraction: "extracted_approved" },
    { id: uid(), title: "Draft blog post on memory OS concept", description: "First post in the content series. Marcus's outline needs review before writing begins.", status: "todo", dueAt: "2026-05-28T23:59:00Z", sourceTitle: "Content Strategy Brainstorm", person: "Marcus", project: "Debo", confidence: 0.82, extraction: "extracted_pending" },
    { id: uid(), title: "Update Q4 digital spend numbers per Raj's email", description: "More LinkedIn allocation, less Twitter/X. Revised draft needed by Thursday EOD.", status: "todo", dueAt: "2026-05-22T23:59:00Z", sourceTitle: "Budget Follow-up from Raj", person: "Raj", project: "Q4 Budget", confidence: 0.96, extraction: "extracted_approved" },
    { id: uid(), title: "Review Marcus content strategy draft", description: "3 pillars: Memory OS explainer, privacy-first AI, founder workflows. Approve editorial calendar.", status: "todo", dueAt: null, sourceTitle: "Content Strategy Brainstorm", person: "Marcus", project: "Debo", confidence: 0.85, extraction: "extracted_pending" },
    { id: uid(), title: "Ship memory card component", description: "Memory card with full CRUD, animations, mobile responsive.", status: "done", dueAt: "2026-05-12T23:59:00Z", sourceTitle: "Weekly Review — May 12", person: null, project: "Debo", confidence: 0.98, extraction: "manual" },
  ];

  for (const t of tasksData) {
    const personId = t.person ? peopleMap[t.person] : null;
    const projId = t.project ? projectMap[t.project] : null;
    const sid = sourceMap[t.sourceTitle];
    await sqlClient`
      INSERT INTO tasks (id, user_id, workspace_id, source_id, title, description, status, due_at, related_person_id, project_id, confidence, extraction_status, created_at, updated_at)
      VALUES (${t.id}, ${USER_ID}, ${WORKSPACE_ID}, ${sid}, ${t.title}, ${t.description}, ${t.status}, ${t.dueAt}, ${personId}, ${projId}, ${t.confidence}, ${t.extraction}, ${now()}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("tasks", t.id, `${t.title} [${t.status}]`);
  }

  // ── 15. decisions ───────────────────────────────────────────────────────
  console.log(">> Creating decisions...");
  const decisionsData = [
    { id: uid(), sourceTitle: "Marketing Sync Follow-up", project: "Q4 Budget", title: "Q4 budget allocation split", text: "40% digital ads, 30% events, 30% content marketing for Q4.", reason: "Raj approved the split during marketing sync. Board requires digital-heavy allocation.", decidedAt: "2026-05-17T14:30:00Z" },
    { id: uid(), sourceTitle: "Product Ideas for Debo", project: "Debo", title: "Voice-first capture as primary feature", text: "Voice-first capture will be Debo's primary differentiator.", reason: "One-tap recording with automatic structure extraction is the most unique capability.", decidedAt: "2026-05-14T21:15:00Z" },
    { id: uid(), sourceTitle: "Landing Page Revamp Notes", project: "Landing Page Revamp", title: "Landing page positioning", text: "Position Debo as a 'private memory operating system' with the tagline 'Capture anything. Ask your past. Trust every answer.'", reason: "Memory OS positioning differentiates from note-taking apps and knowledge management tools.", decidedAt: "2026-05-13T16:45:00Z" },
    { id: uid(), sourceTitle: "Research on Qdrant Performance", project: "Debo", title: "Stick with Qdrant for vector search", text: "Continue using Qdrant as the vector database for Debo's memory graph.", reason: "Qdrant leads benchmarks at our scale (<1M vectors) with 2.1ms p99 latency and $90/mo cost.", decidedAt: "2026-05-11T13:20:00Z" },
  ];

  for (const d of decisionsData) {
    const projId = d.project ? projectMap[d.project] : null;
    const sid = sourceMap[d.sourceTitle];
    await sqlClient`
      INSERT INTO decisions (id, user_id, workspace_id, source_id, project_id, title, decision_text, reason, status, confidence, decided_at, created_at)
      VALUES (${d.id}, ${USER_ID}, ${WORKSPACE_ID}, ${sid}, ${projId}, ${d.title}, ${d.text}, ${d.reason}, 'active', 0.95, ${d.decidedAt}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("decisions", d.id, d.title);
  }

  // ── 16. memory_relations ────────────────────────────────────────────────
  console.log(">> Creating memory relations...");
  const relations = [
    { from: sourceMap["Budget Follow-up from Raj"], fromType: "source", to: sourceMap["Q4 Allocation Draft"], toType: "source", rel: "follows_up" },
    { from: sourceMap["Marketing Sync Follow-up"], fromType: "source", to: sourceMap["Q4 Allocation Draft"], toType: "source", rel: "follows_up" },
    { from: sourceMap["Customer Call with Sarah"], fromType: "source", to: sourceMap["Weekly Review — May 12"], toType: "source", rel: "follows_up" },
    { from: sourceMap["Investor Meeting Prep"], fromType: "source", to: sourceMap["Weekly Review — May 12"], toType: "source", rel: "follows_up" },
    { from: sourceMap["Content Strategy Brainstorm"], fromType: "source", to: sourceMap["Product Ideas for Debo"], toType: "source", rel: "same_topic" },
  ];

  for (const r of relations) {
    const rid = uid();
    await sqlClient`
      INSERT INTO memory_relations (id, user_id, workspace_id, from_type, from_id, to_type, to_id, relation_type, confidence, created_at)
      VALUES (${rid}, ${USER_ID}, ${WORKSPACE_ID}, ${r.fromType}, ${r.from}, ${r.toType}, ${r.to}, ${r.rel}, 0.90, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("memory_relations", rid, `${r.fromType} -> ${r.toType} (${r.rel})`);
  }

  // ── 17. chat_threads & chat_messages (the demo) ─────────────────────────
  console.log(">> Creating demo chat thread...");

  const threadId = uid();
  await sqlClient`
    INSERT INTO chat_threads (id, user_id, workspace_id, title, mode, created_at, updated_at)
    VALUES (${threadId}, ${USER_ID}, ${WORKSPACE_ID}, 'What did I promise Raj?', 'recall', ${now()}, ${now()})
    ON CONFLICT (id) DO NOTHING
  `;
  log("chat_threads", threadId, "What did I promise Raj?");

  // User message
  const userMsgId = uid();
  await sqlClient`
    INSERT INTO chat_messages (id, user_id, workspace_id, thread_id, role, content, created_at)
    VALUES (${userMsgId}, ${USER_ID}, ${WORKSPACE_ID}, ${threadId}, 'user', 'What did I promise Raj?', ${now()})
    ON CONFLICT (id) DO NOTHING
  `;
  log("chat_messages", userMsgId, "user: What did I promise Raj?");

  // Assistant message
  const assistantMsgId = uid();
  const assistantContent = `Based on your memory, you promised Raj two things:\n\n1. **Send the finalized Q4 budget draft by Friday** — You discussed the budget allocation during your marketing sync on May 17. The agreed split is 40% digital ads, 30% events, and 30% content marketing.\n\n2. **Update the digital spend numbers** — Raj followed up via email asking for revised numbers with more LinkedIn allocation and less Twitter/X. The board meeting has been moved to Monday May 26, and he needs the revised draft by Thursday EOD.\n\nThe task "Send finalized Q4 budget to Raj" is currently in your todo list with a due date of May 22.`;

  await sqlClient`
    INSERT INTO chat_messages (id, user_id, workspace_id, thread_id, role, content, created_at)
    VALUES (${assistantMsgId}, ${USER_ID}, ${WORKSPACE_ID}, ${threadId}, 'assistant', ${assistantContent}, ${now()})
    ON CONFLICT (id) DO NOTHING
  `;
  log("chat_messages", assistantMsgId, "assistant: full answer with citations");

  // ── 18. answer_citations ────────────────────────────────────────────────
  console.log(">> Creating answer citations...");

  // Find a chunk from the Marketing Sync source and the Raj email source
  const syncChunks = allChunks.filter((c) => c.sourceTitle === "Marketing Sync Follow-up");
  const emailChunks = allChunks.filter((c) => c.sourceTitle === "Budget Follow-up from Raj");

  const citations = [
    {
      sourceTitle: "Marketing Sync Follow-up",
      chunkId: syncChunks[0]?.id || null,
      quote: "I promised Raj I'd send him the finalized budget draft by Friday. The board meeting is coming up and he needs the numbers locked in.",
      confidence: 0.96,
      startTime: 8.0,
      endTime: 15.0,
    },
    {
      sourceTitle: "Marketing Sync Follow-up",
      chunkId: syncChunks[0]?.id || null,
      quote: "the Q4 budget split — we're going 40% digital ads, 30% events and conferences, 30% content marketing. Raj is happy with this breakdown.",
      confidence: 0.95,
      startTime: 3.0,
      endTime: 8.0,
    },
    {
      sourceTitle: "Budget Follow-up from Raj",
      chunkId: emailChunks[0]?.id || null,
      quote: "can you update the digital spend numbers? The board wants to see more allocation toward LinkedIn and less on Twitter/X.",
      confidence: 0.94,
      startTime: null,
      endTime: null,
    },
    {
      sourceTitle: "Budget Follow-up from Raj",
      chunkId: emailChunks[0]?.id || null,
      quote: "the board meeting has been moved to next Monday (May 26) instead of Friday",
      confidence: 0.93,
      startTime: null,
      endTime: null,
    },
  ];

  for (const c of citations) {
    const cid = uid();
    const sid = sourceMap[c.sourceTitle];
    await sqlClient`
      INSERT INTO answer_citations (id, user_id, workspace_id, message_id, source_id, chunk_id, quote_text, start_time, end_time, confidence, created_at)
      VALUES (${cid}, ${USER_ID}, ${WORKSPACE_ID}, ${assistantMsgId}, ${sid}, ${c.chunkId}, ${c.quote}, ${c.startTime}, ${c.endTime}, ${c.confidence}, ${now()})
      ON CONFLICT (id) DO NOTHING
    `;
    log("answer_citations", cid, c.quote.slice(0, 60) + "...");
  }

  // ── 19. audit log ───────────────────────────────────────────────────────
  console.log(">> Creating audit log entry...");
  const auditId = uid();
  await sqlClient`
    INSERT INTO audit_logs (id, user_id, workspace_id, action, target_type, target_id, created_at)
    VALUES (${auditId}, ${USER_ID}, ${WORKSPACE_ID}, 'seed.run', 'workspace', ${WORKSPACE_ID}, ${now()})
    ON CONFLICT (id) DO NOTHING
  `;
  log("audit_logs", auditId, "seed.run");

  // ── done ────────────────────────────────────────────────────────────────
  console.log(`\n=== Seed complete! ${count} records inserted. ===\n`);
  console.log("Demo query: 'What did I promise Raj?'");
  console.log(`  Thread ID: ${threadId}`);
  console.log(`  User message ID: ${userMsgId}`);
  console.log(`  Assistant message ID: ${assistantMsgId}`);
  console.log(`  Citations: ${citations.length}\n`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
