import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { id: "conn-gmail", provider: "gmail", status: "disconnected", name: "Gmail" },
    { id: "conn-calendar", provider: "google_calendar", status: "disconnected", name: "Google Calendar" },
    { id: "conn-notion", provider: "notion", status: "disconnected", name: "Notion" },
    { id: "conn-github", provider: "github", status: "disconnected", name: "GitHub" },
    { id: "conn-slack", provider: "slack", status: "disconnected", name: "Slack" },
    { id: "conn-drive", provider: "drive", status: "disconnected", name: "Google Drive" },
  ]);
}
