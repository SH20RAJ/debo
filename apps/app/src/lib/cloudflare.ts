/**
 * Lightweight implementation of getCloudflareContext to avoid pulling in
 * @opennextjs/cloudflare and its CLI dependencies at runtime.
 */

interface CloudflareContext {
  env: Record<string, any>;
  cf: any;
  ctx: {
    waitUntil: (promise: Promise<any>) => void;
  };
}

const cloudflareContextSymbol = Symbol.for("__cloudflare-context__");

export function getCloudflareContext(): CloudflareContext {
  const global = globalThis as any;
  const context = global[cloudflareContextSymbol];
  
  if (!context) {
    // Fallback for local development if not properly initialized
    return {
      env: process.env,
      cf: {},
      ctx: {
        waitUntil: () => {},
      },
    };
  }
  
  return context;
}
