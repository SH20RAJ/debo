import { readFile, writeFile } from "node:fs/promises";

const files = [
  ".open-next/server-functions/default/handler.mjs",
  ".open-next/worker.js",
];

const requireMarker = "var __esm=";
const requirePatch = "__require.resolve ??= (path) => path;";
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
const enabledDirectories = JSON.stringify({
  app: Object.keys(appPathsManifest).length > 0,
  pages: Object.keys(pagesManifest).length > 0,
});
const proto = "import_next_server.default.default.prototype";
const runtimePatch = `__deboRuntimePatch=(/* ${runtimePatchMarker} */${proto}.getBuildId=function(){return ${buildId};},${proto}.getEnabledDirectories=function(){return ${enabledDirectories};},${proto}.getNextFontManifest=function(){return ${JSON.stringify(nextFontManifest)};},${proto}.getPagesManifest=function(){return ${JSON.stringify(pagesManifest)};},${proto}.getAppPathsManifest=function(){return ${JSON.stringify(appPathsManifest)};},${proto}.getMiddlewareManifest=function(){return ${JSON.stringify(middlewareManifest)};},${proto}.getPrefetchHints=function(){return ${JSON.stringify(prefetchHints)};},${proto}.getPrerenderManifest=function(){return ${JSON.stringify(prerenderManifest)};},${proto}.getRoutesManifest=function(){return ${JSON.stringify(routesManifest)};},0),`;

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

for (const file of files) {
  let source = await readFile(file, "utf8");

  if (!source.includes(requirePatch) && source.includes(requireMarker)) {
    source = source.replace(requireMarker, `${requirePatch}var __esm=`);
  }

  if (!source.includes(runtimePatchMarker) && source.includes(buildIdMarker)) {
    source = source.replace(buildIdMarker, `${runtimePatch}${buildIdMarker}`);
  }

  await writeFile(file, source);
}
