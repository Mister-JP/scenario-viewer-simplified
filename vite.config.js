import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['lit-html', 'nanostores', 'motion']
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true
  },
  server: {
    fs: {
      strict: false
    }
  }
})