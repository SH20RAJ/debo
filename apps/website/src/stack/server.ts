import "server-only";
import { StackServerApp } from "@stackframe/stack";

const PLACEHOLDER_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || PLACEHOLDER_UUID;
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "pck_build_time_placeholder";
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY || "ssk_build_time_placeholder";

let _app: StackServerApp | null = null;
function getApp(): StackServerApp {
  if (!_app) {
    _app = new StackServerApp({
      projectId,
      publishableClientKey,
      secretServerKey,
      tokenStore: "nextjs-cookie",
    });
  }
  return _app;
}

const proxy = new Proxy({} as StackServerApp, {
  get(_target, prop) {
    const app = getApp();
    const value = (app as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof value === "function" ? (value as Function).bind(app) : value;
  },
});

export const stackServerApp: StackServerApp = proxy;
