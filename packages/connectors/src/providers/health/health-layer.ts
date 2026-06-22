import { z } from "zod";

export const HealthCategorySchema = z.enum(["sleep", "heart_rate", "workout", "calories", "steps", "stress", "recovery"]);
export type HealthCategory = z.infer<typeof HealthCategorySchema>;

export interface StandardizedSleepEvent {
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  deepSleepSeconds?: number;
  remSleepSeconds?: number;
  sleepScore?: number;
}

export interface StandardizedWorkoutEvent {
  activityType: string; // 'run', 'swim', 'cycling'
  durationSeconds: number;
  caloriesBurned: number;
  averageHeartRate?: number;
  distanceMeter?: number;
}

export function normalizeFitbitSleep(rawSleepObj: any): StandardizedSleepEvent {
  const summary = rawSleepObj.summary || {};
  return {
    startTime: new Date(rawSleepObj.startTime),
    endTime: new Date(rawSleepObj.endTime),
    durationSeconds: (rawSleepObj.duration || 0) / 1000,
    deepSleepSeconds: (summary.deep?.minutes || 0) * 60,
    remSleepSeconds: (summary.rem?.minutes || 0) * 60,
    sleepScore: rawSleepObj.efficiency ?? undefined,
  };
}

export function normalizeGarminSleep(rawGarminObj: any): StandardizedSleepEvent {
  return {
    startTime: new Date(rawGarminObj.startTimeInSeconds * 1000),
    endTime: new Date((rawGarminObj.startTimeInSeconds + rawGarminObj.durationInSeconds) * 1000),
    durationSeconds: rawGarminObj.durationInSeconds,
    deepSleepSeconds: rawGarminObj.deepSleepDurationInSeconds,
    remSleepSeconds: rawGarminObj.remSleepDurationInSeconds,
    sleepScore: rawGarminObj.sleepScore,
  };
}
