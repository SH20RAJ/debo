#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const appDir = fileURLToPath(new URL("../apps/website/", import.meta.url));
const binDir = fileURLToPath(new URL("../apps/website/node_modules/.bin/", import.meta.url));

function consumeFlag(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return { value: undefined, args };

  const value = args[index + 1];
  const nextArgs = args.slice(0, index).concat(args.slice(index + 2));
  return { value, args: nextArgs };
}

let args = Bun.argv.slice(2);
const siteFlag = consumeFlag(args, "--site");
args = siteFlag.args;
const authFlag = consumeFlag(args, "--auth");
args = authFlag.args;

const siteId = siteFlag.value || process.env.NETLIFY_SITE_ID || process.env.NETLIFY_APP_SITE_ID;
const authToken = authFlag.value || process.env.NETLIFY_AUTH_TOKEN;

if (!siteId || !authToken) {
  console.error("FATAL: Netlify deploy is not configured.");
  console.error("Set NETLIFY_SITE_ID (or NETLIFY_APP_SITE_ID) and NETLIFY_AUTH_TOKEN.");
  console.error("Netlify Blobs upload needs both values during local deploys.\n");
  process.exit(1);
}

if (!existsSync(appDir)) {
  console.error(`FATAL: Website app directory not found: ${appDir}`);
  process.exit(1);
}

const env = {
  ...process.env,
  NETLIFY_AUTH_TOKEN: authToken,
  NETLIFY_SITE_ID: siteId,
  PATH: `${binDir}:${process.env.PATH ?? ""}`,
};

console.log(`Deploying apps/website to Netlify site ${siteId}...`);

const proc = Bun.spawn(
  ["netlify", "deploy", "--prod", "--site", siteId, "--auth", authToken, ...args],
  {
    cwd: appDir,
    env,
    stdout: "inherit",
    stderr: "inherit",
  },
);

const exitCode = await proc.exited;
if (exitCode !== 0) {
  process.exit(exitCode);
}
