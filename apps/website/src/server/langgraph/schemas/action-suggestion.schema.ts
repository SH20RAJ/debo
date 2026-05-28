import { z } from "zod";

export const ActionSuggestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["ask", "task", "draft", "connector"]),
  confidence: z.number().min(0).max(1).default(0.5),
  reason: z.string().optional(),
});

export type ActionSuggestion = z.infer<typeof ActionSuggestionSchema>;
