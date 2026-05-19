import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST() { return NextResponse.json({ redirectUrl: "#", connectionId: "stub" }); }
