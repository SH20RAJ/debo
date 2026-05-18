import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const bundledRequirePatchMarker = "__DEBO_OPENNEXT_BUNDLED_REQUIRE_PATCH__";
const manifestFilePatchMarker = "__DEBO_OPENNEXT_MANIFEST_FILE_PATCH__";
const evalManifestPatchMarker = "__DEBO_OPENNEXT_EVAL_MANIFEST_PATCH__";

const workers = [
  {
    label: "dashboard",
    config: "wrangler.dashboard.jsonc",
    outdir: ".wrangler-bundles/dashboard",
  },
  {
    label: "api",
    config: "wrangler.api.jsonc",
    outdir: ".wrangler-bundles/api",
  },
  {
    label: "main",
    config: "wrangler.jsonc",
    outdir: ".wrangler-bundles/main",
  },
];

const dryRunOnly = process.env.DEBO_DEPLOY_DRY_RUN_ONLY === "1";
const baseManifestPaths = [
  ".next/app-path-routes-manifest.json",
  ".next/app-build-manifest.json",
  ".next/BUILD_ID",
  ".next/build-manifest.json",
  ".next/fallback-build-manifest.json",
  ".next/images-manifest.json",
  ".next/prerender-manifest.json",
  ".next/required-server-files.json",
  ".next/routes-manifest.json",
  ".next/server/app-paths-manifest.json",
  ".next/server/functions-config-manifest.json",
  ".next/server/middleware-manifest.json",
  ".next/server/next-font-manifest.json",
  ".next/server/pages-manifest.json",
  ".next/server/prefetch-hints.json",
  ".next/server/server-reference-manifest.json",
];

const manifestTextMap = await readManifestTextMap(await getManifestTextPaths());

const manifestFilePatch = `var __deboInlineManifests=/* ${manifestFilePatchMarker} */${JSON.stringify(manifestTextMap)};function __deboNormalizeManifestPath(path2){let value=String(path2||"").replace(/^file:/,"").replace(/\\\\/g,"/");return value.startsWith("/")?value.slice(1):value}function __deboLoadInlineManifest(path2,skipParse){let key=__deboNormalizeManifestPath(path2),raw=__deboInlineManifests[key];if(raw===undefined){for(let candidate in __deboInlineManifests)if(key.endsWith(candidate)){raw=__deboInlineManifests[candidate];break}}return raw===undefined?undefined:skipParse?raw:JSON.parse(raw)}function __deboEvalInlineManifest(path2){let raw=__deboLoadInlineManifest(path2,true);if(raw===undefined)return undefined;let match=raw.match(/globalThis\\.__RSC_MANIFEST\\[(["'])(.*?)\\1\\]\\s*=\\s*([\\s\\S]*?)\\s*;?\\s*$/);if(!match)return undefined;let ctx={process:{env:{NEXT_DEPLOYMENT_ID:process.env.NEXT_DEPLOYMENT_ID}},__RSC_MANIFEST:{}};ctx.__RSC_MANIFEST[match[2]]=JSON.parse(match[3]);return ctx}function __deboNormalizeAppPage(page){let value=String(page||"/").replace(/\\\\/g,"/").replace(/\\/route$/,"").replace(/\\/page$/,"")||"/";value=value.replace(/\\/(?:\\([^/]+\\)|@[^/]+)(?=\\/|$)/g,"");return value||"/"}function __deboEnsureManifestSingleton(page,clientReferenceManifest,serverActionsManifest){if(!clientReferenceManifest||!serverActionsManifest)return;let sym=Symbol.for("next.server.manifests"),serverActions={encryptionKey:serverActionsManifest.encryptionKey,node:Object.assign(Object.create(null),serverActionsManifest.node),edge:Object.assign(Object.create(null),serverActionsManifest.edge)},normalized=__deboNormalizeAppPage(page),current=globalThis[sym];if(current){current.clientReferenceManifestsPerRoute?.set(normalized,clientReferenceManifest);current.proxiedClientReferenceManifest=clientReferenceManifest;current.serverActionsManifest=serverActions;return}globalThis[sym]={clientReferenceManifestsPerRoute:new Map([[normalized,clientReferenceManifest]]),proxiedClientReferenceManifest:clientReferenceManifest,serverActionsManifest:serverActions,serverModuleMap:new Proxy({},{get(){return undefined}})}}globalThis.__deboLoadInlineManifest=__deboLoadInlineManifest;globalThis.__deboEvalInlineManifest=__deboEvalInlineManifest;globalThis.__deboEnsureManifestSingleton=__deboEnsureManifestSingleton;`;

