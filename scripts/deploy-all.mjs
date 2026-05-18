#!/usr/bin/env bun

import { $ } from "bun";

const apps = [
  { name: "web", package: "@debo/web", required: true },
  { name: "app", package: "@debo/app", required: true },
  { name: "api", package: "@debo/api", required: false },
  { name: "agents", package: "@debo/agents", required: false },
  { name: "voice", package: "@debo/voice-worker", required: false },
];

console.log("=== Debo Monorepo Deploy ===\n");

// Step 1: Build packages
console.log("Building shared packages...");
try {
  await $`bun run build:packages`;
  console.log("Packages built successfully.\n");
} catch (e) {
  console.error("Failed to build packages.");
  process.exit(1);
}

// Step 2: Deploy each app
for (const app of apps) {
  console.log(`Deploying ${app.name} (${app.package})...`);
  try {
    await $`bun run deploy:${app.name}`;
    console.log(`${app.name} deployed successfully.\n`);
  } catch (e) {
    if (app.required) {
      console.error(`Failed to deploy required app: ${app.name}`);
      process.exit(1);
    } else {
      console.log(`Skipping ${app.name} (not yet extracted or deploy failed).\n`);
    }
  }
}

console.log("=== Deploy complete ===");
