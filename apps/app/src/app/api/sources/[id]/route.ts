import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Shared in-memory store (same object reference via module caching)
// Will be replaced by DB when available
const sources: Map<string, any> = (globalThis as any).__sources ?? new Map();
(globalThis as any).__sources = sources;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = sources.get(id);
  if (!entry) {
    return NextResponse.json({ id, title: "Source", status: "ready", createdAt: new Date().toISOString() });
  }
  return NextResponse.json(entry);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const existing = sources.get(id) ?? { id, createdAt: new Date().toISOString() };
  const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
  sources.set(id, updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  sources.delete(id);
  return NextResponse.json({ success: true });
}
