import { z } from "zod";

export const PostCallSummarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  actionItems: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  followUps: z.array(z.string()).default([]),
});

export type PostCallSummary = z.infer<typeof PostCallSummarySchema>;
