#!/usr/bin/env bun

import { $ } from "bun";

const timestamp = () => new Date().toISOString().slice(11, 19);

const REQUIRED = [
  { name: "web", script: "deploy:web", label: "Landing page (debo.life)" },
  { name: "app", script: "deploy:app", label: "Dashboard (app.debo.life)" },
];

const OPTIONAL = [
  { name: "api", script: "deploy:api", label: "API service" },
  { name: "agents", script: "deploy:agents", label: "Mastra agents" },
  { name: "voice", script: "deploy:voice", label: "Voice worker" },
];

console.log(`[${timestamp()}] === Debo Monorepo Deploy ===\n`);

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

// Step 3: Deploy optional apps (skip gracefully)
for (const app of OPTIONAL) {
  console.log(`[${timestamp()}] Deploying ${app.label}...`);
  try {
    await $`bun run ${app.script}`;
    console.log(`[${timestamp()}] ${app.label} deployed.\n`);
  } catch {
    console.log(`[${timestamp()}] Skipped ${app.label} (not yet extracted).\n`);
  }
}

console.log(`[${timestamp()}] === Deploy complete ===`);
