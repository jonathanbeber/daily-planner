import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/daily-planner/' : '/',
  plugins: [react()],
  server: {
    allowedHosts: ['wtib2.preview.codesignalusercontent-staging.com']
  }
})
