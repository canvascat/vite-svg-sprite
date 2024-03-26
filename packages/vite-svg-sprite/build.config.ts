import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index', {
    input: './runtime/browser-sprite',
    outDir: './dist/runtime'
  }],
  declaration: true,
  rollup: {
    emitCJS: true
  },
  externals: ['vite'],
})
