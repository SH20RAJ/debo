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
const buildIdMarker = "nextServer=new import_next_server.default.default(";
const runtimePatchMarker = "__DEBO_OPENNEXT_RUNTIME_PATCH__";

const buildId = JSON.stringify((await readFile(".next/BUILD_ID", "utf8")).trim());
const nextFontManifest = await readJson(".next/server/next-font-manifest.json");
const pagesManifest = await readJson(".next/server/pages-manifest.json");
const appPathsManifest = await readJson(".next/server/app-paths-manifest.json");
const middlewareManifest = await readJson(".next/server/middleware-manifest.json");
const prefetchHints = await readJson(".next/server/prefetch-hints.json");
const prerenderManifest = await readJson(".next/prerender-manifest.json");
const routesManifest = await readJson(".next/routes-manifest.json");

const manifestTextMap = await readManifestTextMap([
  ".next/prerender-manifest.json",
  ".next/routes-manifest.json",
  ".next/server/app-paths-manifest.json",
  ".next/server/functions-config-manifest.json",
  ".next/server/middleware-manifest.json",
  ".next/server/next-font-manifest.json",
  ".next/server/pages-manifest.json",
  ".next/server/prefetch-hints.json",
]);

const enabledDirectories = JSON.stringify({
  app: Object.keys(appPathsManifest).length > 0,
  pages: Object.keys(pagesManifest).length > 0,
});

const proto = "import_next_server.default.default.prototype";

const manifestFilePatch = `var __deboInlineManifests=/* ${manifestFilePatchMarker} */${JSON.stringify(manifestTextMap)};function __deboNormalizeManifestPath(path2){let value=String(path2||"").replace(/^file:/,"").replace(/\\\\/g,"/");return value.startsWith("/")?value.slice(1):value}function __deboLoadInlineManifest(path2,skipParse){let key=__deboNormalizeManifestPath(path2),raw=__deboInlineManifests[key];if(raw===undefined){for(let candidate in __deboInlineManifests)if(key.endsWith(candidate)){raw=__deboInlineManifests[candidate];break}}return raw===undefined?undefined:skipParse?raw:JSON.parse(raw)}`;

const runtimePatch = `__deboRuntimePatch=(/* ${runtimePatchMarker} */${proto}.loadInstrumentationModule=async function(){return undefined;},${proto}.loadNodeMiddleware=async function(){return undefined;},${proto}.getBuildId=function(){return ${buildId};},${proto}.getEnabledDirectories=function(){return ${enabledDirectories};},${proto}.getNextFontManifest=function(){return ${JSON.stringify(nextFontManifest)};},${proto}.getPagesManifest=function(){return ${JSON.stringify(pagesManifest)};},${proto}.getAppPathsManifest=function(){return ${JSON.stringify(appPathsManifest)};},${proto}.getMiddlewareManifest=function(){return ${JSON.stringify(middlewareManifest)};},${proto}.getPrefetchHints=function(){return ${JSON.stringify(prefetchHints)};},${proto}.getPrerenderManifest=function(){return ${JSON.stringify(prerenderManifest)};},${proto}.getRoutesManifest=function(){return ${JSON.stringify(routesManifest)};},0),`;

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return {};
  }
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
      if (
        prefix.includes(`String(${variable}).endsWith("instrumentation.js")`) ||
        prefix.includes(`${variable}.endsWith("instrumentation.js")`) ||
        prefix.includes(`${variable}.endsWith('instrumentation.js')`)
      ) {
        return match;
      }

      return `if(String(${variable}).endsWith("instrumentation.js"))return undefined;${match}`;
    }
  );
}

const files = await getHandlerFiles();
console.log("Patching files:", files);

for (const file of files) {
  let source = await readFile(file, "utf8");

  if (!source.includes(requirePatch) && source.includes(requireMarker)) {
    source = source.replace(requireMarker, `${requirePatch}var __esm=`);
  }

  source = source.replace(
    /function setNextjsServerWorkingDirectory\(\)\s*\{\s*process\.chdir\(""\);?\s*\}/g,
    chdirPatch
  );
  source = patchDynamicRequire(source);
  source = source.replace(/cacheHandler\s*:\s*cacheHandlerPath,\s*/g, "");
  source = replaceUntil(
    source,
    instrumentationStart,
    instrumentationEnd,
    instrumentationPatch
  );

  if (!source.includes(manifestFilePatchMarker) && source.includes(manifestLoaderMarker)) {
    source = source.replace(
      manifestLoaderMarker,
      `${manifestFilePatch}${manifestLoaderMarker}let deboInlineManifest=__deboLoadInlineManifest(path2,skipParse);if(deboInlineManifest!==undefined)return deboInlineManifest;`
    );
  }

  if (!source.includes(runtimePatchMarker) && source.includes(buildIdMarker)) {
    source = source.replace(buildIdMarker, `${runtimePatch}${buildIdMarker}`);
  }

  await writeFile(file, source);
}
