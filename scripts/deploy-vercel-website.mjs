#!/usr/bin/env bun

/**
 * Deploys apps/website to Vercel.
 *
 * Why a wrapper script:
 *   - Force a deterministic project link (no auto-create or interactive prompt).
 *   - Always run from the website package directory so Vercel detects Next.js.
 *   - Surface a clear error if VERCEL_TOKEN is missing.
 *
 * Required env vars:
 *   - VERCEL_TOKEN              required for non-interactive auth
 *   - VERCEL_ORG_ID             optional, used by `vercel pull/deploy` when linked
 *   - VERCEL_PROJECT_ID         optional, used by `vercel pull/deploy` when linked
 *
 * If VERCEL_ORG_ID/VERCEL_PROJECT_ID are unset, the script falls back to the
 * apps/website/.vercel/project.json produced by `vercel link`.
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const websiteDir = fileURLToPath(new URL("../apps/website/", import.meta.url));
const binDir = fileURLToPath(new URL("../node_modules/.bin/", import.meta.url));

function consumeFlag(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return { value: undefined, args };
  const value = args[index + 1];
  const nextArgs = args.slice(0, index).concat(args.slice(index + 2));
  return { value, args: nextArgs };
}

let args = Bun.argv.slice(2);
const tokenFlag = consumeFlag(args, "--token");
args = tokenFlag.args;

const token = tokenFlag.value || process.env.VERCEL_TOKEN;

if (!token) {
  console.error("FATAL: Vercel deploy is not configured.");
  console.error("Set VERCEL_TOKEN (create one at https://vercel.com/account/settings/tokens),");
  console.error("or pass --token <token>.");
  console.error("Optional: VERCEL_ORG_ID and VERCEL_PROJECT_ID for explicit project linking.\n");
  process.exit(1);
}

if (!existsSync(websiteDir)) {
  console.error(`FATAL: Website app directory not found: ${websiteDir}`);
  process.exit(1);
}

const env = {
  ...process.env,
  VERCEL_TOKEN: token,
  PATH: `${binDir}:${process.env.PATH ?? ""}`,
};

console.log("Deploying apps/website to Vercel (production)...");

const proc = Bun.spawn(
  ["vercel", "deploy", "--prod", "--yes", "--token", token, ...args],
  {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env,
    stdout: "inherit",
    stderr: "inherit",
  },
);

const exitCode = await proc.exited;
if (exitCode !== 0) {
  process.exit(exitCode);
}
