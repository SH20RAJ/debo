import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";
import { normalizeGarminSleep } from "./health-layer";

export class GarminConnector implements Connector {
  id = "garmin";
  name = "Garmin";
  category = "health" as const;

  async connect(context: ConnectorContext, params: { token: string }) {
    return {
      success: true,
      metadata: { connectedAt: new Date().toISOString() },
    };
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    const rawGarmin = {
      startTimeInSeconds: Math.floor((Date.now() - 8 * 3600 * 1000) / 1000),
      durationInSeconds: 8 * 3600,
      deepSleepDurationInSeconds: 100 * 60,
      remSleepDurationInSeconds: 110 * 60,
      sleepScore: 89,
    };

    const normalizedSleepObj = normalizeGarminSleep(rawGarmin);

    const events: Omit<NormalizedEvent, "id" | "userId">[] = [
      {
        source: "garmin",
        category: "health",
        eventType: "garmin.sleep_completed",
        timestamp: normalizedSleepObj.endTime,
        summary: `Sleep completed: 8.0 hours. Sleep Score: 89.`,
        metadata: {
          startTime: normalizedSleepObj.startTime.toISOString(),
          endTime: normalizedSleepObj.endTime.toISOString(),
          durationSeconds: normalizedSleepObj.durationSeconds,
          sleepScore: normalizedSleepObj.sleepScore,
        },
        rawPayload: rawGarmin,
      }
    ];

    return { events };
  }

  async healthCheck(context: ConnectorContext) {
    return { healthy: true };
  }
}
