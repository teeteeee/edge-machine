import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Dev: `npm run dev` proxies /api to the Python server on :8787.
// Prod: `npm run build` → dist/, served by app.py.
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: { '/api': 'http://localhost:8787' } },
})
