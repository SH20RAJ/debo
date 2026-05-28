import { z } from "zod";

export const ConnectorActionPlanSchema = z.object({
  provider: z.string(),
  action: z.string(),
  arguments: z.record(z.string(), z.unknown()).default({}),
  reason: z.string().optional(),
});

export type ConnectorActionPlan = z.infer<typeof ConnectorActionPlanSchema>;

export const ConnectorActionResultSchema = z.object({
  status: z.enum(["not_configured", "requires_confirmation", "queued", "completed", "failed"]),
  provider: z.string(),
  action: z.string(),
  message: z.string(),
  dryRun: z.boolean().default(true),
});

export type ConnectorActionResult = z.infer<typeof ConnectorActionResultSchema>;
