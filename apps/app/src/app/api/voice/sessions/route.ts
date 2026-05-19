import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json([]); }
export async function POST() {
  return NextResponse.json({ id: `vs_${Date.now()}`, roomName: `debo-voice-${Date.now()}`, status: "active", createdAt: new Date().toISOString() }, { status: 201 });
}
