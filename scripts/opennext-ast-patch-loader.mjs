const AST_PATCHER_PATH = "/@opennextjs/aws/dist/build/patch/astCodePatcher.js";
const DYNAMIC_REQUIRES_PATH =
  "/@opennextjs/cloudflare/dist/cli/build/patches/plugins/dynamic-requires.js";
const CREATE_SERVER_BUNDLE_PATH =
  "/@opennextjs/aws/dist/build/createServerBundle.js";
const CLOUDFLARE_CREATE_SERVER_BUNDLE_PATH =
  "/@opennextjs/cloudflare/dist/cli/build/open-next/createServerBundle.js";
const BUNDLE_NEXT_SERVER_PATH =
  "/@opennextjs/aws/dist/build/bundleNextServer.js";
const ORIGINAL_MATCHES = `const matches = once
        ? [root.find(ruleConfig)].filter((m) => m !== null)
        : root.findAll(ruleConfig);`;
const PATCHED_MATCHES = `const matches = once
        ? typeof root.find === "function"
            ? [root.find(ruleConfig)].filter((m) => m !== null)
            : root.findAll(ruleConfig).slice(0, 1)
        : root.findAll(ruleConfig);`;
const ORIGINAL_RETURN = "return node.commitEdits(edits);";
const PATCHED_RETURN = "return node.commitEdits(edits) ?? code;";
const ORIGINAL_SERVER_EXTERNALS =
  'external: ["next", "./middleware.mjs", "./next-server.runtime.prod.js"],';
const PATCHED_SERVER_EXTERNALS =
  'external: ["next", "./middleware.mjs", "./next-server.runtime.prod.js", "@ast-grep/napi", "@ast-grep/napi-*", "@ast-grep/napi-darwin-arm64", "@ast-grep/napi-darwin-x64", "@ast-grep/napi-linux-x64-gnu", "@ast-grep/napi-linux-arm64-gnu", "xxhash-wasm", "xxhash-wasm/*", "@mastra/*"],';
const ORIGINAL_CLOUDFLARE_SERVER_EXTERNALS = 'external: ["./middleware.mjs"],';
const PATCHED_CLOUDFLARE_SERVER_EXTERNALS =
  'external: ["./middleware.mjs", "@ast-grep/napi", "@ast-grep/napi-*", "@ast-grep/napi-darwin-arm64", "@ast-grep/napi-darwin-x64", "@ast-grep/napi-linux-x64-gnu", "@ast-grep/napi-linux-arm64-gnu", "xxhash-wasm", "xxhash-wasm/*", "@mastra/*"],';
const ORIGINAL_NEXT_SERVER_EXTERNALS = "const externals = [";
const PATCHED_NEXT_SERVER_EXTERNALS = 'const externals = ["@ast-grep/napi", "@ast-grep/napi-*", "@ast-grep/napi-darwin-arm64", "@ast-grep/napi-darwin-x64", "@ast-grep/napi-linux-x64-gnu", "@ast-grep/napi-linux-arm64-gnu", "xxhash-wasm", "xxhash-wasm/*", "@mastra/*", ';

const BUILD_LAMBDA_MARKER = "    // Build Lambda code";
const AST_GREP_STUB = String.raw`
    {
        const astGrepDir = path.join(outPackagePath, "node_modules", "@ast-grep");
        const astGrepStubDir = path.join(astGrepDir, "napi");
        fs.rmSync(astGrepDir, { recursive: true, force: true });
        fs.mkdirSync(astGrepStubDir, { recursive: true });
        fs.writeFileSync(
            path.join(astGrepStubDir, "index.js"),
            "module.exports={Lang:{},parse(){return{root(){return{find(){return null},findAll(){return[]}}}}}};"
        );
        fs.writeFileSync(
            path.join(astGrepStubDir, "package.json"),
            JSON.stringify({ name: "@ast-grep/napi", main: "index.js" })
        );
    }
`;

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);

  const isPatchTarget =
    url.endsWith(AST_PATCHER_PATH) ||
    url.endsWith(DYNAMIC_REQUIRES_PATH) ||
    url.endsWith(CREATE_SERVER_BUNDLE_PATH) ||
    url.endsWith(CLOUDFLARE_CREATE_SERVER_BUNDLE_PATH) ||
    url.endsWith(BUNDLE_NEXT_SERVER_PATH);

  if (isPatchTarget) {
    console.log(`[AST Patch] Targeted file: ${url}`);
  }

  if (
    !isPatchTarget ||
    result.source == null
  ) {
    return result;
  }

  const source = typeof result.source === "string"
    ? result.source
    : result.source instanceof ArrayBuffer
      ? Buffer.from(result.source).toString("utf8")
      : ArrayBuffer.isView(result.source)
        ? Buffer.from(
            result.source.buffer,
            result.source.byteOffset,
            result.source.byteLength
          ).toString("utf8")
        : String(result.source);

  let patchedSource = source;
  if (url.endsWith(AST_PATCHER_PATH)) {
    patchedSource = source
        .replace(ORIGINAL_MATCHES, PATCHED_MATCHES)
        .replace(ORIGINAL_RETURN, PATCHED_RETURN);
    console.log(`[AST Patch] Patched AST_PATCHER_PATH: ${patchedSource !== source}`);
  } else if (url.endsWith(CREATE_SERVER_BUNDLE_PATH)) {
    patchedSource = source
          .replace(ORIGINAL_SERVER_EXTERNALS, PATCHED_SERVER_EXTERNALS)
          .replace(BUILD_LAMBDA_MARKER, `${AST_GREP_STUB}${BUILD_LAMBDA_MARKER}`);
    console.log(`[AST Patch] Patched CREATE_SERVER_BUNDLE_PATH: ${patchedSource !== source}`);
  } else if (url.endsWith(CLOUDFLARE_CREATE_SERVER_BUNDLE_PATH)) {
    patchedSource = source
            .replace(
              ORIGINAL_CLOUDFLARE_SERVER_EXTERNALS,
              PATCHED_CLOUDFLARE_SERVER_EXTERNALS
            )
            .replace(BUILD_LAMBDA_MARKER, `${AST_GREP_STUB}${BUILD_LAMBDA_MARKER}`);
    console.log(`[AST Patch] Patched CLOUDFLARE_CREATE_SERVER_BUNDLE_PATH: ${patchedSource !== source}`);
  } else if (url.endsWith(BUNDLE_NEXT_SERVER_PATH)) {
    patchedSource = source.replace(
      ORIGINAL_NEXT_SERVER_EXTERNALS,
      PATCHED_NEXT_SERVER_EXTERNALS
    );
    console.log(`[AST Patch] Patched BUNDLE_NEXT_SERVER_PATH: ${patchedSource !== source}`);
  } else {
    patchedSource = source.replaceAll(
            "function requirePage($PAGE, $DIST_DIR, $IS_APP_PATH)",
            "async function requirePage($PAGE, $DIST_DIR, $IS_APP_PATH)"
          );
    console.log(`[AST Patch] Patched DYNAMIC_REQUIRES_PATH: ${patchedSource !== source}`);
  }

  return {
    ...result,
    source: patchedSource,
  };
}
