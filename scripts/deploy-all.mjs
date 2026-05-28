#!/usr/bin/env bun

import { $ } from "bun";

const timestamp = () => new Date().toISOString().slice(11, 19);
const netlifySiteId = process.env.NETLIFY_SITE_ID || process.env.NETLIFY_APP_SITE_ID;
const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN;

const REQUIRED = [
  { name: "landing-page", script: "deploy:landing", label: "Landing page (debo.life)" },
  { name: "website", script: "deploy:website", label: "Full-stack website (app.debo.life)" },
];

console.log(`[${timestamp()}] === Debo Monorepo Deploy ===\n`);

if (!netlifySiteId || !netlifyAuthToken) {
  console.error(`[${timestamp()}] FATAL: Netlify deploy is not configured.`);
  console.error("Set NETLIFY_SITE_ID (or NETLIFY_APP_SITE_ID) and NETLIFY_AUTH_TOKEN before running bun run deploy.");
  console.error("This prevents Netlify CLI from auto-creating a random site and failing during Blobs upload.\n");
  process.exit(1);
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