function run(args) {
  const result = spawnSync("bun", ["x", "wrangler", ...args], {
    stdio: "inherit",
    env: {
      ...process.env,
      OPEN_NEXT_DEPLOY: "true",
      CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function readManifestTextMap(paths) {
  const entries = await Promise.all(
    paths.map(async (path) => [path, await readTextIfExists(path)])
  );

  return Object.fromEntries(entries.filter(([, contents]) => contents !== undefined));
}

async function getManifestTextPaths() {
  const discovered = await collectMatchingFiles(
    ".next/server/app",
    /(?:_client-reference-manifest\.js|react-loadable-manifest\.json)$/
  );

  return [...new Set([...baseManifestPaths, ...discovered])].sort();
}

async function collectMatchingFiles(root, pattern) {
  const files = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const path = join(dir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        await walk(path);
      } else if (pattern.test(path)) {
        files.push(path);
      }
    }
  }

  await walk(root);
  return files;
}

async function readTextIfExists(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function patchDynamicRequire(source) {
  return source.replace(
    /throw Error\('Dynamic require of "'\s*\+\s*([A-Za-z_$][\w$]*)\s*\+\s*'" is not supported'\);?/g,
    (match, variable, offset, fullSource) => {
      const prefix = fullSource.slice(Math.max(0, offset - 160), offset);
      if (prefix.includes("__deboBundledRequire")) {
        return match;
      }

      return `let __deboDynamicModule=globalThis.__deboBundledRequire?.(${variable});if(__deboDynamicModule!==undefined)return __deboDynamicModule;if(String(${variable}).endsWith("instrumentation.js"))return undefined;${match}`;
    }
  );
}

function patchRequireResolve(source) {
  return source.replace(
    /(var\s+(__require\d*)\s*=\s*\/\* @__PURE__ \*\/[\s\S]*?\n\}\);)(\nvar\s+__esm\d*\s*=)/g,
    (match, declaration, variable, suffix) => {
      if (match.includes(`${variable}.resolve ??=`)) return match;
      return `${declaration}\n${variable}.resolve ??= (path) => path;${suffix}`;
    }
  );
}

function patchBundledDynamicRequire(source) {
  if (source.includes(bundledRequirePatchMarker)) return source;

  const entries = [];
  const suffixEntries = [];
  const seenKeys = new Set();
  const seenSuffixes = new Set();
  const moduleRegex =
    /var\s+([A-Za-z_$][\w$]*)\s*=\s*__commonJS\d*\(\{\s*["']([^"']*\.open-next\/server-functions\/[^"']+?\/\.next\/server\/[^"']+?\.js)["']/g;
  let match;

  while ((match = moduleRegex.exec(source))) {
    const [, variable, key] = match;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    entries.push(`${JSON.stringify(key)}:()=>${variable}()`);

    const nextServerIndex = key.indexOf("/.next/server/");
    if (nextServerIndex >= 0) {
      const suffix = key.slice(nextServerIndex);
      if (!seenSuffixes.has(suffix)) {
        seenSuffixes.add(suffix);
        suffixEntries.push(`${JSON.stringify(suffix)}:()=>${variable}()`);
      }
    }
  }

  if (entries.length === 0) return source;

  const patch = `var __deboBundledRequireMap=/* ${bundledRequirePatchMarker} */{${entries.join(",")}};var __deboBundledRequireSuffixMap={${suffixEntries.join(",")}};globalThis.__deboBundledRequire=function(path2){let key=String(path2||"").replace(/^file:/,"").replace(/\\\\/g,"/"),openNextIndex=key.indexOf(".open-next/server-functions/"),nextServerIndex=-1;if(openNextIndex>=0){key=key.slice(openNextIndex);nextServerIndex=key.indexOf("/.next/server/")}else{nextServerIndex=key.indexOf("/.next/server/");if(nextServerIndex>=0){let fnName=globalThis.fnName||"default";key=".open-next/server-functions/"+fnName+key.slice(nextServerIndex)}}let loader=__deboBundledRequireMap[key];if(!loader&&nextServerIndex>=0)loader=__deboBundledRequireSuffixMap[key.slice(key.indexOf("/.next/server/"))];return loader?loader():undefined};`;

  return source.replace(/setNodeEnv\(\);/, `${patch}setNodeEnv();`);
}

function patchManifestLoader(source) {
  let patched = source.includes(manifestFilePatchMarker)
    ? source
    : source.includes("setNodeEnv();")
      ? source.replace(/setNodeEnv\(\);/, `${manifestFilePatch}setNodeEnv();`)
      : `${manifestFilePatch}${source}`;

  patched = patched.replace(
    /function loadManifest\(([^)]*)\)\s*\{/g,
    (match, params, offset, fullSource) => {
      const bodyStart = offset + match.length;
      const bodyPrefix = fullSource.slice(bodyStart, bodyStart + 240);
      if (bodyPrefix.includes("__deboLoadInlineManifest")) return match;

      const names = params.split(",").map((param) => param.split("=")[0].trim());
      const pathName = names[0] || "path2";
      const skipParseName = names[3] || "false";

      return `${match}let deboInlineManifest=globalThis.__deboLoadInlineManifest?.(${pathName},${skipParseName});if(deboInlineManifest!==undefined)return deboInlineManifest;`;
    }
  );

  return patched.replace(
    /function evalManifest\(([^)]*)\)\s*\{/g,
    (match, params, offset, fullSource) => {
      const bodyStart = offset + match.length;
      const bodyPrefix = fullSource.slice(bodyStart, bodyStart + 360);
      if (bodyPrefix.includes(evalManifestPatchMarker)) return match;

      const names = params.split(",").map((param) => param.split("=")[0].trim());
      const pathName = names[0] || "path2";

      return `${match}let deboInlineManifestContext=/* ${evalManifestPatchMarker} */globalThis.__deboEvalInlineManifest?.(${pathName});if(deboInlineManifestContext!==undefined)return deboInlineManifestContext;`;
    }
  );
}

function patchManifestSingletonHydration(source) {
  return source.replace(
    /(r6\s*=\s*\{\s*buildId:[\s\S]*?clientReferenceManifest:[\s\S]*?serverActionsManifest:[\s\S]*?\};)/g,
    (match, assignment, offset, fullSource) => {
      const suffix = fullSource.slice(offset + match.length, offset + match.length + 180);
      if (suffix.includes("__deboEnsureManifestSingleton")) return match;
      return `${assignment}globalThis.__deboEnsureManifestSingleton?.(e14,r6.clientReferenceManifest,r6.serverActionsManifest);`;
    }
  );
}

async function patchBundle(path) {
  let source = await readFile(path, "utf8");
  source = patchManifestLoader(source);
  source = patchManifestSingletonHydration(source);
  source = patchRequireResolve(source);
  source = patchDynamicRequire(source);
  source = patchBundledDynamicRequire(source);
  await writeFile(path, source);
}

async function getBundledWorkerPath(outdir) {
  const files = await readdir(outdir);
  const workerFile = files.find((file) => file.endsWith(".js"));
  if (!workerFile) {
    throw new Error(`No bundled worker JavaScript file found in ${outdir}`);
  }
  return `${outdir}/${workerFile}`;
}

for (const worker of workers) {
  await rm(worker.outdir, { force: true, recursive: true });
  await mkdir(dirname(worker.outdir), { recursive: true });

  run([
    "deploy",
    "--dry-run",
    "--outdir",
    worker.outdir,
    "--metafile",
    `${worker.outdir}/meta.json`,
    "--config",
    worker.config,
  ]);

  const bundledWorker = await getBundledWorkerPath(worker.outdir);
  await patchBundle(bundledWorker);

  if (dryRunOnly) {
    continue;
  }

  run([
    "deploy",
    bundledWorker,
    "--no-bundle",
    "--keep-vars",
    "--config",
    worker.config,
    "--message",
    `Deploy ${worker.label} OpenNext worker`,
  ]);
}
