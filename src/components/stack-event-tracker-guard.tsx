"use client";

import { useEffect } from "react";

export function StackEventTrackerGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const originalWarn = console.warn;

    console.warn = (...args: unknown[]) => {
      const [message, detail] = args;
      const isStackEventTrackerNoise =
        message === "EventTracker flush failed:" &&
        detail instanceof TypeError &&
        detail.message === "Failed to fetch";

      if (isStackEventTrackerNoise) return;

      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
