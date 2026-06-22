import { z } from "zod";

export const NormalizedEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  connectorAccountId: z.string().optional().nullable(),
  source: z.string(), // e.g. "fitbit", "homeassistant", "gmail"
  category: z.enum(["productivity", "health", "smart_home", "iot", "security", "location", "vehicles"]),
  eventType: z.string(), // e.g. "fitbit.sleep_completed", "gmail.email_received"
  timestamp: z.date(),
  summary: z.string(),
  metadata: z.record(z.string(), z.any()).default({}),
  rawPayload: z.record(z.string(), z.any()).default({}),
});

export type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;
