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

import { existsSync, rmSync } from "node:fs";
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

if (!existsSync(websiteDir)) {
  console.error(`FATAL: Website app directory not found: ${websiteDir}`);
  process.exit(1);
}

const runDeploy = async (useToken) => {
  const env = {
    ...process.env,
    PATH: `${binDir}:${process.env.PATH ?? ""}`,
  };
  if (useToken && token) {
    env.VERCEL_TOKEN = token;
  } else {
    delete env.VERCEL_TOKEN;
  }

  const rootDir = fileURLToPath(new URL("../", import.meta.url));

  // Run vercel link first to ensure the project is mapped correctly
  const linkCmd = ["vercel", "link", "--yes", "--project", "debo"];
  if (useToken && token) {
    linkCmd.push("--token", token);
  }
  const linkProc = Bun.spawn(linkCmd, {
    cwd: rootDir,
    env,
    stdout: "inherit",
    stderr: "inherit",
  });
  await linkProc.exited;

  const deployCmd = ["vercel", "deploy", "--prod", "--yes", ...args];
  if (useToken && token) {
    deployCmd.push("--token", token);
  }

  console.log(useToken && token 
    ? "Deploying apps/website to Vercel using VERCEL_TOKEN..." 
    : "Deploying apps/website to Vercel using local session credentials..."
  );

  const proc = Bun.spawn(deployCmd, {
    cwd: rootDir,
    env,
    stdout: "inherit",
    stderr: "inherit",
  });

  return await proc.exited;
};

const cleanVercelDirs = () => {
  const dirs = [
    fileURLToPath(new URL("../.vercel", import.meta.url)),
    fileURLToPath(new URL("../apps/website/.vercel", import.meta.url)),
  ];
  for (const vercelMetaDir of dirs) {
    if (existsSync(vercelMetaDir)) {
      console.log(`Removing ${vercelMetaDir} to allow linking to your Vercel account...`);
      try {
        rmSync(vercelMetaDir, { recursive: true, force: true });
      } catch (e) {
        console.warn(`Failed to remove ${vercelMetaDir}:`, e);
      }
    }
  }
};

let exitCode = 1;
if (token) {
  exitCode = await runDeploy(true);
  if (exitCode !== 0) {
    console.warn("\nWARN: Deployment with VERCEL_TOKEN failed. Attempting fallback using local CLI credentials...");
    cleanVercelDirs();
    exitCode = await runDeploy(false);
  }
} else {
  console.log("WARN: VERCEL_TOKEN not configured.");
  cleanVercelDirs();
  exitCode = await runDeploy(false);
}

if (exitCode !== 0) {
  process.exit(exitCode);
}
