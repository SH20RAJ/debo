# 🤖 Agent Context (agents.md)

This file contains strict guidelines for any AI agent or framework (like Claude, Cursor, GitHub Copilot) working within the Debo repository.

## Project Goal
Debo is a next-generation AI companion journal leveraging Next.js, pure Shadcn (Tailwind V4), Better-Auth, Neon Serverless DB, and Cloudflare Edge AI/Vectorize. It heavily utilizes MCP and a first-party memory engine for deep conversational logic.

## Strict Coding Directives
1. **Routing Rules**: `page.tsx` and `layout.tsx` files **must absolutely be server components** (`"use server"` implicitly or explicitly). Never add `"use client"` to a layout or page file.
2. **Component Separation**: Interactive code requiring `"use client"` must be encapsulated into granular component files placed in a `/components` directory, then imported into the Server page.
3. **Styling Rules**: Utilize **pure Tailwind CSS V4 / Shadcn styles**. Do not create or edit custom CSS files outside of standard initialization routines. Keep styles explicitly defined through Tailwind utilities.
4. **DRY Principles**: Identify repeated UI states and immediately abstract them into generic components.
5. **Backend Logic**: Ensure all heavy operations run edge-first via Cloudflare Worker bindings if possible. Data mutations run through Next.js server actions interacting with Drizzle ORM to Neon.

Follow these rules unconditionally to prevent architectural drift.
