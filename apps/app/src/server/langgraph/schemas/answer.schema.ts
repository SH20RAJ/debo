import { z } from "zod";

/**
 * Citation — a reference to a specific source that backs an answer.
 */
export const CitationSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  sourceType: z.string(),
  title: z.string(),
  snippet: z.string(),
  confidence: z.enum(["strong", "partial", "weak"]).default("partial"),
  relevanceScore: z.number().min(0).max(1).optional(),
  timestamp: z.string().optional(),
});

export type Citation = z.infer<typeof CitationSchema>;

/**
 * Source found during memory retrieval.
 */
export const SourceFoundSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  snippet: z.string(),
  createdAt: z.string().optional(),
});

export type SourceFound = z.infer<typeof SourceFoundSchema>;

/**
 * Ask Debo answer output.
 */
export const AskAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(CitationSchema),
  confidence: z.enum([
    "strong_source_match",
    "partial_source_match",
    "weak_source_match",
    "no_source_found",
  ]),
  followUps: z.array(z.string()).optional(),
  intent: z.string(),
});

export type AskAnswer = z.infer<typeof AskAnswerSchema>;
