import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served from "/" locally and (e.g.) "/smart-notes/" on GitHub Pages.
// The deploy workflow sets VITE_BASE; must start and end with a slash.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-icon.png'],
      manifest: {
        name: 'Smart Notes',
        short_name: 'Notes',
        description: 'A fast offline smart notes app',
        id: base,
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fff9db',
        theme_color: '#facc15',
        orientation: 'portrait-primary',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/maskable-icon.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell precache; note data lives in IndexedDB and is never cached here.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});
