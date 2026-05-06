import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { dailyAnalysisWorkflow } from './workflows/daily-analysis';
import { journalProcessingWorkflow } from './workflows/journal-processing';
import { weatherAgent } from './agents/weather-agent';
import { deboAgent } from './agents/debo';
import { deboCompanion } from './agents/companion';
import { deboLibrarian } from './agents/librarian';
import { deboAnalyst } from './agents/analyst';

export const mastra = new Mastra({
  workflows: { 
    weatherWorkflow, 
    dailyAnalysis: dailyAnalysisWorkflow,
    journalProcessing: journalProcessingWorkflow 
  },
  agents: { 
    weatherAgent, 
    debo: deboAgent, 
    deboCompanion, 
    deboLibrarian, 
    deboAnalyst 
  },
  backgroundTasks: {
    // @ts-ignore
    enabled: true,
    globalConcurrency: 10,
    perAgentConcurrency: 5,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: ":memory:",
  }),
  // In-memory LibSQL satisfies Mastra Memory without generating local database files.
  // To persist memory in production on Cloudflare, you should install @mastra/cloudflare-d1 
  // and pass the env.DB binding dynamically in your route handlers.
});
