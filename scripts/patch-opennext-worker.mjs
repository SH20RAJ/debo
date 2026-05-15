import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const serverFunctionsDir = ".open-next/server-functions";
const workerFile = ".open-next/worker.js";

async function getHandlerFiles() {
  const handlers = [workerFile];
  try {
    const dirs = await readdir(serverFunctionsDir);
    for (const dir of dirs) {
      const handlerPath = join(serverFunctionsDir, dir, "handler.mjs");
      const indexPath = join(serverFunctionsDir, dir, "index.mjs");

      for (const path of [handlerPath, indexPath]) {
        try {
          await readFile(path);
          handlers.push(path);
        } catch {
          // No file at this path.
        }
      }
    }
  } catch (error) {
    console.warn("Could not read server-functions directory:", error.message);
  }
  return handlers;
}

const requireMarker = "var __esm=";
const requirePatch = "__require.resolve ??= (path) => path;";
const chdirPatch = "function setNextjsServerWorkingDirectory(){}";
const instrumentationStart =
  "async function getInstrumentationModule(";
const instrumentationEnd = "var instrumentationModulePromise=null;";
const instrumentationPatch = "async function getInstrumentationModule(){return undefined}";
const manifestLoaderMarker =
  "function loadManifest(path2,shouldCache=!0,cache=sharedCache,skipParse=!1,handleMissing){";
const manifestFilePatchMarker = "__DEBO_OPENNEXT_MANIFEST_FILE_PATCH__";
const evalManifestPatchMarker = "__DEBO_OPENNEXT_EVAL_MANIFEST_PATCH__";
const runtimePatchMarker = "__DEBO_OPENNEXT_RUNTIME_PATCH__";
const bundledRequirePatchMarker = "__DEBO_OPENNEXT_BUNDLED_REQUIRE_PATCH__";
const mainWorkerRouterMarker = "__DEBO_OPENNEXT_SPLIT_WORKER_ROUTER__";

const buildId = JSON.stringify((await readFile(".next/BUILD_ID", "utf8")).trim());
const nextFontManifest = await readJson(".next/server/next-font-manifest.json");
const pagesManifest = await readJson(".next/server/pages-manifest.json");
const appPathsManifest = await readJson(".next/server/app-paths-manifest.json");
const middlewareManifest = await readJson(".next/server/middleware-manifest.json");
const prefetchHints = await readJson(".next/server/prefetch-hints.json");
const prerenderManifest = await readJson(".next/prerender-manifest.json");
const routesManifest = await readJson(".next/routes-manifest.json");

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

const enabledDirectories = JSON.stringify({
  app: Object.keys(appPathsManifest).length > 0,
  pages: Object.keys(pagesManifest).length > 0,
});

const proto = "import_next_server.default.default.prototype";

const manifestFilePatch = `var __deboInlineManifests=/* ${manifestFilePatchMarker} */${JSON.stringify(manifestTextMap)};function __deboNormalizeManifestPath(path2){let value=String(path2||"").replace(/^file:/,"").replace(/\\\\/g,"/");return value.startsWith("/")?value.slice(1):value}function __deboLoadInlineManifest(path2,skipParse){let key=__deboNormalizeManifestPath(path2),raw=__deboInlineManifests[key];if(raw===undefined){for(let candidate in __deboInlineManifests)if(key.endsWith(candidate)){raw=__deboInlineManifests[candidate];break}}return raw===undefined?undefined:skipParse?raw:JSON.parse(raw)}function __deboEvalInlineManifest(path2){let raw=__deboLoadInlineManifest(path2,true);if(raw===undefined)return undefined;let match=raw.match(/globalThis\\.__RSC_MANIFEST\\[(["'])(.*?)\\1\\]\\s*=\\s*([\\s\\S]*?)\\s*;?\\s*$/);if(!match)return undefined;let ctx={process:{env:{NEXT_DEPLOYMENT_ID:process.env.NEXT_DEPLOYMENT_ID}},__RSC_MANIFEST:{}};ctx.__RSC_MANIFEST[match[2]]=JSON.parse(match[3]);return ctx}function __deboNormalizeAppPage(page){let value=String(page||"/").replace(/\\\\/g,"/").replace(/\\/route$/,"").replace(/\\/page$/,"")||"/";value=value.replace(/\\/(?:\\([^/]+\\)|@[^/]+)(?=\\/|$)/g,"");return value||"/"}function __deboEnsureManifestSingleton(page,clientReferenceManifest,serverActionsManifest){if(!clientReferenceManifest||!serverActionsManifest)return;let sym=Symbol.for("next.server.manifests"),serverActions={encryptionKey:serverActionsManifest.encryptionKey,node:Object.assign(Object.create(null),serverActionsManifest.node),edge:Object.assign(Object.create(null),serverActionsManifest.edge)},normalized=__deboNormalizeAppPage(page),current=globalThis[sym];if(current){current.clientReferenceManifestsPerRoute?.set(normalized,clientReferenceManifest);current.proxiedClientReferenceManifest=clientReferenceManifest;current.serverActionsManifest=serverActions;return}globalThis[sym]={clientReferenceManifestsPerRoute:new Map([[normalized,clientReferenceManifest]]),proxiedClientReferenceManifest:clientReferenceManifest,serverActionsManifest:serverActions,serverModuleMap:new Proxy({},{get(){return undefined}})}}globalThis.__deboLoadInlineManifest=__deboLoadInlineManifest;globalThis.__deboEvalInlineManifest=__deboEvalInlineManifest;globalThis.__deboEnsureManifestSingleton=__deboEnsureManifestSingleton;`;

