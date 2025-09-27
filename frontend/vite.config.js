import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/mysteryverse/' : '/'),
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3333'
    }
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3333')
  }
})