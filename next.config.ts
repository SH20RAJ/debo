import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	serverExternalPackages: [
		"@mastra/duckdb", 
		"@duckdb/node-api",
		"@duckdb/node-bindings-darwin-x64", 
		"@duckdb/node-bindings-darwin-arm64",
		"@duckdb/node-bindings-win32-x64",
		"@duckdb/node-bindings-linux-x64",
		"duckdb"
	],
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