function runtimePatchFor(protoPath) {
  return `__deboRuntimePatch=(/* ${runtimePatchMarker} */${protoPath}.loadInstrumentationModule=async function(){return undefined;},${protoPath}.runInstrumentationHookIfAvailable=async function(){return undefined;},${protoPath}.loadNodeMiddleware=async function(){return undefined;},${protoPath}.loadCustomCacheHandlers=async function(){return undefined;},${protoPath}.getBuildId=function(){return ${buildId};},${protoPath}.getEnabledDirectories=function(){return ${enabledDirectories};},${protoPath}.getNextFontManifest=function(){return ${JSON.stringify(nextFontManifest)};},${protoPath}.getPagesManifest=function(){return ${JSON.stringify(pagesManifest)};},${protoPath}.getAppPathsManifest=function(){return ${JSON.stringify(appPathsManifest)};},${protoPath}.getMiddlewareManifest=function(){return ${JSON.stringify(middlewareManifest)};},${protoPath}.getPrefetchHints=function(){return ${JSON.stringify(prefetchHints)};},${protoPath}.getPrerenderManifest=function(){return ${JSON.stringify(prerenderManifest)};},${protoPath}.getRoutesManifest=function(){return ${JSON.stringify(routesManifest)};},0),`;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return {};
  }
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

async function readManifestTextMap(paths) {
  const entries = await Promise.all(
    paths.map(async (path) => [path, await readTextIfExists(path)])
  );

  return Object.fromEntries(entries.filter(([, contents]) => contents !== undefined));
}

async function readTextIfExists(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function replaceUntil(source, start, end, replacement) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) return source;

  const endIndex = source.indexOf(end, startIndex);
  if (endIndex === -1) return source;

  return `${source.slice(0, startIndex)}${replacement}${source.slice(endIndex)}`;
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

