import { z } from "zod";

export const CitationValidationSchema = z.object({
  valid: z.boolean(),
  warnings: z.array(z.string()).default([]),
});

export type CitationValidation = z.infer<typeof CitationValidationSchema>;
