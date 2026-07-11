import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serví projekt na /habit-coach/ — workflow nastaví BASE_PATH
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Habitnaut',
        short_name: 'Habitnaut',
        description: 'Deník návyků nad git repem',
        lang: 'cs',
        shortcuts: [
          { name: 'Dnešní check-in', url: './#today', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Historie', url: './#history', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
        ],
        display: 'standalone',
        theme_color: '#f3eedd',
        background_color: '#f3eedd',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
