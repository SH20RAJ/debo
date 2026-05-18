"use client";

import { useEffect } from "react";

export function StackEventTrackerGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const originalWarn = console.warn;
    const originalError = console.error;

    const shouldSuppress = (args: unknown[]) => {
      const [message, detail] = args;
      return (
        message === "EventTracker flush failed:" &&
        detail instanceof TypeError &&
        detail.message === "Failed to fetch"
      );
    };

    console.warn = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;

      originalWarn(...args);
    };

    console.error = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;

      originalError(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}
