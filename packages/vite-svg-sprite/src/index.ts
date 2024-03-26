import type { Plugin } from "vite";
import { createFilter, type FilterPattern } from "@rollup/pluginutils";
import { readFile } from "node:fs/promises";
import { Compiler } from "svg-mixer";
import { getHash, cleanUrl, interpolateName } from "./utils";
import runtimeGenerator from "./runtime-generator";

export interface SVGSpritePluginOptions {
  filter?: (id: string) => boolean;
  symbolId?: string | ((content: string, id: string) => string | Promise<string>);
  optimize?: (content: string, id: string) => string | Promise<string>;
}

// TODO 完善其他钩子
// https://github.com/vitejs/vite/blob/cdc664d4ea98d5373c3ceb2213771f1dfa4bb457/packages/vite/src/node/plugins/asset.ts#L148
export function createSVGSpritePlugin(
  config: SVGSpritePluginOptions = {}
): Plugin {
  /** hash -> runtime */
  const cache = new Map<string, string>();
  const compiler = new Compiler();
  const {
    optimize,
    filter = createFilter("**/*.svg?symbol"),
    symbolId = "[name]"
  } = config;

  return {
    name: "vite:svg-sprite",
    enforce: "pre", // to override `vite:asset`'s behavior
    async load(id) {
      if (!filter(id)) return;

      const file = cleanUrl(id);
      let content = await readFile(file, "utf-8");
      const hash = getHash(`${id}\n${content}`, "sha256");
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (cache.has(hash)) return { code: cache.get(hash)!, map: null };
      if (optimize) content = await optimize(content, id);
      const useId =
        typeof symbolId === "function"
          ? await symbolId(content, id)
          : interpolateName(id, symbolId, content);
      const symbol = compiler.createSymbol({ id: useId, content, path: file });
      compiler.addSymbol(symbol);
      const runtime = await runtimeGenerator(symbol);
      cache.set(hash, runtime);

      return { code: runtime, map: null };
    },
  };
}

export { createFilter, type FilterPattern }

export default createSVGSpritePlugin;
