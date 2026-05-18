import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_STACK_SECRET: !!process.env.STACK_SECRET_SERVER_KEY,
    }
  });
}
