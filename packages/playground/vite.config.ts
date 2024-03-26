import svgo from 'svgo';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import SVGSprite from 'vite-svg-sprite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [SVGSprite({
    optimize: (content) => svgo.optimize(content, {
      plugins: [{
        name: 'removeAttrs',
        params: { attrs: 'fill' },
      }]
    }).data,
  }), react()],
  server: {
    open: true,
  },
})
