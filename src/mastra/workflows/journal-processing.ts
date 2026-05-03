import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { indexJournal } from '@/lib/vector/search';
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
  }),
  execute: async ({ inputData }) => {
    await indexJournal(inputData.journal);
    return { ...inputData, indexed: true };
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
