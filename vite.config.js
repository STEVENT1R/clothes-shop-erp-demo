import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'نظام إدارة متجر الملابس',
        short_name: 'متجر الملابس',
        description: 'ERP نظام إدارة متجر الملابس',
        start_url: '/clothes-shop-erp-demo/',
        display: 'standalone',
        background_color: '#0f0f23',
        theme_color: '#6C5CE7',
        orientation: 'any',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: '/clothes-shop-erp-demo/icons-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/clothes-shop-erp-demo/icons-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  base: '/clothes-shop-erp-demo/',
})
