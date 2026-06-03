import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/tennis/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // No precaching — always fetch fresh from network, fall back to cache when offline
        globPatterns: [],
        // Disable the auto-injected NavigationRoute (which requires a precached index.html).
        // Navigation requests fall through to the NetworkFirst rule below instead.
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /\/tennis\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/calendar\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'calendar-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 } },
          },
        ],
      },
      manifest: {
        name: 'Tennis Coach · Martina',
        short_name: 'Martina',
        description: 'Court-side CRM and lesson planner for tennis coach Martina Gledacheva',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/tennis/',
        scope: '/tennis/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
});
