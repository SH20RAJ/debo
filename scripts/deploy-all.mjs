#!/usr/bin/env bun

import { $ } from "bun";

const timestamp = () => new Date().toISOString().slice(11, 19);

const REQUIRED = [
  { name: "landing-page", script: "deploy:landing", label: "Landing page (debo.life → Cloudflare)" },
  { name: "website", script: "deploy:website", label: "Full-stack website (app.debo.life → Vercel)" },
];

console.log(`[${timestamp()}] === Debo Monorepo Deploy ===\n`);

if (!process.env.VERCEL_TOKEN) {
  console.log(`[${timestamp()}] WARNING: VERCEL_TOKEN not set. Downstream deploy-vercel-website will fall back to local credentials.`);
}

// Step 1: Build packages
console.log(`[${timestamp()}] Building shared packages...`);
try {
  await $`bun run build:packages`;
  console.log(`[${timestamp()}] Packages built.\n`);
} catch {
  console.error(`[${timestamp()}] FATAL: Package build failed.`);
  process.exit(1);
}

// Step 2: Deploy required apps
for (const app of REQUIRED) {
  console.log(`[${timestamp()}] Deploying ${app.label}...`);
  try {
    await $`bun run ${app.script}`;
    console.log(`[${timestamp()}] ${app.label} deployed.\n`);
  } catch {
    console.error(`[${timestamp()}] FATAL: ${app.label} deploy failed.`);
    process.exit(1);
  }
}

console.log(`[${timestamp()}] === Deploy complete ===`);
