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
pnpm add vite-svg-sprite
```

```ts
// vite.config.ts
import { createSvgSpritePlugin } from 'vite-svg-sprite'

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // ...other plugins
    createSvgSpritePlugin(/* options */),
  ],
})
```

or [@see](https://github.com/canvascat/vite-svg-sprite/blob/dev/packages/playground/vite.config.ts)

## Options

- [@see](https://github.com/canvascat/vite-svg-sprite/blob/dev/packages/core/src/typing.ts)
