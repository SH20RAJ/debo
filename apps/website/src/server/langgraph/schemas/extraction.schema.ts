import { z } from "zod";

export const ExtractedMemorySchema = z.object({
  type: z.enum([
    "fact",
    "preference",
    "task_hint",
    "decision",
    "idea",
    "promise",
    "reminder",
    "summary",
  ]),
  title: z.string(),
  content: z.string(),
  confidence: z.number().min(0).max(1).default(0.4),
  sourceId: z.string().optional(),
});

export type ExtractedMemory = z.infer<typeof ExtractedMemorySchema>;

export const ExtractionResultSchema = z.object({
  memories: z.array(ExtractedMemorySchema),
  summary: z.string(),
  needsReview: z.boolean().default(true),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
