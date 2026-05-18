import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connectors, connectorEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const connector = await db.query.connectors.findFirst({
      where: eq(connectors.id, id),
    });

    if (!connector) {
      return NextResponse.json({ error: "Connector not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: connector.id,
      name: connector.name,
      connectorType: connector.connectorType,
      webhookUrl: connector.webhookUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signature = req.headers.get("x-debo-signature");
  const eventType = req.headers.get("x-debo-event-type");

  try {
    const connector = await db.query.connectors.findFirst({
      where: eq(connectors.id, id),
    });

    if (!connector) {
      return NextResponse.json({ error: "Connector not found" }, { status: 404 });
    }

    if (!connector.isEnabled) {
      return NextResponse.json({ error: "Connector is disabled" }, { status: 403 });
    }

    // Verify webhook signature if secret is set
    let rawBody = "";
    if (connector.webhookSecret && signature) {
      rawBody = await req.clone().text();
      const expectedSignature = crypto
        .createHmac("sha256", connector.webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const eventData = await req.json() as {
      eventType?: string;
      content?: string;
      text?: string;
      messageId?: string;
      id?: string;
      permalink?: string;
      url?: string;
      user?: string;
      author?: { name?: string };
      channel?: string;
      room?: string;
    };

    // Process the incoming event
    const eventId = uuid();
    const incomingEvent = {
      eventType: eventType || eventData.eventType || "webhook",
      content: eventData.content || eventData.text || JSON.stringify(eventData),
      sourceId: eventData.messageId || eventData.id,
      sourceUrl: eventData.permalink || eventData.url,
      authorName: eventData.user || eventData.author?.name,
      channelName: eventData.channel || eventData.room,
      metadata: {
        raw: eventData,
        headers: Object.fromEntries(req.headers.entries()),
      },
    };

    await db.insert(connectorEvents).values({
      id: eventId,
      userId: connector.userId,
      connectorId: id,
      eventType: incomingEvent.eventType,
      content: incomingEvent.content,
      sourceId: incomingEvent.sourceId,
      sourceUrl: incomingEvent.sourceUrl,
      authorName: incomingEvent.authorName,
      channelName: incomingEvent.channelName,
      metadata: JSON.stringify(incomingEvent.metadata),
      createdAt: new Date(),
    });

    // Update connector last sync time
    await db.update(connectors)
      .set({ lastSyncAt: new Date(), syncStatus: "success", updatedAt: new Date() })
      .where(eq(connectors.id, id));

    return NextResponse.json({
      success: true,
      eventId,
      message: "Event received",
    });
  } catch (error) {
    console.error("Webhook error:", error);

    // Mark connector as error
    await db.update(connectors)
      .set({ syncStatus: "error", updatedAt: new Date() })
      .where(eq(connectors.id, id));

    return NextResponse.json({ error: "Failed to process event" }, { status: 500 });
  }
}
