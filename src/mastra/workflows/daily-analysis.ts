import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { getJournals } from '@/actions/journals';
import { addMemory } from '@/actions/memories';
import { mastra } from '../index';

const fetchRecentJournalsStep = createStep({
  id: 'fetch-recent-journals',
  inputSchema: z.object({
    userId: z.string(),
  }),
  outputSchema: z.object({
    journals: z.array(z.object({
      id: z.string(),
      content: z.string(),
      createdAt: z.date(),
    })),
  }),
  execute: async ({ inputData }) => {
    const journals = await getJournals('desc', 5, 0, inputData.userId);
    return {
      journals: journals.map(j => ({
        id: j.id,
        content: j.content,
        createdAt: j.createdAt || new Date(),
      })),
    };
  },
});

const analyzePatternsStep = createStep({
  id: 'analyze-patterns',
  inputSchema: z.object({
    userId: z.string(),
    journals: z.array(z.object({
      id: z.string(),
      content: z.string(),
    })),
  }),
  outputSchema: z.object({
    insight: z.string(),
    sentiment: z.string(),
    significantFacts: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const agent = mastra.getAgent('debo');
    const journalText = inputData.journals.map(j => j.content).join('\n\n');
    
    const response = await agent.generate(
      `Analyze these recent journal entries and extract:
      1. A core emotional pattern or life insight.
      2. The overall sentiment.
      3. Any specific facts that should be stored in long-term memory (e.g., new goals, preferences, or major events).
      
      Journals:
      ${journalText}`,
      {
        output: z.object({
          insight: z.string(),
          sentiment: z.string(),
          significantFacts: z.array(z.string()),
        }),
      }
    );

    return response.object;
  },
});

const storeMemoriesStep = createStep({
  id: 'store-memories',
  inputSchema: z.object({
    userId: z.string(),
    significantFacts: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    for (const fact of inputData.significantFacts) {
      await addMemory(fact, inputData.userId);
    }
    return { success: true };
  },
});

export const dailyAnalysisWorkflow = createWorkflow({
  id: 'daily-analysis-workflow',
  inputSchema: z.object({
    userId: z.string(),
  }),
  outputSchema: z.object({
    insight: z.string(),
    sentiment: z.string(),
  }),
})
  .then(fetchRecentJournalsStep)
  .then(analyzePatternsStep)
  .then(storeMemoriesStep)
  .commit();
