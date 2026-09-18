import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Njinji Career Guidance — Khetha NCAP',
        short_name: 'Khetha NCAP',
        description: 'A DHET Khetha NCAP career guidance companion — subject choice, APS, courses, mentors and advice.',
        theme_color: '#005A36',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precaches the built app shell (JS/CSS/HTML/images) so the app still
        // loads offline. Deliberately does NOT add runtime caching rules for
        // /api/* — this app already has its own explicit, opt-in offline data
        // strategy (IndexedDB, see services/idb.js and the "Save for offline
        // viewing" setting); letting the service worker also cache API
        // responses would silently serve stale personal data instead of the
        // real backend's current state, which is exactly what this app has
        // spent this whole build steering away from.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true, // listen on 0.0.0.0 so other devices on the LAN can reach the dev server
  },
});
