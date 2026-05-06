import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { indexJournal } from '@/lib/vector/search';
import { getQdrantErrorMessage, isQdrantAuthError } from '@/lib/vector/qdrant';
import { upsertMemoryGraphForJournal } from '@/lib/life/graph';
import { storeMemory } from '@/lib/memory/store';

const vectorIndexStep = createStep({
  id: 'vector-index',
  inputSchema: z.object({
    userId: z.string(),
    journal: z.any(),
  }),
  outputSchema: z.object({
    userId: z.string(),
    journal: z.any(),
    indexed: z.boolean(),
    vectorIndexError: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    try {
      await indexJournal(inputData.journal);
      return { ...inputData, indexed: true };
    } catch (error) {
      const message = getQdrantErrorMessage(error);
      const reason = isQdrantAuthError(error)
        ? "Qdrant credentials rejected. Journal saved; vector search skipped."
        : `Vector index skipped: ${message}`;

      console.warn(`[JournalProcessing] ${reason}`);
      return { ...inputData, indexed: false, vectorIndexError: message };
    }
  },
});

const graphUpdateStep = createStep({
  id: 'graph-update',
  inputSchema: z.object({
    userId: z.string(),
    journal: z.any(),
  }),
  outputSchema: z.object({
    userId: z.string(),
    journal: z.any(),
    graphUpdated: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    await upsertMemoryGraphForJournal(inputData.userId, inputData.journal);
    return { ...inputData, graphUpdated: true };
  },
});

const memoryExtractionStep = createStep({
  id: 'memory-extraction',
  inputSchema: z.object({
    userId: z.string(),
    journal: z.any(),
  }),
  outputSchema: z.object({
    factsInserted: z.number().optional(),
    entitiesUpserted: z.number().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('deboAnalyst');
    const content = inputData.journal.content || '';
    
    const result = await agent.generate(
      [
        {
          role: 'user',
          content: `Extract durable personal memory facts, entities, emotions, and topics from this text.
      
          Text:
          ${content}`,
        },
      ],
      {
        structuredOutput: {
          schema: z.object({
            facts: z.array(z.string()),
            entities: z.array(z.string()),
            emotions: z.array(z.string()),
            topics: z.array(z.string()),
          }),
        },
      }
    );

    if (!result.object) {
      throw new Error('Failed to extract memory');
    }

    const storeResult = await storeMemory(inputData.userId, result.object);
    return { 
      factsInserted: storeResult.factsInserted,
      entitiesUpserted: storeResult.entitiesUpserted 
    };
  },
});

export const journalProcessingWorkflow = createWorkflow({
  id: 'journal-processing-workflow',
  inputSchema: z.object({
    userId: z.string(),
    journal: z.any(),
  }),
  outputSchema: z.object({
    factsInserted: z.number().optional(),
    entitiesUpserted: z.number().optional(),
  }),
})
  .then(vectorIndexStep)
  .then(graphUpdateStep)
  .then(memoryExtractionStep)
  .commit();
