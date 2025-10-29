import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    target: 'es2015',   // ép dev mode xuống ES2017 (Firefox support tốt)
  },
  build: {
    target: 'es2015'
  },
  server: {
    proxy: {
      '/meshy': {
        target: 'https://assets.meshy.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/meshy/, ''),
      },
    },
    allowedHosts: ['rev-mines-sharon-ellen.trycloudflare.com'],
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
})
