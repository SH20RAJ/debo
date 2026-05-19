import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Shared in-memory store (same object reference via module caching)
// Will be replaced by DB when available
const sources: Map<string, any> = (globalThis as any).__sources ?? new Map();
(globalThis as any).__sources = sources;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  let items = Array.from(sources.values());
  if (type) {
    items = items.filter((s) => s.type === type);
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `src_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const entry = {
    id,
    ...body,
    status: body.status ?? "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sources.set(id, entry);
  return NextResponse.json(entry, { status: 201 });
}
