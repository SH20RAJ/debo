import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
});

config.cloudflare = {
  useWorkerdCondition: false
};

config.default.minify = false;

export default config;
