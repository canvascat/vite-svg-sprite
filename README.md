# vite-svg-sprite

> Used to generate svg sprite map for vite.

<p align="center">
  <a href="https://www.npmjs.com/package/vite-svg-sprite" rel="nofollow">
    <img alt="downloads" src="https://img.shields.io/npm/dt/vite-svg-sprite.svg">
  </a>
  <a href="https://www.npmjs.com/package/vite-svg-sprite" rel="nofollow">
    <img alt="npm version" src="https://img.shields.io/npm/v/vite-svg-sprite.svg" style="max-width:100%;">
  </a>
  <a href="https://github.com/canvascat/vite-svg-sprite/blob/main/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" style="max-width:100%;">
  </a>
</p>

## Motivation

- Migrating from webpack [svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader) to Vite doesn't work perfectly with [vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons)

## Usage

```sh
npm add vite-svg-sprite
```

```ts
// vite.config.ts
import { createSVGSpritePlugin } from "vite-svg-sprite";

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // ...other plugins
    createSVGSpritePlugin(/* options */),
  ],
});
```

webpack to vite

```js
const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

/** @type {import("webpack").Configuration} */
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        include: [resolveApp("src/assets/icon/svg")],
        exclude: [resolveApp("src/assets/icon/svg/colored")],
        use: [
          { loader: "svg-sprite-loader", options: { symbolId: "[name]" } },
          {
            loader: "svgo-loader",
            options: {
              plugins: [
                { name: "removeAttrs", params: { attrs: "fill" } },
                { name: "removeTitle" },
              ],
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        include: [resolveApp("src/assets/icon/svg/colored")],
        use: [
          { loader: "svg-sprite-loader", options: { symbolId: "[name]" } },
          {
            loader: "svgo-loader",
            options: { plugins: [{ name: "removeTitle" }] },
          },
        ],
      },
    ],
  },
};
```

```ts
import svgo from "svgo";
import { defineConfig } from "vite";
import { createSVGSpritePlugin } from "vite-svg-sprite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createSVGSpritePlugin({
      include: resolveApp("src/assets/icon/svg/**/*.svg"),
      exclude: resolveApp("src/assets/icon/svg/colored/**/*.svg"),
      optimize: (content) =>
        svgo.optimize(content, {
          plugins: [
            { name: "removeAttrs", params: { attrs: "fill" } },
            { name: "removeTitle" },
          ],
        }).data,
    }),
    createSVGSpritePlugin({
      include: resolveApp("src/assets/icon/svg/colored/**/*.svg"),
      optimize: (content) =>
        svgo.optimize(content, {
          plugins: [{ name: "removeTitle" }],
        }).data,
    }),
  ],
});
```

```ts
const requireAll = (context: __WebpackModuleApi.RequireContext) =>
  context.keys().map(context);
const iconContext = require.context("./assets/icon", true, /\.svg$/);
requireAll(iconContext);

import.meta.glob("./assets/icon/**/*.svg", { eager: true });
```

or [@see](https://github.com/canvascat/vite-svg-sprite/blob/main/packages/playground/vite.config.ts)

## Options

```ts
interface SVGSpritePluginOptions {
  // **/*.svg?symbol
  include?: FilterPattern;
  exclude?: FilterPattern;
  symbolId?:
    | string
    | ((content: string, id: string) => string | Promise<string>);
  optimize?: (content: string, id: string) => string | Promise<string>;
}
```
