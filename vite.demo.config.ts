import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  root: 'demo',
  build: {
    outDir: '../dist-demo',
  },
  server: {
    port: 3000,
    open: true,
  },
})
