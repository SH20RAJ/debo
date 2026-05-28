"use client";

import { StackClientApp } from "@stackframe/stack";

const PLACEHOLDER_UUID = "00000000-0000-0000-0000-000000000000";

export const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || PLACEHOLDER_UUID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "pck_build_time_placeholder",
  tokenStore: "nextjs-cookie",
});