function patchBundledDynamicRequire(source) {
  if (source.includes(bundledRequirePatchMarker)) return source;

  const entries = [];
  const suffixEntries = [];
  const seenKeys = new Set();
  const seenSuffixes = new Set();
  const moduleRegex =
    /var\s+([A-Za-z_$][\w$]*)\s*=\s*__commonJS\(\{\s*["']([^"']*\.open-next\/server-functions\/[^"']+?\/\.next\/server\/[^"']+?\.js)["']/g;
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

  const bundledRequirePatch = `var __deboBundledRequireMap=/* ${bundledRequirePatchMarker} */{${entries.join(",")}};var __deboBundledRequireSuffixMap={${suffixEntries.join(",")}};globalThis.__deboBundledRequire=function(path2){let key=String(path2||"").replace(/^file:/,"").replace(/\\\\/g,"/"),openNextIndex=key.indexOf(".open-next/server-functions/"),nextServerIndex=-1;if(openNextIndex>=0){key=key.slice(openNextIndex);nextServerIndex=key.indexOf("/.next/server/")}else{nextServerIndex=key.indexOf("/.next/server/");if(nextServerIndex>=0)key=".open-next/server-functions/default"+key.slice(nextServerIndex)}let loader=__deboBundledRequireMap[key];if(!loader&&nextServerIndex>=0)loader=__deboBundledRequireSuffixMap[key.slice(key.indexOf("/.next/server/"))];return loader?loader():undefined};`;

  return source.replace(/setNodeEnv\(\);/, `${bundledRequirePatch}setNodeEnv();`);
}

function patchMainWorkerRouter(file, source) {
  if (file !== workerFile || source.includes(mainWorkerRouterMarker)) return source;

  const marker = "            // - `Request`s are handled by the Next server\n";
  const routerPatch = `            // ${mainWorkerRouterMarker}\n            if ((url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/")) && env.DASHBOARD_WORKER) {\n                return env.DASHBOARD_WORKER.fetch(request);\n            }\n            if ((url.pathname === "/api" || url.pathname.startsWith("/api/")) && env.API_WORKER) {\n                return env.API_WORKER.fetch(request);\n            }\n`;

  return source.includes(marker)
    ? source.replace(marker, `${routerPatch}${marker}`)
    : source;
}

function patchNextServerRuntime(source) {
  if (source.includes(runtimePatchMarker)) return source;

  const constructors = [
    {
      pattern: /nextServer\s*=\s*new import_next_server\.default\.default\(/,
      protoPath: "import_next_server.default.default.prototype",
    },
    {
      pattern: /nextServer\s*=\s*new NextServer\.default\(/,
      protoPath: "NextServer.default.prototype",
    },
  ];

  for (const constructor of constructors) {
    if (constructor.pattern.test(source)) {
      return source.replace(
        constructor.pattern,
        (match) => `${runtimePatchFor(constructor.protoPath)}${match}`
      );
    }
  }

  return source;
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

async function listRouteModuleFiles(functionName) {
  const root = join(serverFunctionsDir, functionName, ".next/server/app");
  const files = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (/\/(?:page|route)\.js$/.test(path.replace(/\\/g, "/"))) {
        files.push(path.replace(/\\/g, "/"));
      }
    }
  }

  await walk(root);
  return files.sort();
}

async function listSplitRouteModules(functionName) {
  const modules = (await listRouteModuleFiles(functionName)).map((file) => ({
    functionName,
    file,
  }));

  if (functionName !== "dashboard") {
    return modules;
  }

  const defaultRouteFiles = await listRouteModuleFiles("default");
  const dashboardFallbackRoutes = [
    "/.next/server/app/(auth)/",
    "/.next/server/app/(marketing)/",
    "/.next/server/app/handler/",
    "/.next/server/app/_not-found/",
  ];

  for (const file of defaultRouteFiles) {
    if (dashboardFallbackRoutes.some((route) => file.includes(route))) {
      modules.push({ functionName: "default", file });
    }
  }

  return modules;
}

async function splitWorkerSource(functionName) {
  const handlerPath = `./server-functions/${functionName}/index.mjs`;
  const routeModules = await listSplitRouteModules(functionName);
  const routeMapEntries = routeModules
    .map(({ file }) => {
      const importPath = `./${file.slice(".open-next/".length)}`;
      const key = `.open-next/${file.slice(".open-next/".length)}`;
      return `${JSON.stringify(key)}:()=>require(${JSON.stringify(importPath)})`;
    })
    .join(",");
  const routeSuffixEntries = [];
  const seenSuffixes = new Set();
  for (const { file } of routeModules) {
    const key = `.open-next/${file.slice(".open-next/".length)}`;
    const nextServerIndex = key.indexOf("/.next/server/");
    if (nextServerIndex === -1) continue;

    const suffix = key.slice(nextServerIndex);
    if (seenSuffixes.has(suffix)) continue;
    seenSuffixes.add(suffix);
    routeSuffixEntries.push(
      `${JSON.stringify(suffix)}:${JSON.stringify(key)}`
    );
  }

  return `//@ts-expect-error: Will be resolved by wrangler build
import { handleCdnCgiImageRequest, handleImageRequest } from "./cloudflare/images.js";
//@ts-expect-error: Will be resolved by wrangler build
import { runWithCloudflareRequestContext } from "./cloudflare/init.js";
//@ts-expect-error: Will be resolved by wrangler build
import { maybeGetSkewProtectionResponse } from "./cloudflare/skew-protection.js";
// @ts-expect-error: Will be resolved by wrangler build
import { handler as middlewareHandler } from "./middleware/handler.mjs";
// @ts-expect-error: Will be resolved by wrangler build
import { handler as serverHandler } from "${handlerPath}";

const __deboRouteModules = {${routeMapEntries}};
const __deboRouteModuleSuffixes = {${routeSuffixEntries.join(",")}};
const __deboPreviousBundledRequire = globalThis.__deboBundledRequire;
globalThis.__deboBundledRequire = function(path2) {
    let key = String(path2 || "").replace(/^file:/, "").replace(/\\\\/g, "/");
    let nextServerIndex = -1;
    const openNextIndex = key.indexOf(".open-next/server-functions/");
    if (openNextIndex >= 0) {
        key = key.slice(openNextIndex);
        nextServerIndex = key.indexOf("/.next/server/");
    } else {
        nextServerIndex = key.indexOf("/.next/server/");
        if (nextServerIndex >= 0) {
            key = ".open-next/server-functions/${functionName}" + key.slice(nextServerIndex);
        }
    }
    let loader = Object.prototype.hasOwnProperty.call(__deboRouteModules, key)
        ? __deboRouteModules[key]
        : undefined;
    if (!loader && nextServerIndex >= 0) {
        const suffix = key.slice(key.indexOf("/.next/server/"));
        const suffixKey = __deboRouteModuleSuffixes[suffix];
        loader = suffixKey ? __deboRouteModules[suffixKey] : undefined;
    }
    return loader ? loader() : __deboPreviousBundledRequire?.(path2);
};

export default {
    async fetch(request, env, ctx) {
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
            const response = maybeGetSkewProtectionResponse(request);
            if (response) {
                return response;
            }
            const url = new URL(request.url);
            if (url.pathname.startsWith("/cdn-cgi/image/")) {
                return handleCdnCgiImageRequest(url, env);
            }
            if (url.pathname ===
                \`\${globalThis.__NEXT_BASE_PATH__}/_next/image\${globalThis.__TRAILING_SLASH__ ? "/" : ""}\`) {
                return await handleImageRequest(url, request.headers, env);
            }
            const reqOrResp = await middlewareHandler(request, env, ctx);
            if (reqOrResp instanceof Response) {
                return reqOrResp;
            }
            return serverHandler(reqOrResp, env, ctx, request.signal);
        });
    },
};
`;
}

const files = await getHandlerFiles();
console.log("Patching files:", files);

for (const file of files) {
  let source = await readFile(file, "utf8");

  if (!source.includes(requirePatch) && source.includes(requireMarker)) {
    source = source.replace(requireMarker, `${requirePatch}var __esm=`);
  }

  source = source.replace(
    /function setNextjsServerWorkingDirectory\(\)\s*\{\s*process\.chdir\([^)]*\);?\s*\}/g,
    chdirPatch
  );
  source = patchDynamicRequire(source);
  source = patchBundledDynamicRequire(source);
  source = patchMainWorkerRouter(file, source);
  source = source.replace(/cacheHandler\s*:\s*cacheHandlerPath,\s*/g, "");
  source = replaceUntil(
    source,
    instrumentationStart,
    instrumentationEnd,
    instrumentationPatch
  );

  source = patchManifestLoader(source);
  source = patchManifestSingletonHydration(source);

  source = patchNextServerRuntime(source);

  if (
    source.includes(runtimePatchMarker) &&
    !source.includes(".loadCustomCacheHandlers=async function(){return undefined;}")
  ) {
    for (const protoPath of [proto, "NextServer.default.prototype"]) {
      source = source.replace(
        `${protoPath}.loadNodeMiddleware=async function(){return undefined;},`,
        `${protoPath}.loadNodeMiddleware=async function(){return undefined;},${protoPath}.loadCustomCacheHandlers=async function(){return undefined;},`
      );
    }
  }

  if (
    source.includes(runtimePatchMarker) &&
    !source.includes(".runInstrumentationHookIfAvailable=async function(){return undefined;}")
  ) {
    for (const protoPath of [proto, "NextServer.default.prototype"]) {
      source = source.replace(
        `${protoPath}.loadInstrumentationModule=async function(){return undefined;},`,
        `${protoPath}.loadInstrumentationModule=async function(){return undefined;},${protoPath}.runInstrumentationHookIfAvailable=async function(){return undefined;},`
      );
    }
  }

  await writeFile(file, source);
}

await writeFile(".open-next/dashboard-worker.js", await splitWorkerSource("dashboard"));
await writeFile(".open-next/api-worker.js", await splitWorkerSource("api"));
