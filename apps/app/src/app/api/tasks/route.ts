import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json([]); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `task_${Date.now()}`, ...body, status: body.status || "inbox", createdAt: new Date().toISOString() }, { status: 201 });
}
