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
  outputSchema: z.any(),
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
  outputSchema: z.any(),
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
  outputSchema: z.any(),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('deboAnalyst');
    const content = inputData.journal.journalEntry || '';
    
    // @ts-ignore
    const response = await agent.generate(
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

    if (!response.object) {
      throw new Error('Failed to extract memory');
    }

    const result = await storeMemory(inputData.userId, response.object);
    return { 
      factsInserted: result.factsInserted,
      entitiesUpserted: result.entitiesUpserted 
    };
  },
});

// @ts-ignore
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
