import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /daily-planner/; local dev stays at /
  base: process.env.GITHUB_ACTIONS ? '/daily-planner/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Daily Planner',
        short_name: 'Planner',
        description: 'Day timeline, category goals, todos and habit streaks. Data stays on your device.',
        theme_color: '#f4f1ea',
        background_color: '#f4f1ea',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: ['wtib2.preview.codesignalusercontent-staging.com']
  }
})
