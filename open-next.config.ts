import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  buildCommand: {
    // Mark @libsql/client as external — it's used by Mastra's LibSQLStore
    // but runs with :memory: which doesn't require actual libsql bindings at runtime
    externalPackages: ["@libsql/client"],
  },
});
