import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	serverExternalPackages: [
		"@libsql/client",
		"@libsql/hrana-client",
		"@libsql/isomorphic-ws",
		"xxhash-wasm",
		"@mastra/libsql",
		"@mastra/duckdb",
		"@duckdb/node-api",
		"@duckdb/node-bindings-darwin-x64",
		"@duckdb/node-bindings-darwin-arm64",
		"@duckdb/node-bindings-win32-x64",
		"@duckdb/node-bindings-linux-x64",
		"duckdb",
		"@ast-grep/napi",
		"@ast-grep/napi-darwin-arm64",
		"@ast-grep/napi-darwin-x64",
		"@ast-grep/napi-linux-x64-gnu",
		"@ast-grep/napi-linux-arm64-gnu",
	],
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
