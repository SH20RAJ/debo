import { NextRequest, NextResponse } from "next/server";
import { db } from "@debo/db";
import { connectors } from "@debo/db/schema";
import { eq, desc } from "drizzle-orm";
import { resolveUserId } from "@/actions/auth-sync";
import { listConnectors, createConnector, getConnectorHealth } from "@/actions/connectors";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const health = await getConnectorHealth(userId);
  return NextResponse.json(health);
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      name?: string;
      connectorType?: string;
      apiKey?: string;
      webhookUrl?: string;
      webhookSecret?: string;
      baseUrl?: string;
      metadata?: Record<string, unknown>;
    };
    const { name, connectorType, apiKey, webhookUrl, webhookSecret, baseUrl, metadata } = body;

    if (!name || !connectorType) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const result = await createConnector(userId, {
      name,
      connectorType: connectorType as "slack" | "discord" | "notion" | "linear" | "gmail" | "calendar" | "github" | "trello" | "asana" | "jira" | "custom",
      apiKey,
      webhookUrl,
      webhookSecret,
      baseUrl,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create connector:", error);
    return NextResponse.json({ error: "Failed to create connector" }, { status: 500 });
  }
}
