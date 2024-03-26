import type { SpriteSymbol } from "svg-mixer";
import { stringify } from "./utils";
// import { resolve, dirname } from "node:path";
// import { fileURLToPath } from 'node:url';

export default async function runtimeGenerator(symbol: SpriteSymbol) {
  // const spriteModuleImport = resolve(dirname(fileURLToPath(import.meta.url)), './runtime/browser-sprite')
  // console.log(import.meta.resolve('../runtime/browser-sprite'))
  const content = await symbol.render();

  const runtime = [
    `import SpriteSymbol from 'svg-baker-runtime/src/browser-symbol'`,
    `import sprite from 'vite-svg-sprite/runtime/browser-sprite'`,

    `const symbol = new SpriteSymbol(${stringify({
      id: symbol.id,
      viewBox: symbol.viewBox,
      content
    })})`,
    'sprite.add(symbol)',

    `export default symbol`
  ].join(';\n');

  return runtime;
}

export type RuntimeGenerator = typeof runtimeGenerator

