import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgSpritePlugin } from 'vite-svg-sprite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgSpritePlugin([
      {
        iconDirs: {
          cwd: resolve(process.cwd(), 'src/assets/icons'),
          ignore: ['color'],
        },
        symbolId: '[dir]-[name]',
        svgoOptions: {
          plugins: [
            'removeMetadata',
            'removeTitle',
            'removeDesc',
            { name: 'removeAttrs', params: { attrs: 'fill' } },
          ],
        },
      },
      {
        iconDirs: resolve(process.cwd(), 'src/assets/icons/color'),
        svgoOptions: {
          plugins: ['removeMetadata', 'removeTitle', 'removeDesc'],
        },
      },
    ]),
  ],
  server: {
    port: 8080,
    open: true,
  },
})
