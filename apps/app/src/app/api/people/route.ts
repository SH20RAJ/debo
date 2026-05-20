import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json([]); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `person_${Date.now()}`, ...body, createdAt: new Date().toISOString() }, { status: 201 });
}
