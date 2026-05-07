const AST_PATCHER_PATH = "/@opennextjs/aws/dist/build/patch/astCodePatcher.js";
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

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);

  if (!url.endsWith(AST_PATCHER_PATH) || result.source == null) {
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

  const patchedSource = source
    .replace(ORIGINAL_MATCHES, PATCHED_MATCHES)
    .replace(ORIGINAL_RETURN, PATCHED_RETURN);

  return {
    ...result,
    source: patchedSource,
  };
}
