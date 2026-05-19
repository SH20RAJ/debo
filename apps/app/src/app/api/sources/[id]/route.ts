import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ id, title: "Source", status: "ready", createdAt: new Date().toISOString() });
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
}
export async function DELETE() {
  return NextResponse.json({ success: true });
}
