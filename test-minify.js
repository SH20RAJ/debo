#!/usr/bin/env node
import{build as r}from"./build.js";const u=process.argv[2];u!=="build"&&i();const s=p();Object.keys(s).includes("--help")&&i(),await r(s["--config-path"],s["--node-externals"],s["--dangerously-use-unsupported-next-version"]!==void 0);function p(){return process.argv.slice(2).reduce((o,t,e,n)=>(t.startsWith("--")&&(n[e+1]&&n[e+1].startsWith("-")?o[t]=void 0:n[e+1]?o[t]=n[e+1]:n[e+1]||(o[t]=void 0)),o),{})}function i(){console.log(`Unknown command

Usage:
  npx open-next build
You can use a custom config path here
  npx open-next build --config-path ./path/to/open-next.config.ts
You can configure externals for the esbuild compilation of the open-next.config.ts file
  npx open-next build --node-externals aws-sdk,sharp,sqlite3
`),process.exit(1)}
