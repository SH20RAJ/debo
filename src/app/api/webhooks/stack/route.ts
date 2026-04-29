import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const STACK_WEBHOOK_SECRET = process.env.STACK_WEBHOOK_SECRET;

  if (!STACK_WEBHOOK_SECRET) {
    console.error("STACK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not set", { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(STACK_WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const stackUser = data;
    
    // Map Stack user to our local user table
    const userData = {
      id: stackUser.id,
      name: stackUser.display_name || stackUser.primary_email.split('@')[0],
      email: stackUser.primary_email,
      emailVerified: stackUser.primary_email_verified || false,
      image: stackUser.profile_image_url || null,
      updatedAt: new Date(),
    };

    if (type === "user.created") {
      await db.insert(user).values({
        ...userData,
        createdAt: new Date(),
      }).onConflictDoUpdate({
        target: user.id,
        set: userData,
      });
    } else {
      await db.update(user).set(userData).where(eq(user.id, stackUser.id));
    }
  }

  if (type === "user.deleted") {
    await db.delete(user).where(eq(user.id, data.id));
  }

  return new Response("Success", { status: 200 });
}
