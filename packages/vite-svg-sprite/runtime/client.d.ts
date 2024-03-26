declare module '*.svg?symbol' {
  import type BrowserSpriteSymbol from "svg-baker-runtime/src/browser-symbol"
  const src: BrowserSpriteSymbol
  export default src
}