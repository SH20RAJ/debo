import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // TODO: fetch from DB when available
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `src_${Date.now()}`, ...body, status: "draft", createdAt: new Date().toISOString() }, { status: 201 });
}
