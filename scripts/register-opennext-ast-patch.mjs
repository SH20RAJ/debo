import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./scripts/opennext-ast-patch-loader.mjs", pathToFileURL("./"));
