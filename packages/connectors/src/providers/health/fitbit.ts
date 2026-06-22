import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";
import { normalizeFitbitSleep } from "./health-layer";

export class FitbitConnector implements Connector {
  id = "fitbit";
  name = "Fitbit";
  category = "health" as const;

  async connect(context: ConnectorContext, params: { token: string }) {
    return {
      success: true,
      metadata: { connectedAt: new Date().toISOString() },
    };
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    const rawSleep = {
      startTime: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: 8 * 3600 * 1000,
      efficiency: 92,
      summary: {
        deep: { minutes: 90 },
        rem: { minutes: 120 },
      },
    };

    const normalizedSleepObj = normalizeFitbitSleep(rawSleep);

    const events: Omit<NormalizedEvent, "id" | "userId">[] = [
      {
        source: "fitbit",
        category: "health",
        eventType: "fitbit.sleep_completed",
        timestamp: normalizedSleepObj.endTime,
        summary: `Sleep completed: 8.0 hours. Sleep Score: 92.`,
        metadata: {
          startTime: normalizedSleepObj.startTime.toISOString(),
          endTime: normalizedSleepObj.endTime.toISOString(),
          durationSeconds: normalizedSleepObj.durationSeconds,
          sleepScore: normalizedSleepObj.sleepScore,
        },
        rawPayload: rawSleep,
      }
    ];

    return { events };
  }

  async healthCheck(context: ConnectorContext) {
    return { healthy: true };
  }
}
