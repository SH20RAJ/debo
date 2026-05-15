import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
});

config.default.minify = true;

const cloudflareNodeFunction = {
  override: config.default.override,
  routePreloadingBehavior: config.default.routePreloadingBehavior,
};

config.functions = {
  api: {
    ...cloudflareNodeFunction,
    minify: true,
    patterns: ["/api/*"],
    routes: [
      "app/api/ai/command/route",
      "app/api/ai/copilot/route",
      "app/api/test/route",
      "app/api/capture/media/[...key]/route",
      "app/api/capture/media/route",
      "app/api/chat/history/route",
      "app/api/chat/import/route",
      "app/api/chat/route",
      "app/api/chat/threads/route",
      "app/api/connectors/[id]/route",
      "app/api/connectors/[id]/sync/route",
      "app/api/connectors/route",
      "app/api/livekit/token/route",
      "app/api/mcp/messages/route",
      "app/api/mcp/route",
      "app/api/uploadthing/route",
      "app/api/webhooks/stack/route",
    ],
  },
  dashboard: {
    ...cloudflareNodeFunction,
    minify: true,
    patterns: ["/dashboard", "/dashboard/*"],
    routes: [
      "app/(dashboard)/dashboard/ask/page",
      "app/(dashboard)/dashboard/capture/page",
      "app/(dashboard)/dashboard/chat/page",
      "app/(dashboard)/dashboard/connectors/page",
      "app/(dashboard)/dashboard/insights/page",
      "app/(dashboard)/dashboard/journal/[id]/page",
      "app/(dashboard)/dashboard/journal/audio/[id]/page",
      "app/(dashboard)/dashboard/journal/text/[id]/page",
      "app/(dashboard)/dashboard/journal/video/[id]/page",
      "app/(dashboard)/dashboard/journals/page",
      "app/(dashboard)/dashboard/mcp/page",
      "app/(dashboard)/dashboard/memories/page",
      "app/(dashboard)/dashboard/page",
      "app/(dashboard)/dashboard/settings/page",
      "app/(dashboard)/dashboard/talk/page",
    ],
  },
};

export default config;
